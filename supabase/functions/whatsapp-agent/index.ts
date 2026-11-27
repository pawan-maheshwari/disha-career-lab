/* ===========================================================================
   DISHA WhatsApp agent — Supabase Edge Function
   ---------------------------------------------------------------------------
   Meta WhatsApp Cloud API webhook → answers student/parent queries about
   dishacareerlab.com.

     GET  /whatsapp-agent            Meta webhook verification (hub.challenge)
     POST /whatsapp-agent            incoming messages (signature-checked)
     POST /whatsapp-agent/reply      admin sends a manual reply  {to, text}
                                     header: Authorization: Bearer ADMIN_TOKEN

   Answer order: instant FAQ (knowledge.ts) → Claude (if ANTHROPIC_API_KEY)
   → fallback menu. "5"/"talk to a person" flags the chat for the team and
   pauses the bot for that number (BOT_PAUSE_HOURS) so a human can take over.

   Secrets (supabase secrets set …): see docs/WHATSAPP-AGENT.md
   =========================================================================== */

import {
  detectLang, FALLBACK, instantAnswer, NON_TEXT, SYSTEM_PROMPT, type Lang,
} from "./knowledge.ts";

export type Env = {
  WA_VERIFY_TOKEN: string;        // any string; same value in Meta webhook settings
  WA_APP_SECRET: string;          // Meta app secret — verifies X-Hub-Signature-256
  WA_ACCESS_TOKEN: string;        // permanent system-user token
  WA_PHONE_NUMBER_ID: string;     // from WhatsApp → API Setup
  GRAPH_VERSION?: string;         // default v23.0
  ANTHROPIC_API_KEY?: string;     // optional — without it the FAQ layer still works
  CLAUDE_MODEL?: string;          // default claude-haiku-5-5
  ADMIN_TOKEN?: string;           // enables POST /reply
  ADMIN_WA_NUMBER?: string;       // optional — gets a ping when a chat is handed off
  SUPABASE_URL?: string;          // auto-injected in Supabase
  SUPABASE_SERVICE_ROLE_KEY?: string;
  DAILY_LIMIT?: string;           // per-number replies per day, default 40
  BOT_PAUSE_HOURS?: string;       // bot silence after handoff, default 12
};

type Fetch = typeof fetch;
const enc = new TextEncoder();

/* ------------------------------------------------------------ helpers */
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function validSignature(secret: string, body: string, header: string | null): Promise<boolean> {
  if (!secret || !header || !header.startsWith("sha256=")) return false;
  return safeEqual(header.slice(7), await hmacHex(secret, body));
}

/* Incoming message → plain text the agent can answer. */
export function textOf(m: any): string | null {
  if (!m) return null;
  if (m.type === "text") return m.text?.body ?? null;
  if (m.type === "interactive") return m.interactive?.button_reply?.id ?? m.interactive?.list_reply?.id ?? null;
  if (m.type === "button") return m.button?.text ?? null;
  return null;
}

