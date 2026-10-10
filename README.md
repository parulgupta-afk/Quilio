# Quilio

AI-powered social learning & blogging: publish, discuss, chat with grounded RAG, and learn with quizzes.

## Stack

React · Vite · Zustand · Express · MongoDB · JWT · Gemini · Socket.IO · Cloudinary

## Features

- Auth (email/password, Google GIS, demo login gated in production)
- Social blogging (follow, like, comment, bookmark, search)
- **Chat with a post** — per-article RAG + citation guard + score threshold
- **Learn This** — concepts + quizzes
- Embedding pipeline with status, retries, bounded concurrency
- Optional **Atlas Vector Search** (`USE_ATLAS_VECTOR_SEARCH=true`)
- Socket notifications (JWT-authenticated rooms)
- Offline RAG eval: `cd server && npm run eval:rag`

## Quick start

```bash
cd server && cp .env.example .env && npm i && npm run dev
cd client && npm i && npm run dev
```

See `docs/DEPLOYMENT.md` and `docs/ATLAS_VECTOR_SEARCH.md`.

## Scripts

| Command | Purpose |
|---------|---------|
| `server: npm test` | Automated tests |
| `server: npm run eval:rag` | Offline retrieval metrics |
| `client: npm run build` | Production build |

## Live demo

Not verified in-repo — add URL after deploy.

## License

ISC
