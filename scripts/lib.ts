// Shared helpers for the scripts. Every GitHub call goes through `gh` (P3),
// with arguments passed as an array and never through a shell string (security.md).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

/** True unless the script was run with --apply (P2: dry run by default). */
export const dryRun = !process.argv.includes("--apply");

/** Run `gh` and return its stdout. */
export function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" });
}

/** Run `gh` and parse its JSON stdout. */
export function ghJson<T>(args: string[]): T {
  return JSON.parse(gh(args)) as T;
}

/** Stop unless the token has the `project` scope (P3). */
export function requireProjectScope(): void {
  const headers = gh(["api", "-i", "/user"]);
  const line = headers.split("\n").find((l) => /^x-oauth-scopes:/i.test(l)) ?? "";
  const scopes = line.slice(line.indexOf(":") + 1).split(",").map((s) => s.trim());
  if (!scopes.includes("project")) {
    console.error("Missing the `project` scope. Run: gh auth refresh -s project");
    process.exit(1);
  }
}

/** Read and parse a YAML file. */
export function readYaml<T>(path: string): T {
  return parse(readFileSync(path, "utf8")) as T;
}

/** Print what a write would do, or do it when --apply is set. */
export function write(description: string, args: string[]): void {
  if (dryRun) {
    console.log(`[dry run] ${description}`);
    return;
  }
  console.log(description);
  gh(args);
}
