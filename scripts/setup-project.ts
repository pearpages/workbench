// Find or create the user-level project "Backlog" and its Priority and Size fields.
// Visibility is left alone: new projects are private; change it in the UI if you want.
// Idempotent (P1): existing items are reported, never recreated.
//   npx tsx scripts/setup-project.ts           # dry run
//   npx tsx scripts/setup-project.ts --apply   # write to GitHub
import { dryRun, ghJson, requireProjectScope, write } from "./lib.ts";

const OWNER = "@me";
const TITLE = "Backlog";
const FIELDS: Record<string, string[]> = {
  Priority: ["High", "Med", "Low"],
  Size: ["S", "M", "L"],
};

type Project = { number: number; title: string; public: boolean; url: string };
type Field = { name: string; type: string; options?: { name: string }[] };

function findProject(): Project | undefined {
  const { projects } = ghJson<{ projects: Project[] }>([
    "project", "list", "--owner", OWNER, "--format", "json", "--limit", "100",
  ]);
  return projects.find((p) => p.title === TITLE);
}

requireProjectScope();

let project = findProject();
if (project) {
  console.log(`✓ Project "${TITLE}" exists: ${project.url}`);
} else {
  write(`Create project "${TITLE}"`, ["project", "create", "--owner", OWNER, "--title", TITLE]);
  project = dryRun ? undefined : findProject();
}

if (!project) {
  // Dry run with no project yet: everything below would be created.
  for (const [name, options] of Object.entries(FIELDS)) {
    console.log(`[dry run] Create field ${name} (${options.join("/")})`);
  }
  process.exit(0);
}

const num = String(project.number);

console.log(`  Visibility: ${project.public ? "public" : "private"}`);

const { fields } = ghJson<{ fields: Field[] }>([
  "project", "field-list", num, "--owner", OWNER, "--format", "json",
]);

for (const [name, options] of Object.entries(FIELDS)) {
  const existing = fields.find((f) => f.name === name);
  if (!existing) {
    write(`Create field ${name} (${options.join("/")})`, [
      "project", "field-create", num, "--owner", OWNER, "--name", name,
      "--data-type", "SINGLE_SELECT", "--single-select-options", options.join(","),
    ]);
    continue;
  }
  const have = (existing.options ?? []).map((o) => o.name).join("/");
  if (have === options.join("/")) {
    console.log(`✓ Field ${name} (${have})`);
  } else {
    // Editing options would drop values already set on items: report, don't touch.
    console.warn(`! Field ${name} exists with options "${have}", expected "${options.join("/")}". Fix it in the UI.`);
  }
}
