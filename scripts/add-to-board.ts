// Put every open issue from the repos in repos.yml on the Backlog board.
// Covers the repos without an auto-add workflow (GitHub allows 5 on this plan).
// Idempotent (P1): issues already on the board are skipped.
//   npx tsx scripts/add-to-board.ts           # dry run
//   npx tsx scripts/add-to-board.ts --apply   # write to GitHub
import { ghJson, readYaml, requireProjectScope, write } from "./lib.ts";

const OWNER = "@me";
const PROJECT = "Backlog";

requireProjectScope();

const { projects } = ghJson<{ projects: { number: number; title: string }[] }>([
  "project", "list", "--owner", OWNER, "--format", "json", "--limit", "100",
]);
const project = projects.find((p) => p.title === PROJECT);
if (!project) {
  console.error(`Project "${PROJECT}" not found. Run scripts/setup-project.ts --apply first.`);
  process.exit(1);
}
const num = String(project.number);

const { items } = ghJson<{ items: { content?: { url?: string } }[] }>([
  "project", "item-list", num, "--owner", OWNER, "--format", "json", "--limit", "5000",
]);
const onBoard = new Set(items.map((i) => i.content?.url).filter(Boolean));

let added = 0;
for (const repo of readYaml<string[]>("repos.yml")) {
  const issues = ghJson<{ url: string; title: string }[]>([
    "issue", "list", "--repo", repo, "--state", "open", "--limit", "1000", "--json", "url,title",
  ]);
  for (const issue of issues.filter((i) => !onBoard.has(i.url))) {
    added++;
    write(`Add ${issue.url} (${issue.title})`, [
      "project", "item-add", num, "--owner", OWNER, "--url", issue.url,
    ]);
  }
}

console.log(added ? `${added} issue(s) not on ${PROJECT} yet.` : `✓ Every open issue is on ${PROJECT}.`);
