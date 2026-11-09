# workbench

Reusable setup for **Backlog**: one GitHub Project board that tracks the issues of all your
repositories, with shared labels (type, priority, area) and issue templates.

Keeping a `tasks.md` in every repo scatters work and gives no overview. This repo replaces
those files with GitHub Issues on a single board, and migrates the open `tasks.md` items for
you.

## Install

You need [Node](https://nodejs.org) 22 (pinned in `mise.toml`) and the
[GitHub CLI](https://cli.github.com) with the `project` scope.

```sh
git clone https://github.com/pearpages/workbench && cd workbench
npm install
gh auth status               # the token scopes must include `project`
gh auth refresh -s project   # if they don't
```

## Usage

Every script is a **dry run** unless you add `--apply`, and is safe to run twice.

1. List the repos to track in `repos.yml` (`gh repo list --limit 100` helps).
2. Create the board:

   ```sh
   npx tsx scripts/setup-project.ts            # finds or creates the project "Backlog"
   npx tsx scripts/setup-project.ts --apply
   ```

3. Give every repo the same labels from `labels.yml`:

   ```sh
   npx tsx scripts/sync-labels.ts --apply
   ```

4. Turn each repo's open `tasks.md` items into issues on the board:

   ```sh
   npx tsx scripts/migrate-tasks.ts --only <repo>   # check one repo first
   npx tsx scripts/migrate-tasks.ts --apply
   ```

   Only checkbox items (`- [ ]`) migrate. Read each `tasks.md` for open work written as plain
   text before you delete it.

5. Keep the board complete. New issues in repos without an auto-add workflow (see below), and
   issues opened with `gh issue create`, join the board when you sweep:

   ```sh
   npx tsx scripts/add-to-board.ts --apply
   ```

6. Keep every repo on the current [craft](https://github.com/pearpages/craft) knowledge standard.
   After the standard changes, file one upgrade issue in each repo that is behind:

   ```sh
   npx tsx scripts/sweep-standard.ts --apply
   ```

Copy `.github/ISSUE_TEMPLATE/` into a repo to give it the bug, feature and chore forms.

## Steps only the GitHub website can do

The API cannot create views or turn on workflows. Open the project and:

- **Views** (a view's settings stick only after **Save**):
  - **Board**: + New view → Board. Columns are the Status field.
  - **By repo**: a Table, then View → Group by → Repository.
  - **Now**: a Table filtered by `status:"In Progress" label:"priority:high"`.
- **Workflows** (⋯ → Workflows):
  - **Item closed** and **Pull request merged** set Status to **Done**. They are on by default.
  - **Auto-add to project** adds new issues from one repo. Use the filter
    `is:issue,pr is:open`, then ⋯ → Duplicate workflow for the next repo. GitHub caps how many
    you can have (5 on the plan this was built on). The sweep in step 5 covers the rest.

To reuse a board you own, open it and choose ⋯ → **Make a copy**. That copies the views and
settings, not the issues.

## Documentation

How it works is in [architecture.md](architecture.md), and the reasons in
[decisions.md](decisions.md). Contributors and agents start at [AGENTS.md](AGENTS.md). Open
work is in [GitHub Issues](https://github.com/pearpages/workbench/issues).

## License

MIT — see [LICENSE](LICENSE).