/* ------------------------------------------------------------ the agent */
export function createAgent(env: Env, fetchImpl: Fetch = fetch) {
  const graph = `https://graph.facebook.com/${env.GRAPH_VERSION || "v23.0"}/${env.WA_PHONE_NUMBER_ID}/messages`;
  const dailyLimit = Number(env.DAILY_LIMIT || 40);
  const pauseHours = Number(env.BOT_PAUSE_HOURS || 12);
  const hasDb = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

  /* --- Supabase REST (no SDK, so this file also runs under Node tests) */
  async function db(path: string, init: RequestInit = {}) {
    if (!hasDb) return null;
    const r = await fetchImpl(`${env.SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
    });
    if (!r.ok) { console.error("db", path, r.status, await r.text()); return null; }
    const t = await r.text();
    return t ? JSON.parse(t) : [];
  }

  /* Insert the message id first: Meta retries webhooks, and a duplicate
     id means we have already answered this one. */
  async function firstSeen(msgId: string, waId: string, body: string): Promise<boolean> {
    if (!hasDb) return true;
    const rows = await db("wa_messages?on_conflict=msg_id", {
      method: "POST",
      headers: { prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ msg_id: msgId, wa_id: waId, direction: "in", body }),
    });
    return Array.isArray(rows) && rows.length > 0;
  }

  async function contact(waId: string) {
    const rows = await db(`wa_contacts?wa_id=eq.${encodeURIComponent(waId)}&select=*`);
    return rows && rows[0] ? rows[0] : null;
  }

  async function upsertContact(row: Record<string, unknown>) {
    await db("wa_contacts?on_conflict=wa_id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(row),
    });
  }

  async function history(waId: string): Promise<{ role: "user" | "assistant"; content: string }[]> {
    const rows = await db(`wa_messages?wa_id=eq.${encodeURIComponent(waId)}&select=direction,body&order=created_at.desc&limit=10`);
    if (!rows) return [];
    return rows.reverse().filter((r: any) => r.body)
      .map((r: any) => ({ role: r.direction === "in" ? "user" : "assistant", content: String(r.body) }));
  }

  async function logOut(waId: string, body: string, source: string) {
    await db("wa_messages", { method: "POST", body: JSON.stringify({ wa_id: waId, direction: "out", body, source }) });
  }

  /* --- WhatsApp send */
  async function send(to: string, body: string) {
    const r = await fetchImpl(graph, {
      method: "POST",
      headers: { authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4000), preview_url: true } }),
    });
    if (!r.ok) console.error("wa send", r.status, await r.text());
    return r.ok;
  }

  async function markRead(msgId: string) {
    await fetchImpl(graph, {
      method: "POST",
      headers: { authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: msgId }),
    }).catch(() => {});
  }

  /* --- Claude */
  async function askClaude(waId: string, text: string): Promise<string | null> {
    if (!env.ANTHROPIC_API_KEY) return null;
    const past = await history(waId);
    const messages = [...past];
    /* history already holds this message (logged on arrival); make sure the
       conversation ends on the user's turn and alternates cleanly */
    if (!messages.length || messages[messages.length - 1].content !== text) messages.push({ role: "user", content: text });
    const merged: typeof messages = [];
    for (const m of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) last.content += "\n" + m.content; else merged.push({ ...m });
    }
    while (merged.length && merged[0].role !== "user") merged.shift();
    try {
      const r = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: env.CLAUDE_MODEL || "claude-haiku-5-5", max_tokens: 400, system: SYSTEM_PROMPT, messages: merged }),
      });
      if (!r.ok) { console.error("claude", r.status, await r.text()); return null; }
      const out = await r.json();
      const reply = (out.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n").trim();
      return reply || null;
    } catch (e) {
      console.error("claude", e);
      return null;
    }
  }

  /* --- one incoming message */
  async function handleMessage(m: any, profileName?: string) {
    const waId = String(m.from);
    const text = textOf(m);
    const fresh = await firstSeen(m.id, waId, text ?? `[${m.type}]`);
    if (!fresh) return { skipped: "duplicate" };
    markRead(m.id);

    const today = new Date().toISOString().slice(0, 10);
    const c = await contact(waId);
    const count = c && c.day === today ? Number(c.day_count || 0) : 0;
    const lang: Lang = text ? detectLang(text) : (c?.lang || "en");

    /* paused for a human — log only, stay quiet (unless they ask for the menu) */
    const paused = c?.paused_until && new Date(c.paused_until).getTime() > Date.now();
    if (paused && !(text && /^(menu|मेनू|bot)$/i.test(text.trim()))) {
      await upsertContact({ wa_id: waId, name: profileName ?? c?.name, last_seen: new Date().toISOString() });
      return { skipped: "human" };
    }

    if (count >= dailyLimit) {
      if (count === dailyLimit) await send(waId, lang === "hi"
        ? "आज के लिए संदेश सीमा पूरी हो गई। कल फिर लिखें, या support@dishacareerlab.com पर ईमेल करें।"
        : "You've reached today's message limit. Please write again tomorrow, or email support@dishacareerlab.com.");
      await upsertContact({ wa_id: waId, day: today, day_count: count + 1 });
      return { skipped: "limit" };
    }

    let reply: string, source: string, handoff = false;
    if (!text) {
      reply = NON_TEXT[lang]; source = "non-text";
    } else {
      const hit = instantAnswer(text);
      if (hit) {
        reply = hit.reply; source = "faq:" + hit.id; handoff = hit.id === "human";
      } else {
        const ai = await askClaude(waId, text);
        reply = ai ?? FALLBACK[lang]; source = ai ? "llm" : "fallback";
      }
    }

    await send(waId, reply);
    await logOut(waId, reply, source);
    await upsertContact({
      wa_id: waId, name: profileName ?? c?.name ?? null, lang, day: today, day_count: count + 1,
      last_seen: new Date().toISOString(),
      ...(paused ? { paused_until: null } : {}),   // "menu" during a pause resumes the bot
      ...(handoff ? { needs_human: true, paused_until: new Date(Date.now() + pauseHours * 3600e3).toISOString() } : {}),
    });
    if (handoff && env.ADMIN_WA_NUMBER) {
      await send(env.ADMIN_WA_NUMBER, `DISHA WhatsApp handoff: ${profileName || "student"} (+${waId}) asked for a person. Reply via /whatsapp-agent/reply.`);
    }
    return { replied: source };
  }

  /* --- a reply typed on the phone (coexistence echo) */
  async function humanEcho(e: any) {
    const waId = String(e.to || "").replace(/\D/g, "");
    if (!waId) return;
    await logOut(waId, textOf(e) ?? `[${e.type}]`, "human-app");
    await upsertContact({
      wa_id: waId, needs_human: false,
      paused_until: new Date(Date.now() + pauseHours * 3600e3).toISOString(),
    });
  }

  /* --- HTTP entry */
  async function handle(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const ok = url.searchParams.get("hub.mode") === "subscribe" &&
        url.searchParams.get("hub.verify_token") === env.WA_VERIFY_TOKEN;
      return ok ? new Response(url.searchParams.get("hub.challenge") || "", { status: 200 }) : new Response("forbidden", { status: 403 });
    }

    if (req.method === "POST" && url.pathname.endsWith("/reply")) {
      const auth = req.headers.get("authorization") || "";
      if (!env.ADMIN_TOKEN || !safeEqual(auth, `Bearer ${env.ADMIN_TOKEN}`)) return json({ error: "unauthorised" }, 401);
      const { to, text, resume } = await req.json().catch(() => ({}));
      if (!to || !text) return json({ error: "to and text required" }, 400);
      const waId = String(to).replace(/\D/g, "");
      const ok = await send(waId, String(text));
      if (ok) {
        await logOut(waId, String(text), "human");
        await upsertContact({ wa_id: waId, needs_human: !resume, ...(resume ? { paused_until: null } : {}) });
      }
      return json({ ok });
    }

    if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

    const raw = await req.text();
    if (!(await validSignature(env.WA_APP_SECRET, raw, req.headers.get("x-hub-signature-256")))) {
      return new Response("bad signature", { status: 401 });
    }
    let payload: any;
    try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

    const jobs: Promise<unknown>[] = [];
    for (const entry of payload.entry || []) {
      for (const ch of entry.changes || []) {
        const v = ch.value || {};
        const names: Record<string, string> = {};
        for (const ct of v.contacts || []) names[ct.wa_id] = ct.profile?.name;
        for (const m of v.messages || []) jobs.push(handleMessage(m, names[m.from]).catch((e) => console.error("handle", e)));
        /* Coexistence: a teammate replied from the WhatsApp Business app on the
           phone (webhook field "smb_message_echoes"). Log it and pause the bot
           for that chat so it doesn't talk over the human. */
        if (ch.field === "smb_message_echoes") {
          for (const e of v.message_echoes || []) jobs.push(humanEcho(e).catch((err) => console.error("echo", err)));
        }
        /* v.statuses (sent/delivered/read) are ignored */
      }
    }
    /* Meta expects a fast 200; finish the work in the background where the
       runtime allows it, otherwise wait (still well inside Meta's timeout). */
    const all = Promise.all(jobs);
    const rt = (globalThis as any).EdgeRuntime;
    if (rt?.waitUntil) rt.waitUntil(all); else await all;
    return new Response("ok", { status: 200 });
  }

  return { handle, handleMessage };
}

/* Deno / Supabase entry point */
const D = (globalThis as any).Deno;
if (D?.serve) {
  const env = D.env.toObject() as Env;
  const agent = createAgent(env);
  D.serve((req: Request) => agent.handle(req));
}
