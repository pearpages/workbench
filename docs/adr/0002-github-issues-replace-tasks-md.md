# 0002. A cross-repo GitHub Project with Issues replaces per-repo tasks.md

- **Date:** 2026-11-04
- **Status:** Proposed

## Context

Each repo tracks its work in a `tasks.md` file ([ADR-0001](0001-project-knowledge-files.md)).
That gives no cross-repo view, no board or priorities, and nothing to link from PRs.

## Decision

A private GitHub Project owned by the user, called **Backlog**, tracks work in every
selected repo as GitHub Issues. It uses shared labels, a Priority field (High/Med/Low) and a
Size field (S/M/L). Open `tasks.md` items are migrated into issues. Once a repo's items are
migrated, its `tasks.md` can be deleted.

## Consequences

+ One board across repos, and PRs close issues automatically.
+ Others can copy the setup from the `workbench` repo.
− Partly supersedes ADR-0001's `tasks.md` rule. The scaffold standard and each repo's
  AGENTS.md working rule 2 need updating to point at issues.
− Work tracking now depends on GitHub, and some setup (views, workflows) is manual UI work.
