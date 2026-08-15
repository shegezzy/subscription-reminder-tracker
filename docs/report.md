# Day 3 End-of-Day Report — MongoDB

## Completed

- Added Mongoose and `MONGODB_URI` environment validation.
- Added MongoDB connect/disconnect helpers; the server connects before listening.
- Added foundational User and Subscription schemas with timestamps and required indexes.
- Added mocked tests for successful and failed connection handling.

## Files changed

- `backend/package.json`, `package-lock.json`, `backend/.env.example`
- `backend/src/config/database.ts`, `backend/src/config/env.ts`, `backend/src/server.ts`
- `backend/src/models/user.model.ts`, `backend/src/models/subscription.model.ts`, `backend/src/models/index.ts`
- `backend/tests/database.test.ts`

## Tests

- `npm run lint --workspace backend` — passed.
- `npm run typecheck --workspace backend` — passed.
- `npm run test --workspace backend` — passed: 3 test files and 9 tests.
- `npm run build --workspace backend` — passed.

## Problems

- None. The non-interactive shell defaults to Node 18, so verification explicitly used the installed Node 20.20.2 runtime.

## Next day

Implement secure registration, login, logout, and authenticated-user access.

## Git

Recommended commit message: `feat: configure mongodb and mongoose`
