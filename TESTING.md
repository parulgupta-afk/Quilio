# Testing

## Automated (server)

```bash
cd server
npm install
npm test
```

Uses Node’s built-in test runner + Supertest:

- `validateBody` unit tests
- demo-login production gate (source check)
- `GET /api/health`
- auth routes return 400 on invalid bodies

## CI

GitHub Actions (`.github/workflows/ci.yml`):

- `server` → `npm test`
- `client` → `npm run build`

## Manual smoke checklist

1. Register / login / logout  
2. Create & publish post  
3. Open post → like, comment, bookmark  
4. Chat with post → sources appear  
5. Learn This → quiz  
6. Follow another user  
7. Profile edit + avatar  
8. Search by title keyword  
9. `GET /api/health` → database connected  
