# Architecture

How workbench is built. It explains *how* things work. The rules that follow from it are in
[principles.md](principles.md), the reasons for each choice in
[decisions.md](decisions.md), the security surface in [security.md](security.md), and open
work in [GitHub Issues](https://github.com/pearpages/workbench/issues). When code and this file disagree, the code is right and this
file is a bug.

## Shape

workbench is a config and scripts repo, not an app. It ships nothing; people copy it.
The scripts are TypeScript run with `tsx` (or bash) and call the `gh` CLI. They configure
a user-level GitHub Project called **Backlog** and the repositories it tracks.
Status: labels, issue templates and the shared script helpers exist; the scripts are next.

## Modules

| Path | Owns |
|---|---|
| `labels.yml` | Label set: `type:bug\|feature\|chore\|docs`, `priority:high\|med\|low`, `area:ui\|api\|infra\|dx` |
| `repos.yml` | The repos Backlog tracks (picked from `gh repo list --limit 100`) |
| `.github/ISSUE_TEMPLATE/{bug,feature,chore}.yml` | Issue forms to copy into the tracked repos |
| `scripts/lib.ts` | Shared helpers: `gh` calls with argument arrays (no shell, two retries on a GitHub 502/503/504), the `project` scope check, and dry run unless `--apply` |
| `scripts/setup-project.ts` | Find or create Backlog (no custom fields: priority is a label, ADR 0003) |
| `scripts/sync-labels.ts` | Apply `labels.yml` to every repo in `repos.yml` (create/update, never delete) |
| `scripts/migrate-tasks.ts` | `tasks.md` → issues: each unchecked item outside Done becomes an issue with a hidden `<!-- backlog: tasks.md#hash -->` marker, so re-runs skip it |
| `scripts/add-to-board.ts` | The sweep: puts every open issue from `repos.yml` on Backlog, for repos without an auto-add workflow |

## Data flow

1. **Project setup:** `gh project` finds or creates the project "Backlog" (owner `@me`;
   private by default — the script never changes visibility). It adds no custom fields:
   priority is a `priority:*` label on the issue (ADR 0003). Status comes built in.
2. **Labels:** `sync-labels` reads `labels.yml` and `repos.yml`, then creates or updates each
   label in each repo.
3. **Migration:** for each repo in `repos.yml`, the script reads `tasks.md`, turns each item
   into an issue (title, body, labels) and prints a dry run. After you confirm, it creates the
   issues, adds them to Backlog, and reports which `tasks.md` files can be deleted.
4. **Manual (UI only, no API):** views (a Board by Status, a Table by Repository, and a
   "Now" view of In Progress items labelled `priority:high`) and workflows (auto-add new
   issues; set Done when an issue is closed or its PR is merged). The README lists these steps.
   GitHub allows 5 auto-add workflows on this plan: fourpass, futbol-manager, pulp, modals and
   xray have one.
5. **Sweep:** `add-to-board` lists the open issues of every repo in `repos.yml` and adds the
   ones that are not on Backlog yet. It covers the other repos, and issues opened with
   `gh issue create`. Run it at the end of a session.

State lives on GitHub only. The repo itself holds only config.

## Build, test, deploy

No build step. Node is pinned in `mise.toml`. Scripts run with `npx tsx scripts/<name>.ts`
(a dry run), or with `--apply` to write. `npm run typecheck` runs `tsc --noEmit`.
Testing is a dry run followed by a second run that must be a no-op (P1). The repo is
published to `github.com/pearpages/workbench`; there is no CI yet.
