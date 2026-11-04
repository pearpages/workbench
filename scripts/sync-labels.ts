// Apply labels.yml to every repo in repos.yml: create missing labels, update
// changed color/description. Labels not in labels.yml are left alone.
// Idempotent (P1).
//   npx tsx scripts/sync-labels.ts           # dry run
//   npx tsx scripts/sync-labels.ts --apply   # write to GitHub
import { ghJson, readYaml, write } from "./lib.ts";

type Label = { name: string; color: string; description: string };

const wanted = readYaml<Label[]>("labels.yml");
const repos = readYaml<string[]>("repos.yml");
let changes = 0;

for (const repo of repos) {
  const existing = ghJson<Label[]>([
    "label", "list", "--repo", repo, "--limit", "200", "--json", "name,color,description",
  ]);
  const byName = new Map(existing.map((l) => [l.name.toLowerCase(), l]));

  for (const label of wanted) {
    const color = label.color.toLowerCase();
    const have = byName.get(label.name.toLowerCase());
    if (!have) {
      changes++;
      write(`${repo}: create ${label.name}`, [
        "label", "create", label.name, "--repo", repo,
        "--color", color, "--description", label.description,
      ]);
    } else if (have.color.toLowerCase() !== color || have.description !== label.description) {
      changes++;
      write(`${repo}: update ${label.name}`, [
        "label", "edit", have.name, "--repo", repo,
        "--color", color, "--description", label.description,
      ]);
    }
  }
}

console.log(changes ? `${changes} change(s) across ${repos.length} repos.` : `✓ All ${repos.length} repos in sync.`);
