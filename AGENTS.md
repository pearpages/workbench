# workbench

workbench is the reusable setup for **Backlog**, a public GitHub Project owned by a user
(`@me`) that tracks work across repositories and replaces each repo's `tasks.md` with GitHub
Issues. It holds labels, issue templates and small idempotent scripts (driven by the `gh` CLI)
that create the project and its fields, sync labels to selected repos, and migrate `tasks.md`
items into issues. It is published as `pearpages/workbench` so others can copy it.

## Project documents — read before working

| File | Holds |
|---|---|
| [principles.md](principles.md) | The rules every change must follow |
| [architecture.md](architecture.md) | How the project is built: modules, data flow, build, deploy |
| [decisions.md](decisions.md) | Index of ADRs in `docs/adr/`: why each choice was made |
| [tasks.md](tasks.md) | Open work and the dated log of what was done |
| [security.md](security.md) | Threat surface, secrets, dependency policy, how to report a vulnerability |
| [LICENSE](LICENSE) | MIT |

[README.md](README.md) is the user-facing entry point.

## Working rules

1. **Read `principles.md` before changing code or docs.** If a change would break a
   principle, stop and ask; don't work around it.
2. **Every change updates `tasks.md`**: tick or add Open items, and add a dated line at the
   top of Done.
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
- TODO: list the script commands (dry run and apply) once `scripts/` exists.

## Pitfalls that have bitten before

- `node` fails with "No version is set for shim" → mise has no global Node version → pin one
  with `mise use node@<version>` in this repo (see tasks.md).
