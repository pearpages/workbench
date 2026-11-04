# workbench

Reusable setup for **Backlog**: one public GitHub Project that tracks issues across all
your repositories, with shared labels, priority and size fields, and issue templates.

Keeping a `tasks.md` in every repo scatters work and gives no overview. This repo replaces
those files with GitHub Issues on a single board. It also migrates the existing `tasks.md`
items for you.

## Install

```sh
gh auth status               # the token must include the `project` scope
gh auth refresh -s project   # if it doesn't
```

TODO: the clone and install steps, once the repo and `package.json` exist.

## Usage

TODO: the script commands (project setup, `sync-labels`, migration), each with its dry run
and apply form. Also how to copy the project with "Make a copy", and the manual UI steps
(views and workflows).

## Documentation

How it works is in [architecture.md](architecture.md). Contributors and agents start at
[AGENTS.md](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
