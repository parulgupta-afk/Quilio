# Quilio — Project status

**Repo HEAD inspected for this document:** see latest `main` at time of update.  
**Live production URL:** not verified in this environment (credentials/dashboard access required).

## Feature status

| Area | Status |
|------|--------|
| Auth (email/password JWT) | IMPLEMENTED AND TESTED (unit + integration paths) |
| Google OAuth | IMPLEMENTED BUT NOT FULLY VERIFIED (needs Cloud Console origins) |
| Posts, feed, social | IMPLEMENTED AND TESTED (controller/route coverage varies) |
| Fork / revision / restore | IMPLEMENTED AND TESTED (Supertest + memory Mongo integration) |
| Socket.IO JWT rooms + emit | IMPLEMENTED AND TESTED (wiring tests; full browser E2E not run here) |
| Notification toast client | IMPLEMENTED BUT NOT FULLY VERIFIED (needs two-browser live check) |
| RAG chat + citations | IMPLEMENTED AND TESTED (unit citation; live Gemini optional) |
| Offline RAG eval | IMPLEMENTED AND TESTED (fixture vectors + production-style retrieve) |
| Live RAG eval | PREPARED BUT REQUIRES EXTERNAL CONFIGURATION (`GEMINI_API_KEY`) |
| Embedding dim hard-fail | IMPLEMENTED AND TESTED (see embedding dimension tests) |
| Frontend route code-splitting | IMPLEMENTED (Vite lazy routes + manualChunks) |
| Production deploy | PREPARED BUT REQUIRES EXTERNAL CONFIGURATION |
| Screenshots / demo video | NOT IMPLEMENTED (no verified capture in this environment) |

## Commands

```bash
cd server && npm test && npm run eval:rag
cd client && npm run build
```

## Known limitations

- Offline RAG metrics are **not** Gemini quality metrics  
- Embedding reindex and smoke AI require your API key and MongoDB  
- Socket notification **end-to-end** browser verification was not completed without a running full stack + two sessions  
