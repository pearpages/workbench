# Tasks

What's open and what's been done. Every change updates this file: tick or add an Open
item, and add a dated line at the top of **Done**.

## Open

- [ ] Scaffold the repo: `labels.yml`, `.github/ISSUE_TEMPLATE/{bug,feature,chore}.yml`, `scripts/`.
- [ ] Script: create the public project "Backlog" with Priority (High/Med/Low) and Size (S/M/L).
- [ ] Script: `sync-labels` applies `labels.yml` to the repos in `repos.yml`.
- [ ] Pick repos from `gh repo list --limit 100` → `repos.yml`.
- [ ] Migrate each repo's `tasks.md` to issues (dry run, confirm, add to Backlog, list deletable files).
- [ ] README: what Backlog is, "Make a copy", how to use this repo, manual UI steps.
- [ ] Create the public repo `pearpages/workbench` and push (confirm first).
- [ ] Manual UI: views (Board by Status, Table by Repository, "Now") and workflows (auto-add, Done on close/merge).

### Scaffold follow-ups

- [ ] **Pin a Node version** — `node` has no mise default, so scripts can't run — add `mise use node@<ver>` (`.mise.toml`).
- [ ] **Fill the README Install/Usage TODOs** — they're placeholders until the scripts exist — README.md.
- [ ] **Fill the dev commands TODO** — no scripts yet — AGENTS.md, architecture.md.
- [ ] **Enable private vulnerability reporting** — needed once the repo is public — GitHub repo settings / security.md.
- [ ] **Decide on ADR-0002** (Issues replace tasks.md) — it changes the scaffold standard; if Accepted, update ADR-0001's tasks rule — decisions.md.
- [ ] **Confirm the LICENSE holder** — set to `pearpages` from git config; use your full name if you prefer — LICENSE.

## Done

- [x] 2026-11-04: Scaffolded project knowledge files — 13 created, 0 fixed, 6 follow-ups.
