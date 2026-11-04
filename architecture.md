# Architecture

How workbench is built. It explains *how* things work. The rules that follow from it are in
[principles.md](principles.md), the reasons for each choice in
[decisions.md](decisions.md), the security surface in [security.md](security.md), and open
work in [tasks.md](tasks.md). When code and this file disagree, the code is right and this
file is a bug.

## Shape

workbench is a config and scripts repo, not an app. It ships nothing; people copy it.
The scripts are TypeScript run with `tsx` (or bash) and call the `gh` CLI. They configure
a user-level GitHub Project called **Backlog** and the repositories it tracks.
Status: planned. Only the knowledge files exist so far.

## Modules

| Path | Owns |
|---|---|
| `labels.yml` | Label set: `type:bug\|feature\|chore\|docs`, `priority:high\|med\|low`, `area:ui\|api\|infra\|dx` |
| `repos.yml` | The repos Backlog tracks (picked from `gh repo list --limit 100`) |
| `.github/ISSUE_TEMPLATE/{bug,feature,chore}.yml` | Issue forms to copy into the tracked repos |
| `scripts/` | Project setup (Backlog + Priority H/M/L and Size S/M/L single-select fields), `sync-labels`, and the `tasks.md` → issues migration |

## Data flow

1. **Project setup:** `gh project` finds or creates the public project "Backlog" (owner
   `@me`) and its Priority and Size fields. Status comes built in.
2. **Labels:** `sync-labels` reads `labels.yml` and `repos.yml`, then creates or updates each
   label in each repo.
3. **Migration:** for each repo in `repos.yml`, the script reads `tasks.md`, turns each item
   into an issue (title, body, labels) and prints a dry run. After you confirm, it creates the
   issues, adds them to Backlog, and reports which `tasks.md` files can be deleted.
4. **Manual (UI only, no API):** views (a Board by Status, a Table by Repository, and a
   "Now" view of In Progress items labelled `priority:high`) and workflows (auto-add new
   issues; set Done when an issue is closed or its PR is merged). The README lists these steps.

State lives on GitHub only. The repo itself holds only config.

## Build, test, deploy

No build step. Scripts run with `npx tsx scripts/<name>.ts` (TODO: confirm once written).
Testing is a dry run followed by a second run that must be a no-op (P1). The repo is
published to `github.com/pearpages/workbench`; there is no CI yet.
