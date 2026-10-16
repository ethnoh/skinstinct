# Release verification

Date: 2026-10-17, Europe/Riga.

## Automated checks

- TypeScript check passed.
- Production build passed.
- Prettier check passed.
- Seven isolated integration checks passed: server-rendered public pages/private access, concurrent booking exclusion, customer isolation/cancellation/calendar export, admin content/upload/publishing, alternative contacts, restart persistence and Riga daylight saving conversion.

Tests use a temporary database, synthetic contacts and an isolated listener. No synthetic appointments or messages were submitted to the production studio.

## Browser checks

- Actual device emulation at 320, 360, 390 and 430 CSS pixels, with viewport sizes verified using `innerWidth`.
- Latvian and Russian homepages: document scroll width equals client width.
- Booking service, calendar/time and contact states: no document overflow at all four widths.
- All eight authenticated admin tabs: 32 viewport checks passed with synthetic local data.
- Account, journal, article and login pages checked at 320px.
- A long Russian privacy heading originally overflowed at 320px. The heading's font size and wrapping were corrected; all four privacy viewport checks passed afterward.
- Desktop public and admin layouts visually reviewed.
- The fixed mobile booking dock stays within the viewport. Forms use 16px inputs on mobile.

## Deployment checks

Railway project SKINSTINCT, existing GitHub-backed service, single replica in EU West. Persistent `/data` volume attached. Public domain targets the actual listener at port 8080. HTTPS, health route, both language pages, privacy, journal, admin login, robots, sitemap and llms endpoint returned 200.

The initial protected administrator login and workspace read passed on production, without printing credentials, session tokens or customer rows. The test-created admin session was logged out afterward.

Repeat the public mobile checks on the final deployed commit before handing off.
