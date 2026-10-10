# Quilio deployment

## Prerequisites

- MongoDB Atlas cluster + connection string
- Gemini API key
- JWT secret (long random string)
- Optional: Cloudinary, Google OAuth client

## Backend (Render)

1. New Web Service → connect GitHub repo  
2. **Root directory:** `server`  
3. **Build:** `npm install`  
4. **Start:** `npm start`  
5. Environment variables (see `server/.env.example`):

| Variable | Required |
|----------|----------|
| `MONGODB_URI` | yes |
| `JWT_SECRET` | yes |
| `CLIENT_URL` | yes (Vercel URL, no trailing slash) |
| `GEMINI_API_KEY` | yes for AI |
| `GEMINI_CHAT_MODEL` | optional (default `gemini-3.6-flash`) |
| `GEMINI_EMBEDDING_MODEL` | optional (default `gemini-embedding-001`) |
| `EMBEDDING_DIMS` | optional (default `768`) |
| Cloudinary / Google | optional |

6. Health check: `GET https://<api-host>/api/health`  
   Expect JSON with API status and database connection field.

Blueprint: root `render.yaml`.

## Frontend (Vercel)

1. Project root: `client`  
2. Build: `npm run build` · Output: `dist`  
3. Edit `client/vercel.json` — replace `YOUR-API-HOST` with the Render hostname (no `https://` scheme issues: use full origin in destination).

Example rewrite destination: `https://quilio-api.onrender.com/api/$1`

Optional env on Vercel:

- `VITE_API_URL=https://quilio-api.onrender.com` (if not using rewrites)
- `VITE_SOCKET_URL=https://quilio-api.onrender.com`

4. Ensure SPA fallback rewrite to `/index.html` remains.

## Post-deploy smoke checklist

Run manually after deploy (do not claim done without doing so):

1. Welcome page loads  
2. Register / login  
3. Home feed  
4. Open article  
5. AI chat (needs Gemini)  
6. Learn This  
7. Notifications list  
8. Fork / revisions if logged in as post owner  

## Not automated here

- Public production URL is **not** set until you deploy  
- Screenshots / demo video must be captured from a running instance  
