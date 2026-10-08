# Integrated deployment

The existing directories remain `BackEnd` and `FrontEnd/aldiwanya-platform`.
The latter contains both the student interface and admin dashboard. Node 24 LTS
and MongoDB 8 are the tested runtime versions.

## Install and start

1. Run `npm run install:all` at the repository root.
2. Copy `BackEnd/.env.example` to `BackEnd/.env`. Supply your MongoDB URI, a
   cryptographically random JWT secret of at least 32 bytes, and the exact public
   HTTPS origin in `FRONTEND_URL`. All credentials belong only in the server environment.
3. Run `npm run build`. Set `NODE_ENV=production` and `SERVE_FRONTEND=true` in the
   backend environment. Run `npm start` from the repository root.
4. Terminate HTTPS at your reverse proxy, forward to port 5000, and set
   `TRUST_PROXY_HOPS` to the actual trusted proxy count. Do not expose MongoDB.
5. Mount persistent storage at `UPLOAD_DIR`, readable and writable by the service.
   Back up MongoDB and this directory together. Use `/health` for readiness.

The backend serves the built frontend including direct SPA routes. Browser calls
use `/api/v1` on the same origin. Development uses backend port 5000 and Vite at
127.0.0.1:5173. The optional frontend `.env.example` contains public configuration
only. Never place credentials in `VITE_*` variables.

## Existing database / migration

Back up and test restore before applying changes to a real database. First run
`npm run migrate:check --prefix BackEnd`. This is read-only and reports unresolved
legacy relationships. Resolve every reported problem before proceeding.
Run `npm run migrate:apply --prefix BackEnd` only against the intended database
after reviewing its dry run. The repeatable migration converts numeric course
grades into Grade references, maps active/inactive course statuses to
published/draft, and derives lesson.courseId from its existing module. It does
not drop collections, reset data, or delete modules. Legacy grade values are retained.
Startup refuses known legacy schema shapes to avoid silently losing content.

Production auto-indexing is disabled. Run `npm run db:indexes --prefix BackEnd` after migration and before opening traffic. This creates missing indexes without dropping existing ones and stops on duplicate-data or index conflicts. On a new empty database, create/review the
schema indexes as a deployment step; on an existing database first audit duplicate
email, phone, grade legacyNumber, plan duration, payment idempotency and subscription
paymentOrderId values. Do not blindly sync indexes on a production database.

Set ADMIN_EMAIL, ADMIN_PASSWORD (12–72 characters) and ADMIN_PHONE temporarily and
run `npm run seed:admin --prefix BackEnd`. Existing accounts are not overwritten.
Remove the seed credentials afterwards. There is no built-in administrator password.

Configure SMTP and MAIL_FROM for password-reset delivery. Reset tokens are one-use;
password resets revoke existing sessions. SMTP delivery and the public server's
HTTPS/proxy configuration require a deployment smoke test with your own settings.

## Payments

Checkout is deliberately unavailable for this initial release. The API returns
503 / PAYMENTS_NOT_ENABLED and the student UI explains that payments are unavailable.
There is no fake successful checkout and no client-side subscription activation.
The server-only MyFatoorah adapter implements InitiatePayment, ExecutePayment and
GetPaymentStatus. Credentials must never be sent to the browser. API mapping is
tested with a mocked provider; no live provider charge has been made.

Before enabling payments implement and test server-calculated totals, persistent
idempotent payment orders, verified provider settlement/webhooks, amount/currency/
customer matching, replay protection, refunds and reconciliation. Redirects alone
must never grant access. Do not reinterpret historical payment amounts: the legacy
Payment.price_snapshot field is a major-unit amount; Plan.amountMinor uses minor
units (KWD has 1000 minor units). Subscription.paymentOrderId now references Payment
while retaining the field name and collection for compatibility; audit historical
references before enabling settlement.

Provider reference: https://docs.myfatoorah.com/docs/execute-payment

## Verification and initial-release limitations

Run `npm run lint`, `npm run build`, and `npm test` at the root. The integration
suite requires a disposable local MongoDB at 127.0.0.1:27028; it creates and removes
only uniquely named `aldiwanya_integration_*` databases. It never reads DB_URI from
the caller. Tests cover authentication, authorization, canonical content CRUD,
protected uploads, migration, reset-token replay and disabled checkout.

Storage analytics, global admin search, marketing/footer links, social login and
newsletter integrations still require product configuration. Payment cancellation
is intentionally unavailable until the financial workflow is implemented. Video
delivery currently accepts HTTPS media URLs; a signed streaming/CDN integration is
needed if link sharing must be prevented. Access to the URL through the API is
restricted by subscription, but an already disclosed external URL cannot be revoked
by this application. Upload signatures and size checks do not replace malware scanning.
Removed/replaced PDF binaries are retained for recovery; review a retention policy
before cleaning them up. These are explicit limits of the initial release, not
claims of completed external integrations.

## Integration decisions

- Mayar content/module/plan/profile functionality and maryam admin/grade/PDF work
  share one Course and Lesson model. Course.grade references Grade; Lesson.courseId
  is canonical and optional moduleId retains structured module navigation.
- Amna student components live inside the existing frontend, with real API auth,
  library, profile and subscriptions instead of local demo identities.
- `/api/v1` is canonical; legacy API routes remain available for existing clients.
- All admin reads and writes require an authenticated Admin role. Paid PDFs are
  never exposed through a public static directory.
- Course/module/lesson deletion rejects dependent content rather than cascading
  away another developer's work. No developer branch is deleted or history rewritten.

