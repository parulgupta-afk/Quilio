# Quilio — Project status (2026-10-10)

## Implemented on `main` (code-verified)

| Area | Status |
|------|--------|
| Auth JWT / Google / demo gate | Yes |
| Posts, social, search | Yes |
| Boot splash → welcome → login | Yes |
| RAG chat + citation filter + score gate | Yes |
| Learn / quiz | Yes |
| Embedding pipeline + retries | Yes |
| Mongo AI rate limit | Yes |
| JWT Socket.IO rooms | Yes |
| Client socket connect | Yes |
| Fork + revisions + restore | Yes |
| CI (test + eval:rag + client build) | Yes |
| Deploy configs (render.yaml, vercel.json) | Yes |
| README + architecture | Yes |
| Offline RAG eval harness | Yes |

## Fixed in this finish pass

- Post schema now includes `embeddingStatus` / attempts / error / model / completedAt (pipeline was writing these; schema was missing them).

## Not done (requires your accounts)

1. **Public live URL** — deploy Render + Vercel and paste URL into README  
2. **Atlas Vector Search index** — optional; set `USE_ATLAS_VECTOR_SEARCH=true` after creating index  
3. **Screenshots / demo video** — add to README for recruiters  
4. **Human-labeled 25–50 RAG dataset** on real seed posts  

## Local verify

```bash
cd server && npm install && npm test && npm run eval:rag
cd client && npm install && npm run build
```

## Interview one-liner

Quilio is a full-stack social learning app with per-article RAG (grounded refusals + citation filtering), an observable embedding pipeline, JWT-secured realtime notifications, fork/version history, automated tests, and CI — ready to deploy when env vars and hosts are configured.
