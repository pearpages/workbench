// File one upgrade issue in every repo of repos.yml that is behind craft's knowledge standard.
// A repo's version is the line "Knowledge standard: craft vN" in its AGENTS.md (no line: v0);
// the newest is the highest "## vN" in craft's references/standard-changes.md, read from GitHub.
// Idempotent (P1): a repo with an open upgrade issue gets that issue updated, never a second one.
//   npx tsx scripts/sweep-standard.ts           # dry run
//   npx tsx scripts/sweep-standard.ts --apply   # create/update issues and put them on Backlog
//   --changes <file>  read the versions from a local standard-changes.md (before craft is pushed)
//   --only <repo>     sweep one repo of repos.yml (owner/name, or just the name)
import { readFileSync } from "node:fs";
import { addToProject, dryRun, gh, ghJson, readYaml, requireProjectScope } from "./lib.ts";

const STANDARD_REPO = "pearpages/craft";
const CHANGES_PATH = "plugins/craft/references/standard-changes.md";
const TITLE_PREFIX = "Upgrade to craft knowledge standard";
const LABELS = ["type:chore", "priority:low", "area:dx"];
const OWNER = "@me";
const PROJECT = "Backlog";

/** A file's text on the repo's default branch, or null when it doesn't exist. */
function rawFile(repo: string, path: string): string | null {
  try {
    return gh(["api", `repos/${repo}/contents/${path}`, "-H", "Accept: application/vnd.github.raw"]);
  } catch (error) {
    if (String((error as { stderr?: unknown }).stderr ?? "").includes("404")) return null;
    throw error;
  }
}

const changesArg = process.argv.indexOf("--changes");
const changes = changesArg > 0 ? readFileSync(process.argv[changesArg + 1], "utf8") : rawFile(STANDARD_REPO, CHANGES_PATH);
if (!changes) {
  console.error(`Can't read ${CHANGES_PATH} from ${STANDARD_REPO}.`);
  process.exit(1);
}
// Split into versions: "## vN — date" heading, then its body up to the next heading.
const versions = [...changes.matchAll(/^## v(\d+)\b[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)].map((m) => ({
  n: Number(m[1]),
  heading: m[0].split("\n")[0].slice(3),
  body: m[2].trim(),
}));
const current = Math.max(...versions.map((v) => v.n));

let boardNumber: string | null = null;
if (!dryRun) {
  requireProjectScope();
  const { projects } = ghJson<{ projects: { number: number; title: string }[] }>([
    "project", "list", "--owner", OWNER, "--format", "json", "--limit", "100",
  ]);
  const found = projects.find((p) => p.title === PROJECT);
  boardNumber = found ? String(found.number) : null;
}

let behind = 0;
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > 0 ? process.argv[onlyArg + 1] : null;
const repos = readYaml<string[]>("repos.yml").filter((r) => !only || r === only || r.endsWith(`/${only}`));
if (only && repos.length === 0) {
  console.error(`${only} is not in repos.yml.`);
  process.exit(1);
}
for (const repo of repos) {
  if (repo === STANDARD_REPO) continue;
  const agents = rawFile(repo, "AGENTS.md");
  const version = Number(agents?.match(/Knowledge standard: craft v(\d+)/)?.[1] ?? 0);
  if (version >= current) {
    console.log(`✓ ${repo} follows v${version}`);
    continue;
  }
  behind++;
  const title = `${TITLE_PREFIX} v${current}`;
  const body = [
    `This repository follows craft's knowledge standard **v${version}**${agents ? "" : " (it has no AGENTS.md)"}; the newest is **v${current}**.`,
    "",
    "Run `/craft:scaffold check` here: it applies the changes below, then updates the `Knowledge standard` line in AGENTS.md.",
    "",
    ...versions.filter((v) => v.n > version).sort((a, b) => a.n - b.n).flatMap((v) => [`### ${v.heading}`, "", v.body, ""]),
    `Filed by workbench's \`scripts/sweep-standard.ts\` from ${STANDARD_REPO}'s \`${CHANGES_PATH}\`.`,
  ].join("\n");

  const open = ghJson<{ number: number; title: string; url: string }[]>([
    // No --search: GitHub's search index lags a fresh issue, and a quick rerun would duplicate it.
    "issue", "list", "--repo", repo, "--state", "open", "--limit", "1000", "--json", "number,title,url",
  ]).find((i) => i.title.startsWith(TITLE_PREFIX));

  if (open) {
    if (open.title === title) {
      console.log(`· ${repo} v${version} → v${current}: #${open.number} already open`);
      continue;
    }
    console.log(`${dryRun ? "[dry run] " : ""}${repo} v${version} → v${current}: update #${open.number} (${open.title})`);
    if (!dryRun) gh(["issue", "edit", String(open.number), "--repo", repo, "--title", title, "--body", body]);
    continue;
  }

  console.log(`${dryRun ? "[dry run] " : ""}${repo} v${version} → v${current}: create "${title}"`);
  if (dryRun) continue;
  const url = gh(["issue", "create", "--repo", repo, "--title", title, "--body", body, ...LABELS.flatMap((l) => ["--label", l])]).trim();
  if (boardNumber) addToProject(boardNumber, OWNER, url);
}

console.log(behind ? `${behind} repo(s) behind v${current}.` : `✓ Every repo follows v${current}.`);
