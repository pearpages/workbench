// Find or create the user-level project "Backlog".
// No custom fields: priority lives in `priority:*` labels on the issues (ADR 0003).
// Visibility is left alone: new projects are private; change it in the UI if you want.
// Idempotent (P1): an existing project is reported, never recreated.
//   npx tsx scripts/setup-project.ts           # dry run
//   npx tsx scripts/setup-project.ts --apply   # write to GitHub
import { ghJson, requireProjectScope, write } from "./lib.ts";

const OWNER = "@me";
const TITLE = "Backlog";

type Project = { number: number; title: string; public: boolean; url: string };

requireProjectScope();

const { projects } = ghJson<{ projects: Project[] }>([
  "project", "list", "--owner", OWNER, "--format", "json", "--limit", "100",
]);
const project = projects.find((p) => p.title === TITLE);

if (project) {
  console.log(`✓ Project "${TITLE}" exists: ${project.url}`);
  console.log(`  Visibility: ${project.public ? "public" : "private"}`);
} else {
  write(`Create project "${TITLE}"`, ["project", "create", "--owner", OWNER, "--title", TITLE]);
}
