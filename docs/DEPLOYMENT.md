# Deployment

## Backend (Render)

1. New Web Service from GitHub repo  
2. Root: `server` · Build: `npm install` · Start: `npm start`  
3. Set env vars from `server/.env.example`  
4. Confirm `GET https://<api>/api/health`

Optional: use root `render.yaml` blueprint.

## Frontend (Vercel)

1. Root: `client` · Build: `npm run build` · Output: `dist`  
2. Edit `client/vercel.json` — replace `YOUR-API-HOST` with your Render URL  
3. Or use Vite proxy only for local dev and set production API base in the client if you change `api.js`

## Smoke

Register → login → publish → chat → learn → logout
