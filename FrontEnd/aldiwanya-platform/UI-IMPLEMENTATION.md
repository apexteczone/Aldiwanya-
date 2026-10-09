# Reference student interface

The student/public implementation imported from Amna was removed, including its
mock dataset and local-storage demo components. The existing BackEnd and
FrontEnd/aldiwanya-platform structure and administration pages are retained.

Implemented reference layouts: home, separate login and registration, password
recovery/reset, student dashboard/account, courses/catalog, course lesson player,
free previews, library, subscription plans/history. Arabic RTL, responsive
layouts and bundled Cairo fonts are used. The existing main-branch logo is used.

Courses, grades, lessons, PDFs, plans and profiles come from the existing API.
No marketing/sample courses, students, ratings, prices or testimonials are seeded.
Missing content produces explicit empty states; server failures have retry states.
Course counts reflect published lessons, including legacy modules. PDF categories
are populated from uploaded PDF types; course filters come from grade/subject.

Student favorites, started courses and completed lessons are persisted in the
new StudentActivity collection, scoped to the authenticated user. Completion is
self-reported and does not grant access or certificates. Public previews expose
only published free videos beneath published parents; paid video URLs remain
protected by the existing subscription check. The player uses HTML5 video: admin
URLs must point to playable HTTPS media files, not a YouTube/watch webpage.

Monthly plans are supported alongside three-month and annual plans. Payment
remains disabled pending the MyFatoorah settlement integration. Prices come from
plans and use each plan's currency/minor units; no screenshot prices are copied.

Social login is visibly unavailable until providers are configured. No fake
newsletter signup, testimonial, rating or contact information is supplied. Legal
pages explicitly state that their operator text is not published yet. The
operator must supply those texts and contact channels before public launch.

## Artwork

`public/diwaniya-majlis.png` was generated with the built-in image generation tool
because the reference majlis artwork was not present on maryam. Prompt:
"Photorealistic wide Kuwaiti diwaniya at dusk, navy and burgundy geometric sofas,
carved Arabic arch on the right overlooking Kuwait Towers, brass coffee dallah,
warm lamps, dark navy negative space on the left; no text, logos or people."
Kuwait skyline and existing main logo assets are reused. Cairo license is in
`public/Cairo-OFL.txt`.

Two additional transparent decorative assets were generated with the same built-in
tool: `public/learning-books.png` (prompt: "Navy hardcover textbooks, one open
ivory-page book on top, three-quarter perspective, soft blue light, transparent
background, no text or logo") and `public/account-recovery.png` (prompt: "Glossy
azure envelope, white letter with three pale blue strokes, padlock and paper
plane, polished 3D style, transparent background, no text or logo").

## Verification

GitHub Actions runs lint, production build, API integration tests with MongoDB 8
and real-browser E2E tests on Node 24. The MongoDB service is disposable. Browser
tests exercise empty states, auth forms, API publishing, public PDF download,
disabled checkout, real video playback, saved favorites/progress/profile, direct
routes and mobile overflow. Screenshots and failure traces are workflow artifacts.
Test records and the CC0 video fixture exist only in the isolated test workflow;
none are seeded into normal application databases.

## Admin reference pages (October 2026)
- Kept the existing admin shell, logo, colors and sidebar; combined plans and student subscriptions under `/admin/subscriptions`. The old `/admin/plans` link redirects there.
- Lessons use the second approved reference: course, title, description, one-based display order, private internal notes and a searchable table. Storage order remains zero-based for compatibility. New lessons remain drafts until explicitly published. Existing attachment deletion protections remain in place.
- Internal notes are excluded by default from Mongoose queries and are selected explicitly only for the admin lesson list.
- Video creation has dependent course/lesson selectors, thumbnail upload, description, provider preview, editing and a filtered table. HTTPS file playback remains supported; YouTube and Vimeo embeds use fixed trusted iframe origins. Provider privacy/embedding settings can still prevent playback. Uploads reuse the existing file-size and content-signature validation.
- Plan forms support monthly and term durations (3/6 months), retaining existing annual plans. Prices keep the existing currency and minor-unit convention. Existing plan durations cannot be changed. Disabling a plan hides it from new purchases without deleting financial history.
- Offline viewing and device-limit controls are shown as unavailable because those capabilities are not implemented. They do not advertise false entitlements. MyFatoorah checkout remains disabled.
- No sample lessons, videos, plans or accounts are added to the application database. Fixtures exist only in isolated CI tests.
