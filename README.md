# SKINSTINCT

A bilingual Latvian/Russian cosmetology studio website for Valērija Razujeva in Jēkabpils. Built with Next.js, React, TypeScript and SQLite. GitHub `main` is the source of truth and triggers Railway deployment.

## Included

- Responsive editorial design based on the supplied peach, olive and gold SKINSTINCT logo.
- Self-hosted fonts, optimized WebP photography and an identity-reference portrait.
- Appointment requests with a three-step service, date/time and contact flow.
- Live availability, pending reservations, appointment confirmation, cancellations, visit history, private booking-code lookup and iCalendar download.
- Server-side overlap checks inside SQLite immediate transactions, including configurable service duration and buffers.
- Private admin for appointments, opening hours, time blocks, messages, bilingual content, images, services, prices, article drafts/publication and password changes.
- Contact forms requiring a name and at least one valid phone/email.
- Server rendering, canonical URLs, language alternatives, social cards, structured data, dynamic sitemap, robots and `llms.txt`.
- Privacy notice, essential-cookie notice and settings. No advertising or analytics integrations.

## Local development

Requires Node.js 22 and npm. No `.env` is required for the public preview.

```powershell
npm ci
npm run dev
```

For a production preview with protected administrator access:

```powershell
npm run build
./scripts/Provision-Admin.ps1 -StartPreview
```

The provisioning script creates a random initial password, saves it using Windows current-user encryption outside the repository, and supplies only its scrypt hash to the server. Run `./scripts/Open-Admin.ps1 -Url http://localhost:3000` yourself to open Chrome and paste the initial password from the clipboard. After changing the password in the admin, use your password manager instead of the initial-password helper.

## Checks

```powershell
npm run typecheck
npm run build
npm test
```

The integration tests start an isolated production server with a temporary database and synthetic contacts. They test simultaneous booking attempts, access isolation, booking-code lookup, cancellation, admin editing, upload processing, draft/public article access, contact alternatives, restart persistence and Riga daylight saving conversions. They do not modify the live database.

## Production

Railway project: `6a94610d-2e1c-4aed-b0d9-764b4efa1575` (`SKINSTINCT`).
Existing service: `9299dc12-f714-44cd-8260-87a853f9f518`.
Repository: `https://github.com/ethnoh/skinstinct`, branch `main`.

Deploy using normal GitHub commits and pushes. Do not use `railway up` for this project. The Dockerfile produces the Next.js standalone server. Health check: `/api/health`.

The app requires a persistent volume mounted at `/data`. `DATA_DIR=/data` is set in the image. The database and uploaded images must remain outside the container's ephemeral filesystem. Keep this SQLite deployment at one service replica; use Postgres/shared storage before horizontal scaling.

Runtime configuration:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Public canonical HTTPS origin, without trailing slash. Falls back to Railway public domain. |
| `DATA_DIR` | Persistent database/upload directory, default `.data` locally and `/data` in Docker. |
| `ADMIN_PASSWORD_HASH` | Initial `salt:scrypt-64-byte-hex` password hash. Never commit a value. |
| `PORT` | HTTP listener port supplied by Railway. |

`scripts/Provision-Admin.ps1 -ConfigureRailway` configures the initial hash through stdin without printing the password. The script targets only the exact SKINSTINCT service. A password changed inside the app takes precedence and is stored as a salted scrypt hash in the persistent database.

## Owner launch checklist

1. Confirm actual opening hours, service duration and price in the admin.
2. Add the exact studio address and business phone/email.
3. Confirm legal data-controller name, company registration and legal address in Settings. The privacy policy uses these fields.
4. Review the generated portrait and all Latvian/Russian copy with the owner.
5. Keep requests in pending status until the studio personally confirms them.
6. Set up and verify persistent-volume backups in the Railway dashboard before customer use. The application does not claim that a backup policy has been configured.

## Current integration boundaries

- Google account login and Google Calendar synchronization are intentionally left for the next stage. iCalendar export already works.
- The app saves bookings and inquiries in the admin. It does not yet send automatic email, SMS or push notifications.
- The supplied Instagram says the studio is being established. Initial availability is an editable schedule template and appointments require personal confirmation. Prices remain “by agreement” until the owner sets them.
- Customers see bookings created with their private browser cookie. On another device they can retrieve an individual booking with its random code and the original contact. Phone/email alone never exposes appointment history.
- Booking details expire after 12 months; inquiries after 6 months. Cleanup runs on application requests, at most once per hour. Admin sessions expire in 12 hours.
- Initial article content is studio news adapted from the supplied Instagram, without invented client reviews, treatment outcomes or unsupported certifications.

See [docs/CONTENT-SOURCES.md](docs/CONTENT-SOURCES.md), [docs/ASSETS.md](docs/ASSETS.md) and [docs/OPERATIONS.md](docs/OPERATIONS.md).
