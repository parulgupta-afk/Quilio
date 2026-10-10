# Quilio — Final project status

## Implemented and tested (offline)

- Configurable Gemini models (`gemini-3.6-flash`, `gemini-embedding-001`)
- Citation parsing from answer text (`[Source N]`)
- Chunker with character offsets
- Offline RAG eval v2: **30 labeled questions**, real `chunkText()`, threshold sweep, CI gates
- Rate-limit sequential enforcement (memory path)
- Fork/restore route contract tests
- Unit tests for citations, model config, offsets

## Implemented but not fully verified live

- Socket notification toast (client listener present)
- Atlas `$vectorSearch` ObjectId filter (no live Atlas run here)
- `smoke:ai` / `eval:rag:live` / `embeddings:reindex` (require your API key + Mongo)

## Prepared / external

- Deploy configs (`render.yaml`, `vercel.json`, `docs/DEPLOYMENT.md`)
- Live public URL — **not set until you deploy**

## Not claimed

- Perfect recall or zero hallucinations
- Production-scale vector search without Atlas index
- Human-labeled production traffic eval

## Commands

```bash
cd server && npm test && npm run eval:rag
# with keys:
npm run smoke:ai
npm run embeddings:reindex -- --all
npm run eval:rag:live
```
