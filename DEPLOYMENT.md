# Integrated deployment

The existing directories remain `BackEnd` and `FrontEnd/aldiwanya-platform`.
The latter contains both the student interface and admin dashboard. Node 24 LTS
and local MongoDB 9 are the runtime versions used for the lesson/payment tests.

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

Run `npm run seed:admin --prefix BackEnd` to create the administrator once.
For NODE_ENV=development (or test) with a loopback MongoDB URI, the seed defaults to
email `admin@example.com`, password `AldiwanyaLocal!2026`, phone `+96550000009`.
These are public local-demo credentials. For any non-local database or production,
explicit ADMIN_EMAIL, ADMIN_PASSWORD (at least 12 characters, at most 72 UTF-8 bytes)
and ADMIN_PHONE are required, and the demo password is rejected.
Environment values override the defaults. Existing accounts/passwords are never
overwritten; conflicting email/phone or a Student account causes the seed to stop.
Remove seed credentials from the environment after creating the account.

An authenticated administrator can change their own password under
`/admin/settings` using the current password, new password and confirmation.
The endpoint is `PATCH /api/v1/admin/password` with `currentPassword`, `newPassword`
and `confirmPassword`. It revokes all existing sessions and outstanding reset tokens;
the administrator must log in again. Anonymous callers and students cannot use it,
and no target user ID is accepted. For a forgotten current password, use the existing
email reset flow after configuring SMTP; this endpoint is not a recovery bypass.

Configure SMTP and MAIL_FROM for password-reset delivery. Reset tokens are one-use;
password resets revoke existing sessions. SMTP delivery and the public server's
HTTPS/proxy configuration require a deployment smoke test with your own settings.

## Payments

Checkout, server verification and signed MyFatoorah V2 payment notifications are
implemented. Checkout stays disabled by default until the server credentials and
public HTTPS callback origins are configured. The local test harness simulates the
external gateway; it cannot charge a card and is never imported by the production server.

See [LESSON-PAYMENTS.md](LESSON-PAYMENTS.md) for configuration, migration, callback
validation, replay protection, reconciliation, and the remaining external checks.
Redirects alone never activate access. Plan.amountMinor uses minor units (KWD has
1000); the existing Payment.price_snapshot remains a major-unit snapshot.

Production startup with provider credentials refuses missing payment uniqueness
indexes. Run the reviewed `db:indexes` step before enabling checkout; it does not
drop existing indexes or repair duplicate data automatically.

Refunds, chargebacks and subscription cancellation are not automated. They require
an operator workflow and provider-account configuration before a public paid launch.
No real provider charge or refund has been made during this local implementation.

## Verification and initial-release limitations

Run `npm run lint`, `npm run build`, and `npm test` at the root. The integration
suite requires a disposable local MongoDB at 127.0.0.1:27028; it creates and removes
only uniquely named `aldiwanya_integration_*` databases. It never reads DB_URI from
the caller. Tests cover authentication, authorization, canonical content CRUD,
validated public PDF uploads, migration, reset-token replay, lesson playback gating,
verified payment settlement, retry/concurrency handling and disabled checkout.

Storage analytics, global admin search, marketing/footer links, social login and
newsletter integrations still require product configuration. Payment cancellation
is intentionally unavailable until the financial workflow is implemented. Each lesson now stores one YouTube video ID extracted by the backend from its URL.
A signed streaming/CDN integration is needed if link sharing must be prevented.
Playback ID disclosure is restricted by subscription for paid lessons, but an
already disclosed YouTube ID cannot be revoked by this application. The official
YouTube iframe retains its branding and provider controls; it is not DRM. Upload signatures and size checks do not replace malware scanning.
Removed/replaced PDF binaries are retained for recovery; review a retention policy
before cleaning them up. These are explicit limits of the initial release, not
claims of completed external integrations.

## Integration decisions

- Mayar content/module/plan/profile functionality and maryam admin/grade/PDF work
  share one Course and Lesson model. Course.grade references Grade; Lesson.courseId
  is canonical and optional moduleId retains structured module navigation.
- The student interface uses the approved navy/blue visual identity within the
  existing frontend, with real API authentication, library, profile and subscriptions.
- `/api/v1` is canonical; legacy API routes remain available for existing clients.
- All admin reads and writes require an authenticated Admin role. All PDFs are free and publicly served from `/uploads/pdfs`, including files uploaded before this change. The `/library` page and PDF list/download API require no login. Upload/edit/delete operations still require Admin.
- Course/module/lesson deletion rejects dependent content rather than cascading
  away another developer's work. No developer branch is deleted or history rewritten.


## Public PDF policy and lesson creation

The admin creates a Grade, a Course referencing that Grade, then a Lesson referencing that Course. The unified lesson form requires a course and a YouTube URL and saves lesson details and the extracted video ID together. There is no separate Video model or admin video section; old admin video links redirect to lessons. Legacy modules and their APIs remain available for existing content. Before starting against a database containing old video documents, run `migrate:videos:check`, review the results, then `migrate:videos:apply` with writes stopped. See LESSON-PAYMENTS.md; the migration preserves the old records and refuses ambiguous one-to-many mappings.

All PDF binaries in UPLOAD_DIR/pdfs are public, regardless of legacy isFreePreview or subscription state. Active records appear in the public library. Inactive, replaced or deleted records are removed from the listing but their retained binaries remain accessible by URL. This is deliberate for the requested public-folder policy. No database rewrite or physical file movement is needed. Do not store private documents in this directory.
