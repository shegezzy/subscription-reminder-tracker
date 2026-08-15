# 30-Day Build Plan

## Day 1 — Foundation

### Build
- Monorepo
- Next.js frontend
- Express backend
- TypeScript
- Tailwind
- ESLint
- Prettier
- Environment files
- Basic README
- Architecture document
- Backend `/api/health`

### Do NOT build
- MongoDB
- Authentication
- Subscriptions
- Reminders
- Email
- Telegram
- Deployment

### Acceptance
- Frontend runs
- Backend runs
- Health endpoint returns 200
- Lint passes
- TypeScript passes
- Builds pass

**Commit:** `chore: initialize frontend and backend foundation`

---

## Day 2 — Backend Architecture

### Build
Backend:
- config
- controllers
- middleware
- models
- repositories
- routes
- services
- validators
- utils
- jobs

### Implement
- Environment validation
- Central error handler
- Async error handling
- Request logging
- API response conventions

### Do NOT build
- Authentication
- MongoDB models
- Subscription logic

### Acceptance
Backend structure is clean and maintainable.

**Commit:** `chore: establish backend architecture`

---

## Day 3 — MongoDB

### Build
- MongoDB Atlas connection
- Mongoose
- Connection handling
- User model
- Subscription model foundation
- Indexes
- Database configuration

### Test
- Successful connection
- Failed connection handling

### Do NOT build
- Login
- Registration
- Reminder worker

**Commit:** `feat: configure mongodb and mongoose`

---

## Day 4 — Authentication Backend

### Build
- Registration
- Password hashing
- Login
- Logout
- Authentication middleware
- Access token
- Refresh token
- HTTP-only cookies
- `/api/auth/me`

### Security / Test
- Invalid password
- Invalid token
- Expired token
- Logout
- Unauthorized API access

**Commit:** `feat: implement secure authentication`

---

## Day 5 — Authentication Frontend

### Build
- Login page
- Register page
- Logout
- Protected routes
- Authentication state
- Error handling
- Loading states

### Acceptance
User can:

```
Register
  ↓
Login
  ↓
Access protected page
  ↓
Logout
```

**Commit:** `feat: add frontend authentication flows`

---

## Day 6 — API Client + Auth Hardening

### Build
- Central API client
- Credentials handling
- Authentication error handling
- Token refresh handling
- CORS configuration
- Secure cookie configuration

### Test
- Expired access token
- Refresh flow
- Logout
- Unauthorized requests

**Commit:** `feat: harden authentication and api client`

---

## Day 7 — Netlify Deployment

Deploy frontend.

### Configure
- Production build
- Environment variables
- API URL
- Netlify configuration
- SPA/Next.js routing if required

Verify production frontend.

**Commit:** `chore: configure netlify deployment`

---

## Day 8 — Render Deployment

Deploy backend.

### Configure
- Build command
- Start command
- Environment variables
- MongoDB URI
- CORS
- Health check

### Verify
```
Netlify
  ↓
Render
  ↓
MongoDB Atlas
```

**Commit:** `chore: configure render backend deployment`

---

## Day 9 — Subscription Data Layer

### Build
- Subscription schema
- Repository
- Service
- Validation
- Controller
- Routes

### Implement
- GET
- POST
- GET `/:id`
- PATCH `/:id`
- DELETE `/:id`

Ensure all queries are scoped to authenticated user.

**Commit:** `feat: implement subscription data layer`

---

## Day 10 — Add Subscription

### Build frontend form
- Name
- Amount
- Currency
- Billing cycle
- Renewal date
- Category
- Payment method
- Website
- Reminder days
- Trial option

Use React Hook Form + Zod.

**Commit:** `feat: add subscription creation flow`

---

## Day 11 — Subscription List

### Build
- Subscription list
- Cards/table
- Search
- Sorting
- Filtering
- Loading states
- Empty state

**Commit:** `feat: add subscription list and filtering`

---

## Day 12 — Subscription Management

### Build
- Details page
- Edit
- Delete
- Pause
- Cancel
- Reactivate

Ensure cancelled/paused subscriptions behave correctly.

**Commit:** `feat: implement subscription lifecycle management`

---

## Day 13 — Renewal Calculation Engine

Build a dedicated date/renewal service.

### Support
- Weekly
- Monthly
- Quarterly
- Yearly

### Test
- January 31
- February
- Leap year
- Month-end
- Different timezones

**Commit:** `feat: implement renewal calculation engine`

---

## Day 14 — Dashboard

