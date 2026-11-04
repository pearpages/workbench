// Turn every unchecked `- [ ]` item in each repo's tasks.md (read from GitHub, default
// branch) into an issue, and add it to the Backlog project.
// Idempotent (P1): each issue body carries a hidden marker; items that already have an
// issue are skipped (but still added to Backlog).
//   npx tsx scripts/migrate-tasks.ts                  # dry run, all repos
//   npx tsx scripts/migrate-tasks.ts --only xray      # dry run, one repo
//   npx tsx scripts/migrate-tasks.ts --apply          # write to GitHub
import { createHash } from "node:crypto";
import { dryRun, gh, ghJson, readYaml, requireProjectScope } from "./lib.ts";

const OWNER = "@me";
const PROJECT = "Backlog";

type Task = { title: string; body: string; section: string; labels: string[]; marker: string };

// First matching rule wins. No match → no type label: triage it on the board.
const TYPE_RULES: [RegExp, string][] = [
  [/\b(fix|bug|broken|fails?|never|wrong|misses|regression|leak)\b/i, "type:bug"],
  [/\b(docs?|readme|document|write-?up)\b/i, "type:docs"],
  [/\b(bump|upgrade|dependenc\w*|ci|lint|refactor|clean ?up|migrat\w*|remove|rename)\b/i, "type:chore"],
];

function typeLabel(text: string): string | undefined {
  const prose = text.replace(/`[^`]*`/g, ""); // ignore code spans like `ISSUE_TEMPLATE/bug.yml`
  return TYPE_RULES.find(([re]) => re.test(prose))?.[1];
}

/** Cut at the first ". ", " — ", ": " or "; " that leaves at least 20 characters. */
function firstPhrase(s: string): string {
  const cut = [...s.matchAll(/\.\s|\s—\s|:\s|;\s/g)].find((m) => m.index! >= 20);
  return cut ? s.slice(0, cut.index) : s;
}

function makeTitle(text: string): string {
  const line = text.split("\n")[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/`/g, "");
  const bold = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  let title: string;
  if (bold && bold[1].replace(/[.:]$/, "").length >= 12) title = bold[1];
  else if (bold) title = firstPhrase(`${bold[1]} ${bold[2]}`); // "**D2** Reliable…" → "D2 Reliable…"
  else title = firstPhrase(line);
  title = title.replace(/\*\*/g, "").replace(/[.:]$/, "").trim();
  if (title.length > 90) title = title.slice(0, 90).replace(/\s+\S*$/, "") + "…";
  return title;
}

/** Parse unchecked items, skipping Done/Fet sections. */
export function parseTasks(md: string): Task[] {
  const tasks: Task[] = [];
  const lines = md.split("\n");
  let h2 = "";
  let h3 = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) { h2 = line.slice(3).trim(); h3 = ""; continue; }
    if (line.startsWith("### ")) { h3 = line.slice(4).trim(); continue; }
    if (/^(done|fet|hecho)\b/i.test(h2)) continue;
    const m = line.match(/^- \[ \] (.*)$/);
    if (!m) continue;

    const parts = [m[1]];
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim());
    const text = parts.join("\n");
    const section = h3 || h2;

    const type = typeLabel(m[1].split(/(?<=\.)\s/)[0]);
    const labels = type ? [type] : [];
    if (/priority/i.test(section)) labels.push("priority:high");

    const marker = `<!-- backlog: tasks.md#${createHash("sha1").update(m[1]).digest("hex").slice(0, 10)} -->`;
    const body = `${text}\n\n---\nMigrated from \`tasks.md\` (section: ${section}).\n${marker}`;
    tasks.push({ title: makeTitle(text), body, section, labels, marker });
  }
  return tasks;
}

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

requireProjectScope();

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
const repos = readYaml<string[]>("repos.yml").filter((r) => !only || r.endsWith(`/${only}`));

const { projects } = ghJson<{ projects: { number: number; title: string }[] }>([
  "project", "list", "--owner", OWNER, "--format", "json", "--limit", "100",
]);
const project = projects.find((p) => p.title === PROJECT);
if (!project) {
  console.error(`Project "${PROJECT}" not found. Run scripts/setup-project.ts --apply first.`);
  process.exit(1);
}
const num = String(project.number);

const deletable: string[] = [];
let created = 0;
let skipped = 0;

for (const repo of repos) {
  let md: string;
  try {
    md = gh(["api", `repos/${repo}/contents/tasks.md`, "-H", "Accept: application/vnd.github.raw"]);
  } catch {
    console.log(`\n${repo}: no tasks.md, skipped`);
    continue;
  }
  const tasks = parseTasks(md);
  const issues = ghJson<{ body: string; url: string }[]>([
    "issue", "list", "--repo", repo, "--state", "all", "--limit", "1000", "--json", "body,url",
  ]);

  console.log(`\n${repo}: ${tasks.length} item(s)`);
  for (const t of tasks) {
    const existing = issues.find((i) => i.body.includes(t.marker));
    if (existing) {
      skipped++;
      console.log(`  ✓ exists  ${t.title}`);
      if (!dryRun) gh(["project", "item-add", num, "--owner", OWNER, "--url", existing.url]);
      continue;
    }
    created++;
    const line = `[${t.labels.join(", ") || "-"}] ${t.title}`;
    if (dryRun) {
      console.log(`  + ${line}`);
      continue;
    }
    const url = gh([
      "issue", "create", "--repo", repo, "--title", t.title, "--body", t.body,
      ...t.labels.flatMap((l) => ["--label", l]),
    ]).trim();
    gh(["project", "item-add", num, "--owner", OWNER, "--url", url]);
    console.log(`  + ${line} → ${url}`);
    sleep(1000); // stay under GitHub's content-creation rate limit
  }
  if (tasks.length) deletable.push(repo);
}

console.log(`\n${dryRun ? "[dry run] would create" : "Created"} ${created} issue(s); ${skipped} already existed.`);
if (!dryRun && deletable.length) {
  console.log(`Every open item now has an issue in Backlog. tasks.md can be deleted (or trimmed to Done) in:`);
  for (const r of deletable) console.log(`  ${r}`);
}
