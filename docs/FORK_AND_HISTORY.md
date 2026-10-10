# Fork & version history

## API

- `POST /api/posts/:id/fork` — draft fork with `forkedFrom` + `rootPost`
- `GET /api/posts/:id/revisions` — owner only
- `POST /api/posts/:id/revisions/:revisionId/restore` — restore; saves current state first
- `GET /api/posts/:id/forks` — published child forks

## Security

Only the post author can list or restore revisions. Update/delete ownership checks are unchanged.
