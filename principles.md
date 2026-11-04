# Principles

Every change to this repository, whether code, docs, tests or process, complies with these
rules. When a change would break one, stop and ask the user instead of working around it.
Changing a principle is itself a decision: it needs the user's agreement and an ADR
([decisions.md](decisions.md)). How things are built is in
[architecture.md](architecture.md); security rules in [security.md](security.md).

Each rule has a **Why**, and a **Check** where something enforces it (a test, lint rule,
CI step, hook).

## Scripts

**P1. Every script is idempotent: re-running it with the same input changes nothing new.**
It looks up existing labels, fields, issues and project items before it creates anything.
*Why:* the scripts are re-run as repos are added, and anyone copying the repo will run them more than
once. *Check:* review; run every script twice in a row and confirm the second run is a no-op.

**P2. Dry run by default. Writes to GitHub need an explicit flag and the user's confirmation.**
That covers issues, labels, project fields and repo creation. Deleting files is confirmed too.
*Why:* the scripts touch many public repos at once, so a wrong write is noisy and hard to
undo. *Check:* review; a script with no flag only prints what it would do.

**P3. GitHub is reached only through the `gh` CLI. Each script first checks that the token
has the `project` scope.** If the scope is missing, the script stops and tells the user to
run `gh auth refresh -s project`.
*Why:* one auth path, with no tokens handled by our code. *Check:* review.

**P4. Scripts stay small and readable: Node.js + TypeScript run with `tsx`, or bash.**
There is no build step, no framework and no abstraction until a second use exists.
*Why:* the repo is meant to be read and copied by others. *Check:* review.

## Process

**P5. Knowledge lives in its file.** How to work → `AGENTS.md`; rules → here; how it is
built → `architecture.md`; why → an ADR; work → GitHub Issues; risk → `security.md`.
*Why:* a session log in the agent file hides decisions from the next person.
[ADR-0001](docs/adr/0001-project-knowledge-files.md)
