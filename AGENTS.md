# workbench

workbench is the reusable setup for **Backlog**, a GitHub Project owned by a user
(`@me`) that tracks work across repositories and replaces each repo's `tasks.md` with GitHub
Issues. It holds labels, issue templates and small idempotent scripts (driven by the `gh` CLI)
that create the project, sync labels to selected repos, and migrate `tasks.md`
items into issues. It is published as `pearpages/workbench` so others can copy it.

## Project documents — read before working

| File | Holds |
|---|---|
| [principles.md](principles.md) | The rules every change must follow |
| [architecture.md](architecture.md) | How the project is built: modules, data flow, build, deploy |
| [decisions.md](decisions.md) | Index of ADRs in `docs/adr/`: why each choice was made |
| [Issues](https://github.com/pearpages/workbench/issues) | Open work, also on the [Backlog](https://github.com/users/pearpages/projects/3) board. Closed issues and git are the record of what was done |
| [security.md](security.md) | Threat surface, secrets, dependency policy, how to report a vulnerability |
| [LICENSE](LICENSE) | MIT |

[README.md](README.md) is the user-facing entry point.

## Working rules

1. **Read `principles.md` before changing code or docs.** If a change would break a
   principle, stop and ask; don't work around it.
2. **Work is tracked in GitHub Issues**, not in a file. New work → `gh issue create` with
   `type:*`, `priority:*` and `area:*` labels. Finished work → close the issue from the commit
   or PR (`Fixes #N`).
3. **A structural or behavioural change updates `architecture.md` in the same commit**, and
   the README too when users can see it.
4. **A choice between real alternatives** (API shape, dependency, convention, process) gets
   a new ADR in `docs/adr/` plus a line in `decisions.md`. Propose it to the user before
   marking it Accepted. Never edit an accepted ADR; supersede it with a new one.
5. **Anything touching auth, secrets, input handling or dependencies is checked against
   `security.md`**, and updates it when the surface changes.
6. **At the end of a session, outcomes go to those files, not here.** This file keeps only
   how to work and pointers — never a session log.
7. Confirm before anything outward-facing: pushes, releases, publishing, deploys — and any
   script run that writes to GitHub (issues, labels, project fields) or deletes files.

## Development commands

- `gh auth status`: check you are logged in and that the token has the `project` scope. If
  it doesn't, run `gh auth refresh -s project`.
- `npm install`: install `tsx`, `typescript` and `yaml` (Node is pinned in `mise.toml`).
- `npm run typecheck`: type-check `scripts/` once (no watch).
- `npx tsx scripts/<name>.ts`: dry run (prints what it would do). Add `--apply` to write to
  GitHub, and only after the user confirms (P2).
- `npx tsx scripts/setup-project.ts [--apply]`: find or create the Backlog project.
- `npx tsx scripts/sync-labels.ts [--apply]`: apply `labels.yml` to every repo in
  `repos.yml` (create/update only, never delete).
- `npx tsx scripts/migrate-tasks.ts [--only <repo>] [--apply]`: turn each repo's open
  `tasks.md` items into issues and add them to Backlog.
- `npx tsx scripts/add-to-board.ts [--apply]`: put every open issue from `repos.yml` on
  Backlog (the sweep for repos without auto-add). Run it at the end of a session.
- `npx tsx scripts/sweep-standard.ts [--changes <file>] [--apply]`: file or update one
  "Upgrade to craft knowledge standard vN" issue in every repo that is behind craft's standard
  (pearpages/craft ADR-0003). `--changes` reads a local `standard-changes.md` before craft is pushed.

## Pitfalls that have bitten before

- `node` fails with "No version is set for shim" → mise has no global Node version → this
  repo pins it in `mise.toml`; run `mise install`.
