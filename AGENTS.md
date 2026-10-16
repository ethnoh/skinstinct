# SKINSTINCT working rules

- Read README.md and docs/OPERATIONS.md before changes.
- Communicate with Edgar in Russian. Keep filenames, identifiers and code comments English.
- Run git status before edits and Git operations. Preserve other agents' changes.
- GitHub main is the source of truth; commit and push ordinary ready changes. Railway auto-deploys from GitHub. Do not run railway up.
- Use Railway CLI, never Railway MCP. Assert project 6a94610d-2e1c-4aed-b0d9-764b4efa1575 before infrastructure changes.
- Do not read or edit .env files or expose credentials, private customer data, database contents or session tokens.
- Production SQLite and uploads require the persistent /data volume and a single application replica. Do not detach, replace or delete that volume.
- Do not seed or replace a live database. Initial content is inserted only when missing.
- The studio is in Jekabpils, not Riga. Public source is https://www.instagram.com/vr_skinstinct/ . Do not invent prices, contact details, reviews or clinical results.
- Keep pending requests visibly distinct from personally confirmed appointments. Do not imply Google Calendar, email or SMS integration exists.
- Test document scrollWidth equals clientWidth at actual viewport widths 320, 360, 390 and 430 CSS pixels, including Russian, booking steps and mobile navigation. A desktop window resize may stop at 500px; use actual device emulation.
- Run typecheck, production build and the isolated integration suite for meaningful changes. Never run tests against production customer data.
- Do not use em or en dashes in generated copy.
