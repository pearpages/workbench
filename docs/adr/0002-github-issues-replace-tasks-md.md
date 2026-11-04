# 0002. A cross-repo GitHub Project with Issues replaces per-repo tasks.md

- **Date:** 2026-11-04
- **Status:** Accepted
- **Supersedes:** the `tasks.md` part of [0001](0001-project-knowledge-files.md)

## Context

Each repo tracks its work in a `tasks.md` file ([ADR-0001](0001-project-knowledge-files.md)).
That gives no cross-repo view, no board or priorities, and nothing to link from PRs.

## Decision

A private GitHub Project owned by the user, called **Backlog**, tracks work in every
selected repo as GitHub Issues. It uses shared labels for type, priority and area
([ADR-0003](0003-priority-in-labels.md)). Open `tasks.md` items are migrated into issues, then each
repo's `tasks.md` is deleted (its history stays in git) and its rules point at issues, recorded
in an ADR of its own: new work → `gh issue create`; finished work → `Fixes #N`.

Exception: bicing and foundry keep `tasks.md`, because foundry's driver reads and ticks it in
the projects it runs. They leave `repos.yml` until foundry can drive from issues
([foundry#5](https://github.com/pearpages/foundry/issues/5)).

## Consequences

+ One board across repos, and PRs close issues automatically.
+ Others can copy the setup from the `workbench` repo.
− Supersedes ADR-0001's `tasks.md` part. The `/scaffold` skill still creates `tasks.md`
  and needs the same change.
− Text that was not a checkbox (section intros, prose ideas) does not migrate by itself;
  check each file for it before deleting.
− Work tracking now depends on GitHub, and some setup (views, workflows) is manual UI work.
