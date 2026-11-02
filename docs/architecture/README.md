# Architecture

How this codebase is organized, one file per part of the stack — read here first instead of reverse-engineering the structure from the source.

- [`packages.md`](./packages.md) — the shared packages every app in this monorepo depends on.
- `target-*.md` — how the apps are wired together: what runs, how it talks to the database, deployment shape.
- `backend-*.md` — the internals of the backend, if this project has one.
- `frontend-*.md` — the internals of the frontend.

If you change the code, keep the relevant file in sync — treat it as documentation of a folder's contract, not a changelog.
