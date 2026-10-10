# Quilio

AI-powered social learning & blogging platform (React, Express, MongoDB, Gemini).

## Run locally

```bash
cd server && cp .env.example .env && npm i && npm run dev
cd client && npm i && npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `cd server && npm test` | Automated tests |
| `cd server && npm run eval:rag` | Offline retrieval metrics |
| `cd client && npm run build` | Frontend production build |

## Docs

- `docs/DEPLOYMENT.md`
- `docs/ATLAS_VECTOR_SEARCH.md`

## Deploy

- Backend: `render.yaml` or Render root `server`
- Frontend: Vercel + `client/vercel.json` (set API host)

## Live demo

Not verified in this repo snapshot.
