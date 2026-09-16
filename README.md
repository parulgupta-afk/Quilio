# Quilio

**A blog isn't just something you read — it's something you learn from, verify, remix, and grow from.**

AI-Powered Social Learning & Blogging Platform built with React, Node.js, MongoDB, and Google Gemini.

## Core Features

### Social Blogging
- Auth (JWT)
- Write / publish posts with cover images (Cloudinary)
- Home feed + Personalized "For You" feed
- Profiles + Follow
- Like, Comment, Bookmark
- Search

### AI Layer (Gemini)
- **Chat with a Blog** — RAG with source citations
- **Learn This** — auto key concepts + quiz generation
- Embedding pipeline (chunk → embed → store)
- Similar posts via cosine similarity
- Rate limiting for cost control

### Learning & Real-time
- Quiz attempts + progress tracking
- Notifications (follow, like, comment)
- Socket.io ready for real-time delivery

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + Tailwind + Zustand |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| Media | Cloudinary |
| AI | Google Gemini (embeddings + generation) |
| Real-time | Socket.io |

## Getting Started

```bash
# Server
cd server
cp .env.example .env
# Fill: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, CLOUDINARY_*
npm install
npm run dev

# Client
cd client
npm install
npm run dev
```

## Architecture Highlight

One embedding pipeline powers multiple features:

```
Post published
    → Chunking
    → Gemini embeddings
    → Stored in MongoDB
         ├── RAG Chat
         ├── Similar Posts
         └── (future Knowledge Graph)
```

## Project Structure

```
Quilio/
├── client/          # React frontend
└── server/          # Express backend
    └── src/
        ├── models/
        ├── controllers/
        ├── routes/
        ├── services/    # AI + embedding pipeline
        └── middleware/
```

Built as a portfolio-grade full-stack + AI project.
