# Tasks

What's open and what's been done. Every change updates this file: tick or add an Open
item, and add a dated line at the top of **Done**.

## Open

- [ ] Migrate each repo's `tasks.md` to issues (dry run, confirm, add to Backlog, list deletable files).
- [ ] README: what Backlog is, "Make a copy", how to use this repo, manual UI steps.
- [ ] Manual UI: views (Board by Status, Table by Repository, "Now") and workflows (auto-add, Done on close/merge).

### Scaffold follow-ups

- [ ] **Fill the README Install/Usage TODOs** — they're placeholders until the scripts exist — README.md.
- [ ] **Fill the dev commands TODO** — no scripts yet — AGENTS.md, architecture.md.
- [ ] **Enable private vulnerability reporting** — the repo is public now — GitHub repo settings / security.md.
- [ ] **Decide on ADR-0002** (Issues replace tasks.md) — it changes the scaffold standard; if Accepted, update ADR-0001's tasks rule — decisions.md.
- [ ] **Confirm the LICENSE holder** — set to `pearpages` from git config; use your full name if you prefer — LICENSE.

## Done

- [x] 2026-11-04: Added scripts/migrate-tasks.ts (tasks.md → issues in Backlog; type label only on a keyword match).
- [x] 2026-11-04: Added scripts/sync-labels.ts and applied labels.yml to the 16 repos (176 labels).
- [x] 2026-11-04: Picked the 16 repos with a tasks.md (317 open items) → repos.yml.
- [x] 2026-11-04: Created the private project Backlog (users/pearpages/projects/3) with Priority and Size via scripts/setup-project.ts.
- [x] 2026-11-04: Added labels.yml, issue templates (bug/feature/chore), package.json (tsx, yaml, typescript) and scripts/lib.ts (gh helpers, scope check, --apply flag).
- [x] 2026-11-04: Pinned Node 22 with mise (mise.toml).
- [x] 2026-11-04: Created the public repo pearpages/workbench and pushed.
- [x] 2026-11-04: Scaffolded project knowledge files — 13 created, 0 fixed, 6 follow-ups.
