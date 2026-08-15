# Subscription Renewal Reminder

Never get surprised by a recurring charge again.

Tracks subscriptions, free trials, and other recurring expenses, and reminds
you before they renew. Manual tracking only — no bank or card integration.

## Status

🚧 Day 2 of 30 — Backend architecture. The backend now has a modular HTTP
foundation with runtime configuration validation, centralized errors, request
logging, and consistent API error responses. See the 30-day plan for scope.

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

## Scripts (root)

- `npm run lint` — lint both workspaces
- `npm run typecheck` — type-check both workspaces
- `npm run build` — build both workspaces
- `npm run test` — run backend tests


