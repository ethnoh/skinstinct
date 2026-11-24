# Automatic booking and optional WhatsApp delivery

New bookings are inserted as `confirmed` in the same SQLite immediate transaction as the overlap check and quoted price. Existing pending bookings retain their status. WhatsApp delivery failure never cancels a confirmed appointment.

WhatsApp is not active until the owner completes Meta onboarding and the required configuration is present. `/api/notifications/options` returns per-language availability without credentials. The optional, initially unchecked notification choice is shown only for a configured language. Opt-in requires a valid international phone number; Latvian eight-digit numbers are normalized with +371. Consent and its timestamp are stored for that booking only.

## Owner setup

1. Open https://developers.facebook.com/apps and create an app with the WhatsApp use case in the owner's Meta business portfolio. The owner must complete personal, company, phone and payment confirmations required by Meta. No paid provider has been purchased by this implementation.
2. Register a production sender through a supported onboarding flow. An existing WhatsApp/WhatsApp Business app number requires checking migration or supported coexistence eligibility before changing it. Do not delete or migrate the owner's existing account as an incidental setup step. The site contact phone can remain +37126054744 regardless of the selected automated sender.
3. Set up a long-lived system-user access token with WhatsApp messaging permissions, the production Phone Number ID, App Secret, and a randomly generated webhook verification token. Enter secrets directly into the owner Railway service variables through a secure setup flow; never into Git, public administration fields or chat.
4. Add callback `https://skinstinct.lv/api/whatsapp` and subscribe to the `messages` webhook. POST callbacks require `X-Hub-Signature-256` HMAC over the raw body. GET verification requires the configured verification token. Only matching sender-phone metadata and known outbound message IDs are processed; incoming chats are not stored.
5. Create and approve the two utility templates below for each desired language. All have eight positional BODY parameters: customer name, visit date (Europe/Riga), visit time, selected procedure, booked price/range or price-choice description, studio address, studio telephone, scheduling note. Confirm the template language codes in Meta; the app defaults to `lv`, `en`, `ru` and supports explicit overrides.
6. Add the template names and required configuration. Set `WHATSAPP_ENABLED=true` only after an owner-authorized end-to-end delivery test using an owner's test appointment and number, webhook delivery status, and the scheduled reminder check. Disable Railway server sleeping so the reminder worker stays running.

Required environment names, with no values in source:

`WHATSAPP_ENABLED`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`.

For each of LV/EN/RU: `WHATSAPP_CONFIRMATION_TEMPLATE_LV`, `WHATSAPP_REMINDER_TEMPLATE_LV` (replace suffix for each language). Optional overrides: `WHATSAPP_LANGUAGE_LV`, `WHATSAPP_LANGUAGE_EN`, `WHATSAPP_LANGUAGE_RU`. Optional `WHATSAPP_GRAPH_VERSION` defaults to supported `v23.0` and must be reviewed with Meta version changes.

## Utility template bodies

Name examples: `skinstinct_confirmation`, `skinstinct_reminder`. Create language variants under those names, with matching configured identifiers.

LV confirmation:

    Sveika/-s, {{1}}! Tavs SKINSTINCT pieraksts ir apstiprināts.
    Datums: {{2}}. Laiks: {{3}}.
    Procedūra: {{4}}. Cena: {{5}}.
    Adrese: {{6}}. Tālrunis: {{7}}.
    {{8}} Jautājumu gadījumā sazinies ar studiju.

LV reminder:

    Sveika/-s, {{1}}! Atgādinām par Tavu SKINSTINCT vizīti.
    Datums: {{2}}. Laiks: {{3}}.
    Procedūra: {{4}}. Cena: {{5}}.
    Adrese: {{6}}. Tālrunis: {{7}}.
    {{8}} Gaidīsim Tevi studijā.

EN confirmation:

    Hello {{1}}, your SKINSTINCT appointment is confirmed.
    Date: {{2}}. Time: {{3}}.
    Treatment: {{4}}. Price: {{5}}.
    Address: {{6}}. Telephone: {{7}}.
    {{8}} Please contact the studio if you have questions.

EN reminder:

    Hello {{1}}, this is a reminder about your SKINSTINCT appointment.
    Date: {{2}}. Time: {{3}}.
    Treatment: {{4}}. Price: {{5}}.
    Address: {{6}}. Telephone: {{7}}.
    {{8}} We look forward to seeing you.

RU confirmation:

    Здравствуйте, {{1}}! Ваш визит в SKINSTINCT подтверждён.
    Дата: {{2}}. Время: {{3}}.
    Процедура: {{4}}. Стоимость: {{5}}.
    Адрес: {{6}}. Телефон: {{7}}.
    {{8}} Если есть вопросы, свяжитесь со студией.

RU reminder:

    Здравствуйте, {{1}}! Напоминаем о Вашем визите в SKINSTINCT.
    Дата: {{2}}. Время: {{3}}.
    Процедура: {{4}}. Стоимость: {{5}}.
    Адрес: {{6}}. Телефон: {{7}}.
    {{8}} Будем рады Вас видеть.

## Queue, failure handling and operations

The SQLite outbox is on the existing persistent volume with foreign-key cascade when an appointment is removed under its retention policy. Unique `(booking_id, kind)` prevents duplicate enqueue. Confirmation is queued in the booking transaction. A reminder is queued for 24 hours before the Europe/Riga appointment instant only when the appointment is booked more than 24 hours ahead. Late bookings get one confirmation, not a second immediate reminder.

Next.js instrumentation runs the worker every 30 seconds when enabled; `after()` also triggers processing after an opted-in booking. Transactional claims prevent overlapping requests/workers claiming the same job. Cancellation, expired appointments and opted-out bookings are checked before sending. Admin can stop a booking's pending notifications. No historical bookings are enrolled automatically.

Provider acceptance is distinct from delivered/read; signed webhook statuses update the administrative delivery panel. Only an explicit provider HTTP 429 is retried with backoff, up to five attempts. A network timeout or interrupted send can have been accepted upstream and is marked `unknown`, without blind automatic retry. Inspect delivery in WhatsApp Manager before any manual intervention. Failed/unknown delivery does not imply appointment failure. No SMS fallback is configured or promised. Full message bodies, provider responses and tokens are not logged.

Keep the single application replica and persistent `/data` volume. A queue is durable across restart, but no application can deliver while hosting is stopped; monitor hosting and delivery failures. Run a provider delivery and scheduled-reminder smoke test before advertising WhatsApp availability. Schema changes are additive; disable `WHATSAPP_ENABLED` to stop the worker and hide enrollment without reverting bookings.

Sources reviewed 2026-11-24:

- https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages
- https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
