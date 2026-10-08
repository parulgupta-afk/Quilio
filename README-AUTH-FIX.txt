AUTH FIX — email 401 + Google

WHY LOGIN RETURNED 401
- Wrong password, or demo users created with a bad password hash earlier.
- Fix: re-run seed (resets demo passwords to demo1234).

WHY GOOGLE DID NOTHING
- Auth11 button was a stub ("not enabled yet").
- Now uses Google Identity Services when VITE_GOOGLE_CLIENT_ID is set.

STEPS
1. Copy files into your project (see terminal commands from Grok).
2. cd server && npm run seed
3. Optional Google: create Web client ID, put in client/.env:
     VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   Restart vite after changing .env
4. Login with aria@quilio.app / demo1234  OR  "1-click Demo login"
