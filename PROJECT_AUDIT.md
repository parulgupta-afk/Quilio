# Quilio — Project Audit (Phase 0)

**Date:** 2026-10-09  
**Repo:** https://github.com/parulgupta-afk/Quilio  
**Scope:** Code inspection of `main` (clone at audit time). No assumptions from README alone.

---

## 1. Current architecture

```
client/  React 18 + Vite + Tailwind v4 + Zustand + Axios + Socket.io-client + Framer Motion
server/  Node + Express + Mongoose + JWT + bcrypt + Gemini + Cloudinary + Socket.io + Helmet + rate-limit
```

**Request flow**

- Vite dev proxy: `/api` → `http://localhost:5000`
- Auth: JWT in `Authorization: Bearer` (also cookie optional in middleware)
- Client state: Zustand `authStore` (persisted user + token)
- Real-time: Socket.io rooms by `userId` for notifications
- AI: Gemini embeddings + generation; chunks in `EmbeddingChunk`; RAG chat + Learn This + write assistant

**Monorepo layout:** separate `client/` and `server/` package.json (no root workspace).

---

## 2. Feature audit matrix

| Area | Status | Evidence / notes |
|------|--------|------------------|
| **Auth — register/login** | Working | `POST /api/auth/register`, `/login`; bcrypt + JWT |
| **Auth — Google** | Partial | GIS + `POST /api/auth/google`; origin/Client ID must be configured in Google Console |
| **Auth — demo login** | Working (dev risk) | `POST /api/auth/demo-login` creates/resets `aria@quilio.app` — **must disable or guard in production** |
| **Auth — logout / session** | Working | Client clears Zustand; no server-side session blacklist |
| **Profiles — fetch** | Working | `GET /api/users/:id` |
| **Profiles — edit** | Working | `PUT /api/users/me` (name, bio, avatarUrl, links) |
| **Profiles — UI** | Partial | Profile redesigned; layout/centering fixes may not all be on remote `main` yet — verify after push |
| **Avatar** | Partial | Presets + Cloudinary upload; dropdown had controlled open/close bugs (fix packaged) |
| **Follow / unfollow** | Working | Unique index `(follower, following)`; routes under `/api/social/follow` |
| **Posts CRUD** | Working | Create/list/slug/update/delete; **ownership check on update/delete (403)** |
| **Drafts** | Working | `status: draft \| published`; `GET /api/posts/me/all` |
| **Likes** | Working | Unique `(user, post)` |
| **Bookmarks** | Working | Unique `(user, post)` |
| **Comments** | Working | Add/list/delete (auth on mutate) |
| **Search** | Partial | Regex on title/tags/excerpt + users name/bio — **not semantic**; no Atlas Search |
| **For You feed** | Partial | Scoring (follow + engagement + recency); looks like Latest if user follows nobody |
| **Similar posts** | Working | Embedding cosine or tag fallback |
| **RAG chat** | Working | `POST /api/ai/chat/:postId`; retrieves chunks; in-memory daily rate limit |
| **Citations** | Partial | Sources array present in AI path — verify UI always shows grounded passages |
| **Learn This / quiz** | Working | Generate + cache `Quiz`; submit attempts; progress endpoint |
| **Flashcards** | Partial | Generated inside Learn payload; no dedicated spaced-repetition product surface |
| **Write with AI** | Working | `POST /api/ai/write` |
| **Notifications** | Working | Persist + mark read; Socket emit helper |
| **Upload** | Working | Multer memory → Cloudinary; type/size limits |
| **Health** | Partial | `/api/health` exists; should report Mongo readyState (fix was prepared earlier — confirm on main) |
| **Seed data** | Working | `npm run seed` demo authors + posts |
| **Automated tests** | **Missing** | Server `test` script is placeholder; no Vitest/Supertest/Playwright |
| **CI/CD** | **Missing** | No `.github/workflows` |
| **Docker** | **Missing** | No Dockerfile / compose |
| **TypeScript / Zod** | **Missing** | JS only; no request schema validation library |
| **OpenAPI/Swagger** | **Missing** | — |
| **Monitoring** | **Missing** | No Sentry etc. |
| **Live demo** | **Unknown** | README mentions “live demo” without a URL |

Legend: **Working** | **Partial** | **Missing** | **Unknown**

---

## 3. Database model (summary)

| Model | Role | Integrity notes |
|-------|------|-----------------|
| User | Auth + profile | email unique; passwordHash select:false |
| Post | Articles | author ref; status; tags; counts |
| Comment / Like / Bookmark / Follow | Social | **unique compound indexes** on pairs |
| EmbeddingChunk | RAG vectors | post + embedding array |
| Quiz / QuizAttempt | Learning | attempts store score % |
| Notification | Activity | user-targeted |

**Gaps**