### Build
- Upcoming renewals
- Next charge
- Active subscriptions
- Monthly spending
- Annual projection
- Trials ending soon

**Commit:** `feat: build subscription dashboard`

---

## Day 15 — Spending Analytics

### Build
- Spending by category
- Spending by currency
- Monthly projection
- Annual projection
- Subscription count

Do not implement currency conversion.

**Commit:** `feat: add subscription spending analytics`

---

## Day 16 — Free Trials

### Build
- Trial creation
- Trial end date
- Trial countdown
- Trial status
- Trial reminders

**Commit:** `feat: add free trial tracking`

---

## Day 17 — Reminder Preferences

### Build
- Default reminder period
- Per-subscription reminder period
- Email preference
- Telegram preference

**Commit:** `feat: add reminder preferences`

---

## Day 18 — Reminder Engine

### Build
- Reminder generation
- Due reminder detection
- Reminder persistence
- Idempotency
- Duplicate prevention

Test multiple worker executions.

**Commit:** `feat: implement reminder engine`

---

## Day 19 — Resend Email

### Build
- Resend integration
- Email provider abstraction
- Renewal email
- Trial expiration email
- Email failure handling

**Commit:** `feat: integrate email notifications`

---

## Day 20 — Reminder Worker

### Build
- Standalone reminder worker
- MongoDB connection
- Reminder processing
- Notification dispatch
- Status updates
- Error handling

The worker must be safe to run multiple times.

**Commit:** `feat: implement reminder worker`

---

## Day 21 — GitHub Actions Automation

Create scheduled workflow. It should:

```
Schedule
  ↓
Run reminder worker
  ↓
Process reminders
  ↓
Send notifications
  ↓
Exit
```

### Add
- Secrets
- Logs
- Failure handling

**Commit:** `ci: automate scheduled reminder processing`

---

## Day 22 — Telegram

### Implement
- Telegram provider
- Telegram connection
- Telegram notification preference
- Telegram reminder

Email remains the primary notification channel.

**Commit:** `feat: add telegram notifications`

---

## Day 23 — Notification History

### Build
- Notification history
- Status
- Channel
- Date
- Subscription
- Failure reason where appropriate

**Commit:** `feat: add notification history`

---

## Day 24 — Search and Filtering

### Improve
- Search
- Category filter
- Status filter
- Billing-cycle filter
- Upcoming-renewal filter
- Sorting

Ensure filtering works on mobile.

**Commit:** `feat: improve subscription search and filtering`

---

## Day 25 — UX and Mobile Polish

Audit the entire application.

### Improve
- Loading states
- Empty states
- Error states
- Toasts
- Forms
- Dialogs
- Mobile navigation
- Responsive layouts
- Typography
- Accessibility

Do NOT add major new features.

**Commit:** `style: polish responsive user experience`

---

## Day 26 — Security Audit

Perform a serious security audit.

### Review
- Authentication
- Authorization
- Cookies
- CORS
- Rate limiting
- MongoDB queries
- Input validation
- Secrets
- API exposure
- Error messages
- Dependency vulnerabilities

Fix issues.

### Create
- `docs/security.md`

**Commit:** `security: harden application`

---

## Day 27 — Testing

Implement missing:
- Unit tests
- Integration tests
- E2E tests

### Prioritize
- Authentication
- Subscription CRUD
- Authorization
- Renewal calculations
- Reminder calculations
- Duplicate prevention

All important tests must pass.

**Commit:** `test: complete critical application test coverage`

---

## Day 28 — Performance and Reliability

### Review
- MongoDB indexes
- API queries
- API response times
- Frontend rendering
- Network requests
- Bundle size
- Reminder worker reliability

Fix real issues. Do not perform meaningless optimization.

**Commit:** `perf: improve application performance and reliability`

---

## Day 29 — Production Hardening

Perform complete production verification.

### Check
- Netlify
- Render
- MongoDB Atlas
- Resend
- Telegram
- GitHub Actions
- Environment variables
- Authentication
- Database
- Reminder worker

Verify production end-to-end flow. Fix remaining critical issues.

**Commit:** `chore: harden production deployment`

---

## Day 30 — Release

Perform final review.

### Update
- `README.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/security.md`
- `docs/deployment.md`

### Document
- Features
- Architecture
- Setup
- Environment variables
- Deployment
- Testing
- Known limitations
- Future roadmap

### Run
- Lint
- Type check
- Unit tests
- Integration tests
- E2E tests
- Production build

### Tag
`v1.0.0`

**Commit:** `chore: prepare v1.0.0 release`