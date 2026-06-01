# Task Manager

Simple Task Manager with user authentication (JWT + optional server sessions) and CRUD for tasks across three stages: Todo, In Progress, Done.

## Features
- Register / Login
- Create / Update / Delete tasks
- Tasks grouped by stage
- JWT-based auth plus optional server-side sessions (stored in MongoDB)
- Simple REST API (Express + Mongoose)
- React + Vite frontend

## Repo layout
- backend — Express API, Mongoose models, sessions
  - server.js — main server
  - `controllers/` — auth and posts controllers
  - `routes/` — user.routes.js, posts.routes.js
  - `middleware/` — auth.middleware.js
  - `models/` — user.model.js, task.model.js
  - .env — local environment variables (not committed)
- frontend — Vite + React app
  - `src/` — app source (App.jsx, client.js, styles)
  - `index.html`, package.json, etc.

## Prerequisites
- Node.js >= 18
- npm
- MongoDB Atlas or another MongoDB URI

## Environment variables

Backend (.env):
- `MONGODB_URL` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `SESSION_SECRET` — secret for server sessions (if using sessions)
- `PORT` — (optional) host port, set by platform like Render

Frontend (frontend):
- `VITE_API_URL` (optional) — base URL of deployed backend (defaults to `http://localhost:9080`)
  - `src/client.js` uses `import.meta.env.VITE_API_URL || 'http://localhost:9080'`

Do NOT commit real secrets. Use the platform's secret/env settings for deployment.

## Local development

1. Backend
```bash
cd backend
npm install
# create .env with MONGODB_URL, JWT_SECRET, SESSION_SECRET
node server.js   # or: npm run dev if you have a dev script using nodemon
```

2. Frontend
```bash
cd frontend
npm install
npm run dev      # starts Vite dev server
# or build for production
npm run build
```

Notes:
- Backend listens on `process.env.PORT || 9080`.
- Sessions: backend uses `express-session` + `connect-mongo` and sets `req.session.userId` on login/register.
- The frontend client is in client.js and uses axios with `withCredentials: true` so cookies are sent.

## API endpoints

Auth:
- POST `/api/users/register` — { name, email, password } → returns `{ message, token, user }` and sets session cookie
- POST `/api/users/login` — { email, password } → returns `{ message, token, user }` and sets session cookie

Tasks (protected — send either session cookie or `Authorization: Bearer <token>`):
- GET `/api/posts` — list tasks for authenticated user
- POST `/api/posts` — create task: `{ title, description, stage }`
- PUT `/api/posts/:id` — update task
- DELETE `/api/posts/:id` — delete task

Health:
- GET `/` — simple JSON health check (e.g., `{ message: 'Task Manager API is running.' }`)

## Deployment notes (backend on Render example)
1. Push your backend to a Git repo and create a new Web Service on Render.
2. Set the build command (if needed): `npm install`
3. Start command: `node server.js` (or `npm start` if you add a start script)
4. Add environment variables in Render's dashboard:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `SESSION_SECRET`
5. Ensure `PORT` is not hard-coded — server listens on `process.env.PORT`.
6. If using sessions and cookies in production:
   - Serve over HTTPS and set `cookie.secure = true` in server.js.
   - Configure CORS `origin` to your frontend domain and `credentials: true`.
7. After deploy, set `VITE_API_URL` (or `BASE_URL`) in your frontend deployment to the Render backend URL.

Alternative: Serve the built dist from the backend by adding a static route (if you prefer a single deploy).

## Troubleshooting
- "Cannot GET /" on deployed root — add the health route in server.js (already included).
- "Failed to create task." — check backend logs for DB errors or token/session issues.
- Cookie issues in production — ensure `withCredentials: true` on client and `cookie.secure` + proper `sameSite` on server when using HTTPS.
- CORS errors — set `origin` to your frontend host and `credentials: true`.

## Testing
- Use Postman or curl for API checks. Example register + create (session cookie approach):
```bash
curl -i -X POST https://YOUR_BACKEND/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@example.com","password":"Password123!"}'
# Use returned Set-Cookie header on subsequent requests, or use token from response in Authorization header.
```
