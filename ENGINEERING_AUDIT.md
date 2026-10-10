# Engineering audit (honest)

## Architecture

- **Client:** React + Vite + Tailwind + Zustand + Socket.IO client  
- **Server:** Express + Mongoose + JWT + Socket.IO + Gemini  
- **Data:** MongoDB (posts, users, social, notifications, embedding chunks, revisions)

## AI pipeline

1. Chunk post text (`chunkText`)  
2. Embed with configured Gemini model  
3. Store vectors + model + dims on `EmbeddingChunk`  
4. Retrieve via in-app cosine or optional Atlas `$vectorSearch`  
5. Generate answer with citation markers; validate via `citationGuard`

## Security notes

- JWT on HTTP and Socket.IO handshake  
- Demo login gated in production when implemented  
- AI rate limiting present  
- Secrets must never be committed (`.env` only)

## Testing

- Unit: validation, citations, model config, embedding policy, socket wiring  
- Integration: fork/edit/restore via Supertest + mongodb-memory-server  
- Eval: offline RAG gate in CI (`npm run eval:rag`)

## Deployment

See `docs/DEPLOYMENT.md`. No live URL is claimed until smoke-tested after deploy.

## Gaps

- Live multi-client socket toast verification  
- Atlas vector index ops verification  
- Automated production smoke against a public URL  
- Genuine screenshots / 60s video for README  
