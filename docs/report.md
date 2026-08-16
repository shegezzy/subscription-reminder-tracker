# Day 7 End-of-Day Report — Netlify Deployment

## Completed

- Configured Netlify to build the frontend from the npm-workspaces repository with `npm run build --workspace frontend`.
- Configured the Next.js build output as `frontend/.next` and pinned the Netlify build runtime to Node.js 20.9.0, which satisfies Next.js 16.
- Confirmed that no SPA fallback or manually pinned Netlify Next.js plugin is required: Netlify's managed Next.js support handles the App Router.
- Documented the Netlify setup and the required `NEXT_PUBLIC_API_URL` environment variable in the root README.
- Kept the production backend URL unset because it is deliberately a Day 8 Render deployment concern.

## Files changed

- `netlify.toml`
- `README.md`
- `docs/report.md`

## Verification

- `PATH=/Users/mac/.nvm/versions/node/v20.20.2/bin:$PATH npm run typecheck` — passed for both workspaces.
- `PATH=/Users/mac/.nvm/versions/node/v20.20.2/bin:$PATH npm run test --workspace backend` — passed: 5 test files and 14 tests.
- `npm run build --workspace backend` — passed under the local Node.js 18 runtime.
- The local default Node.js runtime is v18.16.1. It cannot build Next.js 16, which requires Node.js 20.9.0 or newer; Netlify is configured with the required Node version.
- The Node.js 20 frontend production build reaches Next.js compilation but is blocked by Turbopack's CSS worker trying to bind a local port (`Operation not permitted`); the same failure occurs outside the sandbox.
- Under Node.js 20.20.2, lint currently reports 11 pre-existing backend violations. These are outside the Day 7 deployment scope and were not changed.
- A production deployment cannot be verified from this workspace because no Netlify site/account connection or Day 8 production backend URL is available.

## Next day

Deploy the Express backend to Render, configure its production environment and CORS origin, then set the resulting URL as `NEXT_PUBLIC_API_URL` in Netlify and verify the complete production flow.

## Git

Recommended commit message: `chore: configure netlify deployment`
