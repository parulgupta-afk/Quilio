# Article Fork & Version History

## Why this differentiator

Quilio is a learning platform. Forking lets readers turn someone else’s article into **their own learning notes** while preserving attribution. Revisions record how understanding evolves.

## Data model

**Post**
- `forkedFrom` — immediate parent post
- `rootPost` — original root of the lineage
- `forkCount` — number of direct forks
- `revisionCount` — number of saved snapshots

**PostRevision**
- Snapshot of `title` + `content` before each edit
- `revisionNumber`, `editor`, optional `note`

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/posts/:id/fork` | Required | Create draft fork owned by current user |
| GET | `/api/posts/:id/revisions` | Owner | List revision snapshots |
| GET | `/api/posts/:id/forks` | Optional | Published forks of this post |

Edits via `PUT /api/posts/:id` automatically store a revision when title or content changes.

## Security

- Only the author can list revisions.
- Forking non-published posts is limited to the author.
- Ownership checks on update/delete unchanged.

## Interview talking points

- Attribution graph (`forkedFrom` / `rootPost`) without a full VCS
- Snapshot-on-write revision model vs CRDT collaborative editing
- Trade-off: storage growth vs simple rollback story
