# Subscription Renewal Reminder

Never get surprised by a recurring charge again.

Tracks subscriptions, free trials, and other recurring expenses, and reminds
you before they renew. Manual tracking only — no bank or card integration.

## Status

🚧 Day 10 of 30 — Authenticated users can add a subscription at
`/subscriptions/new` using a React Hook Form and Zod-validated form. It submits
to the scoped backend API and supports renewal, reminder, website, and trial
details. See the 30-day plan for scope.

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS —
  deployed on Netlify
- **Backend:** Node.js, Express, TypeScript (modular monolith) — deployed
  on Render
- **Database:** MongoDB Atlas (Mongoose) — added Day 3
- **Notifications:** Resend (email, primary), Telegram (optional) — added
  Day 19/22
- **Automation:** GitHub Actions scheduled workflows — added Day 21

Everything runs on free tiers for the MVP; see `docs/architecture.md` for
the zero-cost constraints.

## Repository layout

```
subscription-reminder/
├── frontend/     Next.js app
├── backend/      Express API
├── docs/         Architecture, database, API, security, deployment docs
└── .github/      CI/CD workflows (added Day 21)
```

## Local development

Requires Node.js >= 20.

```bash
npm install                # installs both workspaces
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

npm run dev:frontend      # http://localhost:3000
npm run dev:backend       # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health` → `{"status":"ok"}`

## Netlify deployment

Connect the repository as a Netlify site and keep the base directory at the
repository root. The committed [`netlify.toml`](netlify.toml) installs the npm
workspaces, runs `npm run build --workspace frontend`, and publishes
`frontend/.next`. Netlify detects Next.js and supplies App Router routing,
SSR, and asset handling; no SPA redirect rule is needed.

Before the production deploy, add this environment variable in Netlify for
Production (and any deploy contexts that need the API):

```text
NEXT_PUBLIC_API_URL=https://<your-render-backend-url>
```

The Render backend URL is supplied after the Day 8 Blueprint has its first
successful deploy. `NEXT_PUBLIC_*` values are embedded in the browser build,
so do not put secrets in Netlify's frontend environment variables.

## Render deployment

Create a Blueprint from the committed [`render.yaml`](render.yaml). It uses the
repository-root npm workspace lockfile, builds the backend with
`npm ci && npm run build --workspace backend`, starts it with
`npm run start --workspace backend`, and checks `GET /api/health` before
serving traffic.

During the initial Blueprint setup, provide:

```text
MONGODB_URI=mongodb+srv://<production-atlas-connection-string>
FRONTEND_URL=https://<your-netlify-site>.netlify.app
```

Render generates both JWT secrets and supplies the runtime `PORT`; do not add
them to source control. After the first successful deploy, copy the API's
HTTPS `onrender.com` URL into Netlify as `NEXT_PUBLIC_API_URL`, redeploy the
frontend, and use the public health endpoint to verify the connection.

## Scripts (root)

- `npm run lint` — lint both workspaces
- `npm run typecheck` — type-check both workspaces
- `npm run build` — build both workspaces
- `npm run test` — run backend tests
