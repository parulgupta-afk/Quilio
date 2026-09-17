# Quilio — Setup (Windows)

## 1. Extract this zip and open a terminal in the Quilio folder

## 2. Server
```
cd server
copy .env.example .env
```
Edit `.env` and set:
- MONGODB_URI
- JWT_SECRET
- GEMINI_API_KEY
- CLIENT_URL=http://localhost:5173

```
npm install
npm run dev
```

## 3. Client (new terminal)
```
cd client
```
If you had an old install, delete `node_modules` and `package-lock.json` first.

```
npm install
npm run dev
```

Open http://localhost:5173

## Important
- This client does NOT use Tailwind. UI is pure CSS (dark theme).
- Do not mix with old HTML prototype files.
- If UI is blank: hard refresh Ctrl+Shift+R and check browser console.
