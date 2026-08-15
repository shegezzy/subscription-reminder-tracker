# Day 4 End-of-Day Report — Authentication Backend

## Completed

- Added registration and login services with bcrypt password hashing and generic invalid-credential responses.
- Added short-lived access tokens and refresh tokens, both delivered only in HTTP-only cookies; secure cookies are enabled in production.
- Added authenticated access-token middleware and `GET /api/auth/me`.
- Added logout behavior that clears both session cookies.
- Added backend validation for registration/login fields and JWT environment-secret validation.
- Removed a MongoDB credential that had been present in the environment example and replaced it with a safe placeholder.

## Files changed

- `backend/package.json`, `package-lock.json`, `backend/.env.example`
- `backend/src/config/env.ts`, `backend/src/models/user.model.ts`
- `backend/src/services/auth.service.ts`, `backend/src/routes/auth.routes.ts`
- `backend/src/middleware/authenticate.ts`, `backend/src/utils/auth-tokens.ts`, `backend/src/types/auth.ts`
- `backend/src/app.ts`, `backend/src/server.ts`
- `backend/tests/auth-tokens.test.ts`, `backend/tests/architecture.test.ts`

## Tests

- `npm run lint --workspace backend` — passed.
- `npm run typecheck --workspace backend` — passed.
- `npm run test --workspace backend` — passed: 4 test files and 11 tests.
- `npm run build --workspace backend` — passed.

## Problems

- A MongoDB credential was already committed in the Day 3 version of `backend/.env.example`. It was removed from the working tree, but it remains in Git history and must be revoked/rotated in MongoDB Atlas.

## Next day

Build the frontend login and registration flows.

## Git

Recommended commit message: `feat: implement secure authentication`
