# Local lesson and checkout integration

This work is on `feat/local-lesson-video-payments`, based on main `fc1585d` and
Mayar `acbfa78`. It has not been pushed or deployed. Existing application folders
and the approved navy/blue interface remain in place.

## Lesson model and access

The admin creates a grade, a course, then one lesson containing one YouTube URL.
The server validates the HTTPS URL against exact YouTube hosts and stores its
11-character `videoId`. It does not fetch arbitrary user URLs. The lesson also
stores description, private admin notes, thumbnail, order, duration, publication
status and free-preview flag. The separate Video model/router and admin video
pages are removed; old dashboard URLs redirect to `/admin/lessons`.

- Public course/lesson responses never include the video ID or internal notes.
- `GET /api/v1/lessons/:id/playback` checks publication, course/module membership
  and access on the server. Free lessons are public. Paid lessons require login
  and an active subscription (or an Admin account).
- Anonymous paid access returns `401 LOGIN_REQUIRED`; a non-subscriber receives
  `403 SUBSCRIPTION_REQUIRED`. Login, registration, plans and checkout preserve
  the destination and return to that lesson after verified payment.
- Admin create/update use `/api/v1/admin/lessons` and accept `youtubeUrl` plus
  the existing lesson fields. Multipart uploads use the `thumbnail` field.
- Favorites and progress refer to lessons. All PDF files remain public.

The official YouTube iframe is used with site-colored play/pause, sound and
fullscreen controls below it. The provider frame is neither covered nor cropped.
YouTube branding cannot be guaranteed hidden; `modestbranding` no longer controls
it. The server sends `strict-origin-when-cross-origin` so YouTube receives the
origin required to identify the embedding site. Videos must allow embedding;
unlisted videos are suitable but are not DRM. An authorized viewer can still
discover/share the external ID. A separate local smoke test confirmed real YouTube playback through this component
without a provider double. Playback on the production domain still needs verification.

## Existing video data

Back up the database and uploads, verify a restore, and stop application writes
before applying a migration. Use the intended backend environment:

```text
npm run migrate:check --prefix BackEnd
npm run migrate:videos:check --prefix BackEnd
```

Resolve reported schema/relationship issues before the corresponding `:apply`
command. The video migration only maps an unambiguous single supported video to
its lesson. It refuses orphan records, multiple videos, unsupported providers,
and conflicting lesson IDs/access flags. Nothing is silently discarded.

`migrate:videos:apply` saves original lesson/video records in
`lesson_video_migration_backups`, copies fields and favorites, and marks the old
video as migrated. It retains the old videos collection and can be rerun. Startup
refuses unmigrated old videos. Review any rollback against the saved records with
writes stopped; do not automatically restore over newer edits.

## MyFatoorah configuration

All credentials belong in `BackEnd/.env` (ignored by Git) or the server's secret
environment. Never put them in frontend `VITE_*` settings. Checkout is disabled
by default. To test a real sandbox checkout supply:

```dotenv
PAYMENTS_ENABLED=true
MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com
MYFATOORAH_API_KEY=<sandbox key>
MYFATOORAH_WEBHOOK_SECRET=<webhook signature secret>
MYFATOORAH_BASE_CURRENCY=KWD
PAYMENT_FRONTEND_URL=https://<public frontend origin>
PAYMENT_PUBLIC_API_URL=https://<public backend origin>
```

Use public HTTPS origins with no path/query; localhost URLs cannot receive the
provider callbacks. Configure `FRONTEND_URL`/CORS for the exact frontend origin.
Plan currency must match the merchant account's base currency. KWD amounts have
1000 minor units; historical `Payment.price_snapshot` remains in major units.

With writes controlled and duplicate data reviewed, run:

```text
npm run db:indexes --prefix BackEnd
```

Required uniqueness covers payment idempotency keys, one open order per user,
provider invoice references, subscription payment order IDs and webhook event IDs.
Production startup with provider credentials and the reconciliation command
refuse missing uniqueness indexes. Index creation never drops existing indexes.

Enable MyFatoorah **Webhook V2 / PAYMENT_STATUS_CHANGED (event code 1)** at
`https://<backend>/api/v1/payments/webhook`. The endpoint validates the
`myfatoorah-signature` HMAC, then fetches the invoice from MyFatoorah again. It
checks invoice/customer reference, customer email, value, currency and successful
transaction status before granting access. Browser return URLs alone grant nothing.

Checkout totals come from the server. Requests persist their idempotency key and
order before contacting the provider. Retries reuse an open invoice; ambiguous
timeouts never automatically create another charge. Signed notification replays,
parallel callbacks and interrupted settlement are handled idempotently. Renewals
extend the last entitlement by calendar months. Payment and subscription records
are retained for audit.

Run `npm run payments:reconcile --prefix BackEnd` periodically on the server to
check pending/created orders after browser abandonment or provider/network delays.
It checks up to 100 oldest orders per run and reports counts only. Monitor failures
and unresolved old orders; resolve them before they fill the batch. If an invoice
exists after an ambiguous create call but its checkout URL was lost, review it in
the MyFatoorah portal and reconcile its confirmed result. Do not create a second
invoice or grant access based on a user's screenshot.

Refunds, chargebacks and subscription cancellation are not automated in this
version. They need an agreed operator/provider workflow before public paid launch.
No real charge/refund has been attempted, and sandbox credentials are still absent.

## Verification and local use

Start the existing local MongoDB and run backend and frontend in separate terminals:

```text
cd BackEnd
npm run dev
```

```text
cd FrontEnd/aldiwanya-platform
npm run dev -- --host 127.0.0.1
```

Visit `http://127.0.0.1:5173`. Use the existing local admin account; the integration
does not reset its password or populate the user's database with sample content.
For an empty development database, the existing `seed:admin` command is documented
in DEPLOYMENT.md. Add a course/lesson through the dashboard to try the new form.

Automated database tests use only random disposable databases on local port 27028.
Playwright uses a separate test-only server and database and removes that database
on shutdown. Fake payment endpoints and the YouTube API double exist only in test
files; production startup never imports them. No simulated payments are added to
the user's normal database.

Commands: `npm run lint`, `npm run build`, `npm test` at the repository root;
`npx playwright test` inside the frontend after building. Install Playwright's
Chromium once if necessary. `PLAYWRIGHT_CHANNEL=chrome` optionally uses installed
Chrome. Node 24 and MongoDB 9 were used locally.

Local results: lint and the production frontend build passed; 28 backend tests passed. Five browser flows passed: public browsing,
publication, registration/playback/favorites/progress, unified admin editing, and
paid lesson → registration → simulated checkout → verified return to the lesson.
The separate browser PDF save-to-disk check failed with `download.path: canceled`.
The backend serves the PDF successfully, and a standalone text download outside
the app reproduces the cancellation in this execution environment. The failing
test is retained and must be rerun in an unrestricted normal browser environment.

The payment browser test uses a provider double; it does not verify live merchant
credentials, actual settlement or live webhook delivery. Those checks require the
sandbox account and public HTTPS test URL before launch. A separate local browser
smoke test successfully played a real YouTube embed after the referrer-policy fix.

References: [MyFatoorah ExecutePayment](https://docs.myfatoorah.com/docs/execute-payment),
[webhook signatures](https://docs.myfatoorah.com/docs/webhook-signature),
[YouTube embed requirements](https://developers.google.com/youtube/terms/required-minimum-functionality).
