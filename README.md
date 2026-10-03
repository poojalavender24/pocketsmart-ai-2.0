# PocketSmart AI
Personal money assistant: React (Vite) + Node/Express + MongoDB. Sign up with a Gmail address and a password, then log in with email + password. No OTP at sign-up or login (an email code is used only for Forgot password).

## Run
1. Install Node 18+ and MongoDB (local, or an Atlas URI).
2. `cp backend/.env.example backend/.env` and edit it.
3. `npm run setup` then `npm run dev`
4. Open http://localhost:5173

**Gmail OTP and alerts:** set SMTP_USER and SMTP_PASS (a Google App Password: Google Account > Security > 2-Step Verification > App passwords). Leave blank in dev and OTPs print in the API terminal.
**Only Gmail allowed?** To accept any email, edit the regex in backend/routes/auth.js (register).
**SMS later:** backend/services/notify.js still has an `sms` function (Twilio). Call it from the routes to add SMS again.

## Structure
- backend/config/categories.js - add a category = add one line
- backend/routes/ - one file per feature, mounted in server.js
- backend/services/notify.js - email + SMS
- frontend/src/pages/ - Auth.jsx, Dashboard.jsx
