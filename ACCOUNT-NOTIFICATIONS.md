# Account avatars and notifications

Local change on `feat/local-lesson-video-payments`. No deployment or remote push.

## Avatars

Students upload/change/remove their avatar in `/account`; admins do so in
`/admin/settings` or by clicking their name/photo in the admin navbar. The navbar
uses the real current name and image; its old dropdown arrow has been removed.
Updates refresh all connected sessions belonging to that account.

`POST /api/v1/user/me/avatar` accepts one multipart field named `avatar`;
`DELETE /api/v1/user/me/avatar` removes it. Both use the authenticated account,
never a user ID supplied by the client. Uploads are limited to 5 MB and 20 million
decoded pixels, require actual JPEG/PNG/WebP data, reject animated images, and are
decoded/re-encoded to a maximum 512×512 WebP without metadata. Files are stored in
`UPLOAD_DIR/avatars`; MongoDB stores only the current `User.avatarUrl` string.

Replacement updates the account atomically and deletes the exact previously
referenced file, including simultaneous replacements. Invalid uploads preserve the
current image. An old-file cleanup failure is surfaced to the uploader rather than
reported as successful deletion; check storage permissions if this occurs. Image
files use random generated names; path deletion cannot target arbitrary files.

## Notifications

- Students: a newly published course, a published lesson in a visible course/module,
  and confirmation of a paid subscription.
- Admins: new student registration and a verified successful payment.

Publication events are deduplicated per course/lesson; subsequent edits or
republishing do not repeat the same announcement. Students registered after an
announcement are not retroactively added to its audience. Draft content and
unconfirmed/failed payments do not generate success announcements.

`NotificationEvent` stores the delivery event. A worker retries undelivered stored
events every 30 seconds; per-recipient unique notification keys make delivery
retries safe. `Notification` stores the feed/read state for each account. The bell
loads the saved feed after reconnect, supports pagination, marks individual
notifications read, and supports marking all read. Existing documents are not
seeded with historic announcements when this feature starts.

Authenticated endpoints:

- `GET /api/v1/notifications?before=<cursor>`: 20 items, next cursor, unread count.
- `PATCH /api/v1/notifications/:id/read`: current user's item only.
- `PATCH /api/v1/notifications/read-all`: current user's unread items only.

Socket.IO uses `/socket.io` on the API origin and the JWT in the handshake `auth`
object, not a query string. The server assigns private user rooms; clients cannot
choose a room, send notifications, or choose recipients. Socket events contain
invalidation signals only; actual content is fetched through the authenticated
API. Logout/password reset closes sockets, token expiration is enforced, and
periodic checks also catch revoked/deleted accounts. Allowed origins reuse
`FRONTEND_URL`. Vite proxies both WebSocket upgrades and polling locally.

## Server setup

Install the updated lockfiles with the existing `npm run install:all` workflow.
Run the reviewed `npm run db:indexes --prefix BackEnd` before production startup;
the server checks the notification deduplication index and never deletes indexes.
The upload directory must remain persistent and writable by the Node process.

The reverse proxy must forward `/socket.io/` to the Node backend, allow WebSocket
upgrades, preserve query strings, and use a read timeout above Socket.IO's heartbeat
window (for example 75 seconds). No separate socket port or new secrets are needed.
This version runs one Node process; multiple instances require shared Socket.IO
pub/sub and polling-session affinity before scaling.

Tests use disposable MongoDB databases on port 27028. They cover decoded-image
validation, file replacement/removal/concurrency, unauthorized writes, real socket
connections, origin rejection, feed ownership, offline delivery/replay, pagination,
read persistence, logout and expiration. Browser coverage uses two accounts to
verify both navbars, live delivery, avatar replacement, links and mobile layout.

Verification on 2026-10-17: frontend lint/build passed, 37 backend tests and seven
browser flows passed. Both dependency audits reported zero known vulnerabilities.
The previously documented browser PDF save-to-disk environment limitation remains
outside this change; that test is retained and was not rerun in this focused suite.
The normal local API, frontend and Socket.IO proxy each returned HTTP 200. All
sample accounts, images and notification actions were tested in disposable databases.
