# Security

The security surface of workbench and the rules that protect it. General rules are in
[principles.md](principles.md); how the pieces fit in [architecture.md](architecture.md).
Update this file whenever the surface changes (new input, endpoint, secret, dependency,
permission).

## Reporting a vulnerability

Use a GitHub private security advisory on `pearpages/workbench` (Security → Report a
vulnerability; private vulnerability reporting is on). Never open a public issue for an unfixed
vulnerability.

## Surface

- **GitHub API through `gh`:** the scripts act with your own token and the `repo` and
  `project` scopes. A bug could create, edit or label issues in every repo in `repos.yml`.
  P2 (dry run plus confirmation) is the main guard.
- **Untrusted input:** the `tasks.md` contents become issue titles and bodies. Pass them to
  `gh` as arguments or files, never by interpolating them into a shell string.
- **Untrusted input, the standard sweep:** `sweep-standard` reads other repos' `AGENTS.md`
  only for a version number, and builds issue bodies from craft's `standard-changes.md`; both go
  to `gh` as arguments, never through a shell.
- **Visibility:** this repo is public; the Backlog project is private, and the scripts never
  change that. If you make the project public, anything migrated from a private repo's
  `tasks.md` shows up on a public board, so check the dry run
  for private details before you confirm.
- No server, no endpoints, and no stored data.

## Secrets

- Never committed. Authentication is `gh`'s own credential store (`gh auth login`), and the
  scripts never read or print a token.
- `.env*` files are gitignored; an example file lists names only.
- Access is whoever runs the scripts on their own account.

## Dependencies

Keep them minimal. The only runtime dependency is `yaml`. Dev dependencies are `tsx`,
`typescript` and `@types/node`. `package-lock.json` is committed, and `npm audit` runs
before publishing.

## Known risks

- Making the project public would expose items from private repos (see Surface). It stays
  private for now; reviewing the dry run is the mitigation if that changes.
