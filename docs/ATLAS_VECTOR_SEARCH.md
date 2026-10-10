# MongoDB Atlas Vector Search (optional)

Quilio defaults to **in-app cosine similarity over one post’s chunks**.  
Enable Atlas Vector Search only when your cluster supports `$vectorSearch`.

## Index definition

Collection: `embeddingchunks` (Mongoose pluralization may vary — check Atlas)

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "post"
    }
  ]
}
```

Index name: `embedding_vector_index` (or set `ATLAS_VECTOR_INDEX`).

## Environment

```
USE_ATLAS_VECTOR_SEARCH=true
ATLAS_VECTOR_INDEX=embedding_vector_index
EMBEDDING_DIMS=768
EMBEDDING_MODEL=text-embedding-004
RAG_MIN_SCORE=0.35
```

If `$vectorSearch` fails at runtime, the API **falls back** to in-app cosine and logs a warning.
