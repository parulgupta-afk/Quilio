# Phases 1–4 Progress (implementation slice)

Shipped in this change set — not a full rewrite of every roadmap item.

## Phase 1 — Frontend / design system
- Shared `components/ui/Button.jsx` + `.q-btn*` styles
- Clearer RAG citation blocks in `ChatWithPost`
- Profile layout/avatar work remains as previously packaged (verify on `main`)

## Phase 2 — Backend / database
- `middleware/validate.js` for body validation (auth + create post)
- Post **text index** on title/excerpt/tags
- Search: `$text` when available, regex fallback; query length guard

## Phase 3 — Security
- **Demo login disabled when `NODE_ENV=production`**
- Stricter **auth rate limiter** (30 / 15 min)
- Error handler hides internal messages in production
- Health already reports Mongo readyState (kept)

## Phase 4 — AI
- Chat responses include `grounded: true` and longer source snippets
- UI: “Sources from this article” with quote-style blocks

## Still open (next iterations)
- Full design-system component kit
- Article markdown/syntax highlighting
- Zod / OpenAPI
- Automated tests + CI
- Redis-backed AI rate limits
- RAG eval dataset

## How to verify
```bash
# Server
cd server && NODE_ENV=production node -e "require('dotenv').config(); ..." # or hit demo-login → 403
curl -s http://localhost:5000/api/health

# Client
# Open a post → Chat → ask a question → confirm Sources block
# Search with a keyword present in a post title
```
