# Operations

## Routes

- `/`, `/en`, `/ru`: public site, Latvian by default, English second and Russian third.
- `/articles`, `/en/articles`, `/ru/articles`: published journal.
- `/articles/:slug`, `/en/articles/:slug`, `/ru/articles/:slug`: published articles only.
- `/account`, `/en/account`, `/ru/account`: private browser-bound booking history and code lookup.
- `/privacy`, `/en/privacy`, `/ru/privacy`: privacy and essential-cookie information.
- `/admin`: password-protected owner workspace with a Latvian-only interface and LV/EN/RU content editors.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`: discovery metadata, excluding private routes.
- `/api/health`: readiness and database connectivity check.

## Persistence

The single SQLite database is `/data/skinstinct.db` in production. Uploads are `/data/uploads`. WAL journaling and a five-second busy timeout are enabled. Booking writes use an immediate transaction with availability rechecked inside it. Do not run multiple application replicas with separate databases.

Use Railway volume backups and verify a restore plan before real customer onboarding. Do not copy raw customer data into Git, project notes, chat or external tools. Use metadata-only diagnostics where possible. Avoid redeploying without the persistent volume attached.

## Authentication

Admin login uses an initial salted scrypt hash from Railway configuration. Later password changes are stored as salted hashes in the database and override the initial hash. Sessions are random tokens, only their SHA-256 hashes are stored, and browser cookies are HttpOnly, SameSite=Lax and Secure in production. Sessions last 12 hours.

The initial password is generated locally and saved outside Git with Windows user encryption. The owner can explicitly run `scripts/Open-Admin.ps1` to open the site and paste it. Never print a password or an auth/session file in tools, logs or chat. After changing the password, save it in the owner's password manager.

Customers get a private browser cookie and a random booking code shown once. Code lookup also requires the original contact. Calendar export and cancellation require ownership. Phone/email alone is not an account login.

All writes require a matching browser Origin. Public forms and login have database-backed rate limits. Input and uploads are size-bounded while streaming. Uploaded images are decoded and re-encoded to WebP, with generated filenames and fixed storage paths. Raw HTML is never accepted for published article bodies.

## Scheduling

All bookings use Europe/Riga, including daylight saving transitions. New requests may be placed up to 90 days ahead, at least one hour before start. The initial schedule is a template: Monday to Friday, 10:00-18:00. Default consultation/diagnostic length is 60 minutes, corneotherapy 90 minutes, with 15-minute buffers. The owner must confirm the actual schedule and durations.

Pending and confirmed visits both occupy time. Cancelled visits release it. Restoring a cancelled visit checks for conflicts again. Single-day blocks close additional time without silently cancelling existing clients. Customer cancellation is allowed until 24 hours before start by default; the owner may change this window.

## Integrations

There is no Google OAuth/Calendar sync, mail transport, SMS gateway or online payment configured. Do not label stored requests as emailed or confirmed. iCalendar download is available. A future Google integration should use a separate provider module, verified delegated authorization and explicit reconciliation of calendar conflicts.

## Release checks

Appearance uses Cormorant Garamond headings and Manrope navigation/body text. Keep the portrait's image clipping inside `.portrait-image-frame`; the reveal container and caption must remain unmasked. Left/right reveals calculate their travel from the available viewport margin and honor reduced-motion settings.

The default theme is automatic. SunCalc calculates daily sunrise/sunset using Jekabpils city-centre coordinates (56.5, 25.86), not a studio address. Calendar dates and displayed times use Europe/Riga, including DST. The browser schedules the next solar transition and refreshes after midnight, focus and tab visibility changes. No external sunrise API or visitor geolocation is used.

The theme picker supports automatic, light and dark modes. Manual overrides persist in `skinstinct-theme-mode` and take precedence until automatic mode is selected again. The first-paint script applies the same solar logic before hydration. Previous `skinstinct-theme` values belong to the earlier manual-only control and are no longer used.

1. Inspect git status and preserve unrelated changes.
2. Run typecheck, production build and isolated integration tests.
3. Audit actual mobile viewports at 320/360/390/430px for document overflow, all three languages and both themes, open menu, booking states and fixed dock.
4. Push to GitHub main.
5. Verify Railway terminal success, matching commit and public HTTPS response.
6. Repeat mobile overflow and key-page checks on production. Never use synthetic production bookings that could hide real client data.
