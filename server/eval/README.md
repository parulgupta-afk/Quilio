# RAG evaluation

## Modes

| Command | Mode | Embeddings |
|---------|------|------------|
| `npm run eval:rag` | Offline CI | Fixture hash vectors + **production-style** cosine/topK/minScore |
| `npm run eval:rag:live` | Live | Gemini `generateEmbedding` + same retrieve logic |

Offline does **not** measure Gemini quality. Live does.

## Dataset

- Seed posts from `seedDemo.js` (expanded paragraphs for multi-chunk)
- Domain-extended JWT + embedding articles for coverage
- 28 questions (23 answerable, 5 unanswerable)
- Labels: evidence substrings mapped to real `chunkText` indices

## Metrics

- **Recall@K** — fraction of labeled relevant chunks in top-K (answerable only)
- **Precision@K** — fraction of top-K that are labeled relevant
- **MRR** — mean reciprocal rank of first relevant hit
- **Answerable success** — ≥1 relevant chunk retrieved
- **OOS refusal** — unanswerable with zero hits after minScore filter
