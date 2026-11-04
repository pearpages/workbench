# Security

The security surface of workbench and the rules that protect it. General rules are in
[principles.md](principles.md); how the pieces fit in [architecture.md](architecture.md).
Update this file whenever the surface changes (new input, endpoint, secret, dependency,
permission).

## Reporting a vulnerability

Use a GitHub private security advisory on `pearpages/workbench` (Security → Report a
vulnerability). Never open a public issue for an unfixed vulnerability. TODO: enable private
vulnerability reporting once the repo exists.

## Surface

- **GitHub API through `gh`:** the scripts act with your own token and the `repo` and
  `project` scopes. A bug could create, edit or label issues in every repo in `repos.yml`.
  P2 (dry run plus confirmation) is the main guard.
- **Untrusted input:** the `tasks.md` contents become issue titles and bodies. Pass them to
  `gh` as arguments or files, never by interpolating them into a shell string.
- **Public by design:** the Backlog project and this repo are public. Anything migrated
  from a private repo's `tasks.md` could show up on a public board, so check the dry run
  for private details before you confirm.
- No server, no endpoints, and no stored data.

## Secrets

- Never committed. Authentication is `gh`'s own credential store (`gh auth login`), and the
  scripts never read or print a token.
- `.env*` files are gitignored; an example file lists names only.
- Access is whoever runs the scripts on their own account.

## Dependencies

Keep them minimal: `tsx` and a YAML parser at most. Commit a lockfile when `package.json`
lands, and check with `npm audit` before publishing.

## Known risks

- The public board can expose items from private repos (see Surface). This is accepted, and
  reviewing the dry run is the mitigation.
