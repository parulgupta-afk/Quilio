# Quilio Engineering Audit (verified against `main`)

**Date:** 2026-10-10  
**Commit inspected:** latest `main` at clone time  

## Architecture (actual)

```
React (Vite) + Zustand
    |  REST /api  (+ Socket.IO with JWT auth)
    v
Express (Helmet, CORS, rate-limit)
    |-- Auth (JWT, bcrypt, Google GIS)
    |-- Posts / Social / Search
    |-- AI (Gemini embed + generate)
    |      |-- embeddingPipeline (chunk → embed → Mongo)
    |      |-- retrieveRelevantChunks (per-post cosine; minScore gate)
    |      |-- chatWithPost (citations)
    |-- Learn (quiz) / Notifications
    v
MongoDB Atlas (+ Cloudinary for media)
```

## Verified working

- JWT register/login/google handlers present; password compare via bcrypt
- Post ownership checks on update/delete (403)
- Unique indexes on Follow/Like/Bookmark
- RAG chat path with sources array
- Learn This / quiz routes
- Seed script + demo login (gated in production)
- Helmet, CORS, global + auth rate limits
- Health endpoint reports Mongo readyState
- GitHub Actions CI (server test + client build)
- Boot splash + welcome + Auth11 + LoginShowcase

## Verified defects / gaps (pre-fix)

| ID | Issue | Severity |
|----|--------|----------|
| D1 | Retrieval loads all chunks for a post into Node and scores in-process (OK per article, not corpus-scale) | Medium |
| D2 | No RAG evaluation harness | High (interview gap) |
| D3 | Embeddings sequential, fire-and-forget, no status | Medium |
| D4 | Socket `join` trusted client `userId` | **High** |
| D5 | Client did not connect to Socket.IO | Medium |
| D6 | AI rate limit was in-memory Map | Medium |
| D7 | Always passed top-4 chunks even if similarity is weak | Medium |
| D8 | README links to missing PROJECT_AUDIT.md / PHASES docs; no live demo URL | Low |
| D9 | Tests include source-text pattern checks | Low |
| D10 | No Atlas Vector Search index (in-app cosine only) | Accepted for MVP scale |

## Email/password login

Code path is coherent: validateBody → User.find email → comparePassword → JWT → Zustand.  
**Not reproduced live** in this environment (no Mongo/Gemini credentials). Failure modes to check locally: server down (proxy ECONNREFUSED), wrong password, Google-only accounts without passwordHash.

## This change set addresses

- D3: embedding status + retries + concurrency  
- D4/D5: JWT socket auth + client connect  
- D6: Mongo-backed AI rate limit (memory fallback)  
- D7: minScore answerability gate  
- D2: offline `npm run eval:rag` harness  
- D8: README rewrite  
- D9: behavioral demo-login production test  

## Not done in this pass

- Atlas Vector Search index (requires Atlas UI + M10+ or search-compatible tier)  
- Live deployment  
- Full 25–50 question human-labeled eval on real posts  
- Redis  
- Knowledge graph / fork feature  
