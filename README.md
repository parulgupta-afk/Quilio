# Quilio

**A blog isn't just something you read — it's something you learn from, verify, remix, and grow from.**

AI-Powered Social Learning & Blogging Platform.

## Vision

Instagram + Medium + Reddit + AI + Learning Platform.

Readers don't just consume posts — they chat with them (RAG), take quizzes, track progress, and discover related knowledge through a unified embedding pipeline.

## Tech Stack

| Layer          | Choice                          |
|----------------|---------------------------------|
| Frontend       | React + Vite + Tailwind + Zustand |
| Backend        | Node.js + Express               |
| Database       | MongoDB Atlas (+ Vector Search) |
| Auth           | JWT + Google OAuth              |
| Media          | Cloudinary                      |
| Real-time      | Socket.io                       |
| AI             | LLM API + Embeddings + RAG      |
| Deployment     | Vercel (client) + Render/Railway (server) |

## Project Structure

```
Quilio/
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── store/
│       ├── services/
│       └── utils/
├── server/                 # Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (later)
- LLM API key (OpenAI / xAI / etc. — later)

### 1. Clone & Install

```bash
git clone https://github.com/parulgupta-afk/Quilio.git
cd Quilio

# Server
cd server
npm install
cp .env.example .env   # fill in values

# Client
cd ../client
npm install
```

### 2. Run Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Roadmap (High Level)

- **Phase 0–1**: Foundation & setup (current)
- **Phase 2–4**: Auth + Profiles
- **Phase 5–10**: Blogging engine + Social layer + Feed + Search → **V1 Deploy**
- **Phase 11–18**: Embeddings + RAG Chat with citations → **AI V1**
- **Phase 19–25**: Learn Mode + Quizzes + Recommendations
- Later: Knowledge Graph, Forking, Real-time, etc.

## One Architectural Principle

One ingestion pipeline (chunk → embed → store) powers multiple features:
- RAG chat with individual posts
- Semantic recommendations
- Knowledge graph

---

Built as a portfolio-grade full-stack + AI project.