- No text index for search (regex only → slow at scale)
- Vectors stored in Mongo documents — Atlas Vector Search not required but cosine-in-app won’t scale
- No soft-delete / audit fields
- Follow status for “am I following this profile?” may need extra client call (not always hydrated on profile GET)

---

## 4. Security concerns (priority order)

1. **`POST /api/auth/demo-login` in production** — resets a known password. Gate with `NODE_ENV !== 'production'` or remove.
2. **In-memory AI/Learn rate limits** — reset on process restart; not shared across instances. Move to Redis or DB for production.
3. **No Zod/Joi validation** — relies on ad-hoc checks; inconsistent 400s.
4. **JWT only (no refresh rotation)** — acceptable for portfolio if documented; stolen token valid until expiry.
5. **Google origin misconfig** — common local 403; document Client ID origins clearly.
6. **Helmet + CORS present** — good; keep COOP settings compatible with Google GIS.
7. **Post ownership enforced** — good pattern; extend same checks to any future resources.
8. **Secrets** — `.gitignore` excludes `.env`; good. Ensure no secrets in client bundle beyond `VITE_*`.

---

## 5. Frontend notes

**Strengths**

- Clear pages: Home, Dashboard, Write, Search, Learn, Progress, Notifications, Profile
- Design system tokens (`--ns-*`) + Tailwind v4
- Home modular sections; profile component split started

**Weaknesses**

- Visual inconsistency (WorkspaceShell vs Layout bottom-nav pages)
- Some pages still sparse (Progress, Notifications, Search)
- Profile left-alignment / dropdown bugs tracked in local fix packages — **confirm merged to GitHub**
- No shared `Button`/`Input` primitives under `components/ui` (only auth-related leftovers)
- Accessibility: tabs/modals partially labeled; needs systematic pass

---

## 6. AI engineering notes

**Strengths**

- Real pipeline: publish → embed → store → retrieve → generate
- Shared embedding service for chat + similar posts
- Learn This caches quiz documents
- Per-user soft rate limits

**Gaps**

- No formal RAG evaluation set / metrics logged
- Citation UX may be incomplete on client
- No background job queue (embedding runs in request path after publish)
- Search is keyword regex, not vector search

---

## 7. Testing & production engineering

| Item | Status |
|------|--------|
| Unit / integration tests | Missing |
| E2E | Missing |
| CI (GitHub Actions) | Missing |
| Docker | Missing |
| Deployed demo URL | Unknown / not documented |
| API docs (OpenAPI) | Missing |
| Error monitoring | Missing |

---

## 8. Highest-priority improvements (ordered)

### P0 — This week (stability & honesty)

1. Confirm profile layout + avatar dropdown fixes are **committed and pushed**.
2. Gate or remove **demo-login** outside development.
3. Health endpoint reports **MongoDB connected** (503 if not).
4. README: accurate feature list, env setup, **no claims without code**, add screenshots + real demo link when available.
5. Manual smoke test script (register → post → chat → learn → follow).

### P1 — Backend & security hardening

1. Zod validation on auth, posts, AI body.
2. Consistent error shape `{ message, code? }`.
3. Cursor/limit pagination audit on feed & comments.
4. Integration tests: auth, ownership 403, follow unique, AI 429.

### P2 — Product polish

1. Unified layout shell (one nav system).
2. Article reader: typography, TOC, markdown/code highlight.
3. Search: at least better text index; later vector.
4. Profile: “isFollowing” from API; empty states complete.

### P3 — AI depth

1. Always return and render **citations**.
2. Persist chat history per post/user (optional).
3. Tiny eval set + latency/cost log.
4. Optional BullMQ for embedding jobs.

### P4 — Portfolio packaging

1. Vitest + Supertest + Playwright smoke.
2. GitHub Actions lint/test/build.
3. Deploy client + server; Sentry optional.
4. Architecture diagram in README.

---

## 9. What already makes Quilio interview-worthy

- End-to-end social blog + **real** Gemini RAG/learn path  
- Ownership checks, unique social indexes, JWT + bcrypt  
- Seed script for demos  
- Clear modular folders (models/controllers/routes/services)

**What currently weakens it**

- No automated tests / CI  
- Demo-login risk  
- Search & feed personalization still shallow  
- UI inconsistency across shells  
- README/demo packaging incomplete  

---

## 10. Immediate next implementation (Phase 1 kickoff)

After this audit is committed:

1. **Merge profile centering + avatar dropdown fixes** (if not on `main`).
2. **Disable demo-login in production.**
3. **Health + Mongo readyState.**
4. **README accuracy pass.**
5. Begin **shared UI primitives** and article reader polish.

---

*Audit method: static inspection of repository source. Runtime behavior (Cloudinary, Gemini quotas, Atlas) not executed in this environment.*
