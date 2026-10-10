# Offline RAG evaluation

**Mode:** offline fixture vectors (not Gemini)
**Dataset:** 2.1.0 (28 questions)
**Chosen minScore:** 0.45

| Metric | Value |
|--------|-------|
| Recall@K | 0.8695652173913043 |
| Precision@K | 0.6363636363636364 |
| MRR | 0.7971014492753624 |
| Answerable success | 0.8695652173913043 |
| OOS refusal | 0.8 |

This does **not** measure Gemini embedding quality. Run `npm run eval:rag:live` for live embeddings.
