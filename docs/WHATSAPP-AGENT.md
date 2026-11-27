# DISHA WhatsApp agent — setup

Students and parents message the DISHA WhatsApp number; "Dhruv" answers about
the assessment, fees, webinars, sign-up, payments, colleges and partnerships —
in English or Hindi — and hands over to a person on request.

```
WhatsApp user ─► Meta Cloud API ─► Supabase Edge Function  whatsapp-agent
                                     1. instant FAQ   (knowledge.ts, free)
                                     2. Claude        (only if ANTHROPIC_API_KEY set)
                                     3. fallback menu
                                   ◄─ reply  ·  logs to wa_messages / wa_contacts
```

| File | What it is |
|---|---|
| `supabase/functions/whatsapp-agent/knowledge.ts` | **Edit facts here** — prices, webinars, FAQs, LLM rules |
| `supabase/functions/whatsapp-agent/index.ts` | Webhook, signature check, dedupe, rate limit, handoff, admin reply |
| `supabase/whatsapp-schema.sql` | Tables `wa_contacts`, `wa_messages`, view `wa_handoffs` (RLS on, service-role only) |
| `whatsapp-module.js` | Site entry points (footer link, desktop pill, `#whatsapp` deep link) — hidden until `CFG.number` is set |
| `tools/claude/tests/test_whatsapp_agent.mjs` | `node tools/claude/tests/test_whatsapp_agent.mjs` |

## DISHA's number: +91 63607 40608 (WhatsApp Business app → coexistence)

The number stays on the WhatsApp Business app **and** gets Cloud API access, so
the bot answers automatically while the team can still reply from the phone.
Meta only allows this through a provider that supports coexistence onboarding
(e.g. 360dialog, Wati, Twilio, Infobip), not the standard Meta signup:

- The number must have been active in the Business app for 7+ days, app version 2.24.17+.
- In the provider's signup choose **"Connect your existing WhatsApp Business app"**, enter
  the number, scan the QR code from the app on the phone. Do **not** delete the app account.
- Open the app at least once every 13 days, or Meta deactivates coexistence.
- Subscribe the webhook to **messages** and **smb_message_echoes**. When anyone replies
  from the phone, the bot pauses for that chat for `BOT_PAUSE_HOURS`; "menu" resumes it.
- If the provider gives you its own send URL/key instead of a Meta token, set
  `WA_ACCESS_TOKEN` / `WA_PHONE_NUMBER_ID` from it; if its API differs from Meta's
  Cloud API format, tell Claude which provider — `send()` in index.ts is the only change.

## One-time setup (~45 min, standard Cloud API — use steps 2–7 with coexistence too)

1. **Meta** — at developers.facebook.com create a *Business* app → add **WhatsApp**.
   Link the PlanetAI LLP Business portfolio, add and verify a phone number that is
   **not** already on the WhatsApp app (a new SIM is simplest). Note the
   **Phone number ID**. Create a *System user* (Business settings → Users) with the
   `whatsapp_business_messaging` permission and generate a **permanent token**.
   App settings → Basic → copy the **App secret**.
2. **Database** — Supabase → SQL editor → run `supabase/whatsapp-schema.sql`.
3. **Secrets** — with the Supabase CLI, from the repo root:
   ```
   supabase link --project-ref gjhfhvssmzapjbanekiw
   supabase secrets set WA_VERIFY_TOKEN=<any-long-random-string> \
     WA_APP_SECRET=<app secret> WA_ACCESS_TOKEN=<permanent token> \
     WA_PHONE_NUMBER_ID=<phone number id> ADMIN_TOKEN=<another random string> \
     ANTHROPIC_API_KEY=<optional> ADMIN_WA_NUMBER=<optional, e.g. 9198xxxxxxxx>
   ```
4. **Deploy** — `supabase functions deploy whatsapp-agent --no-verify-jwt`
   (Meta cannot send a Supabase JWT; the function checks Meta's signature instead).
5. **Webhook** — Meta app → WhatsApp → Configuration → Callback URL
   `https://gjhfhvssmzapjbanekiw.supabase.co/functions/v1/whatsapp-agent`,
   Verify token = your `WA_VERIFY_TOKEN` → Verify → subscribe to **messages**.
6. **Site** — set `CFG.number` in `whatsapp-module.js` (digits with country code),
   run `python3 tools/claude/sync_modules.py`, push.
7. **Test** — send "hi" from your phone. Try "fees", "3", a Hindi question, then "5".

Optional settings: `CLAUDE_MODEL` (default `claude-haiku-5-5`), `DAILY_LIMIT`
(replies per number per day, 40), `BOT_PAUSE_HOURS` (bot silence after handoff, 12),
`GRAPH_VERSION` (v23.0).

## Running it

- **Chats waiting for a person:** Supabase → Table editor → view `wa_handoffs`.
- **Reply as a person** (within 24 h of their last message — WhatsApp's rule):
  ```
  curl -X POST https://gjhfhvssmzapjbanekiw.supabase.co/functions/v1/whatsapp-agent/reply \
    -H "Authorization: Bearer $ADMIN_TOKEN" -H "content-type: application/json" \
    -d '{"to":"919800000000","text":"Hi, this is the DISHA team…","resume":true}'
  ```
  `resume:true` hands the chat back to the bot; omit it to keep the bot paused.
  The user can also type **menu** to bring the bot back.
- **Change a fact** — edit `knowledge.ts`, run the test, `supabase functions deploy whatsapp-agent --no-verify-jwt`.
  Prices must match `earlybird-module.js` `CFG.next` (the test enforces it).

## Costs and limits

- Replies to user-started chats are free on WhatsApp Cloud API (service conversations);
  the bot never starts conversations, so no template approval is needed.
- Most messages are answered by the FAQ layer; Claude is called only for the rest
  (Haiku, ≤400 output tokens per reply).
- The bot can't read images, voice notes or documents — it asks for text.
