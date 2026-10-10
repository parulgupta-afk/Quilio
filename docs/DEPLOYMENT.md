# Deployment checklist

## Backend (Render / Railway / Fly)

1. Root directory: `server`
2. Start: `npm start`
3. Env: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`, Cloudinary, `GOOGLE_CLIENT_ID`, `NODE_ENV=production`
4. Health: `GET /api/health` → `database: connected`

## Frontend (Vercel / Netlify)

1. Root: `client`
2. Build: `npm run build` · Output: `dist`
3. Proxy `/api` to backend **or** set `VITE_API_URL` if you change the API client
4. Socket: ensure WebSocket reaches the API (`/socket.io`)

## Smoke tests

- [ ] Landing / boot → welcome
- [ ] Register + login
- [ ] Publish post
- [ ] Chat with post (sources present or grounded refusal)
- [ ] Learn This / quiz
- [ ] Notification appears after like/follow (with socket connected)
- [ ] Refresh protected routes

## Security

- Demo login must return 403 in production
- Never commit `.env`
- CORS `CLIENT_URL` must match real origin
