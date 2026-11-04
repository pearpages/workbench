# 0003. Priority is a label on the issue; the board has no custom fields

- **Date:** 2026-11-04
- **Status:** Accepted

## Context

Priority existed twice: as `priority:high|med|low` labels and as a Priority field (with a
Size field next to it) on the Backlog board. Work happens one repo at a time: a person or an
agent inside a repo reads and sets labels with one `gh issue` command. Setting a board field
needs the project API: find the item, the field and the option IDs, then update.

## Decision

- Priority is set with `priority:*` labels on the issue. The board shows and filters them
  (the "Now" view filters on `label:"priority:high"`).
- Backlog has no custom fields. The Priority and Size fields were deleted (no item used them),
  and `scripts/setup-project.ts` no longer creates them.

## Consequences

+ One place to set priority, reachable from inside any repo.
+ The board stays a view: nothing to keep in sync by hand.
− The board can filter by label but not group or sort by it.
− There is no size estimate any more; add `size:*` labels if one is needed.
