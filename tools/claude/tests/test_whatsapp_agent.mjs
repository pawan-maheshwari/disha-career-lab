// node tools/claude/tests/test_whatsapp_agent.mjs
// Exercises the WhatsApp agent with fake Meta / Supabase / Claude endpoints.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createAgent, validSignature } from "../../../supabase/functions/whatsapp-agent/index.ts";
import { instantAnswer, PRICES } from "../../../supabase/functions/whatsapp-agent/knowledge.ts";

let pass = 0;
const ok = (c, m) => { assert.ok(c, m); pass++; };

/* ---- FAQ routing */
const id = (t) => instantAnswer(t)?.id ?? null;
ok(id("hi") === "greet", "hi → greet");
ok(id("What is the fee?") === "fees", "fee");
ok(id("2") === "fees", "menu 2 → fees");
ok(id("my 2 kids") !== "fees", "bare digit only as whole message");
ok(id("When is the AI workshop?") === "webinar", "webinar");
ok(id("how to sign up") === "start", "sign up");
ok(id("I want to talk to someone") === "human", "human");
ok(id("शुल्क कितना है") === "fees" && instantAnswer("शुल्क कितना है").lang === "hi", "hindi fees");
ok(id("payment failed but money deducted") === "payment", "payment");
ok(id("should my son take PCM or PCB if he likes biology but is weak at chemistry and maths overall") === null, "long nuanced → LLM");

/* ---- prices agree with the site's post-early-bird figures */
const eb = readFileSync(new URL("../../../earlybird-module.js", import.meta.url), "utf8");
for (const [c, p] of Object.entries(PRICES)) {
  const m = eb.match(new RegExp(`"${c}":\\s*"([^"]+)"`));
  ok(m && p.en.replace(/\s/g, "").includes(m[1].replace(/\\u20B9/g, "₹").replace(/\s/g, "")), `price ${c} matches earlybird next`);
}

/* ---- webhook flow with fakes */
const env = {
  WA_VERIFY_TOKEN: "vt", WA_APP_SECRET: "sec", WA_ACCESS_TOKEN: "tok", WA_PHONE_NUMBER_ID: "123",
  ANTHROPIC_API_KEY: "ak", ADMIN_TOKEN: "adm", SUPABASE_URL: "https://db", SUPABASE_SERVICE_ROLE_KEY: "srk",
};
const sent = [], claudeCalls = [];
const msgs = new Set(), contacts = {};
const fake = async (url, init = {}) => {
  const u = String(url), body = init.body ? JSON.parse(init.body) : null;
  const R = (o, s = 200) => new Response(o === null ? "" : JSON.stringify(o), { status: s });
  if (u.startsWith("https://graph.facebook.com")) { if (body.type === "text") sent.push(body); return R({}); }
  if (u.startsWith("https://api.anthropic.com")) {
    claudeCalls.push(body);
    return R({ content: [{ type: "text", text: "LLM answer" }] });
  }
  if (u.includes("/wa_messages?on_conflict")) {
    if (msgs.has(body.msg_id)) return R([]);
    msgs.add(body.msg_id); return R([body]);
  }
  if (u.includes("/wa_messages?wa_id")) return R([{ direction: "in", body: "q" }]);
  if (u.endsWith("/wa_messages")) return R(null, 201);
  if (u.includes("/wa_contacts?wa_id")) { const w = decodeURIComponent(u.split("eq.")[1].split("&")[0]); return R(contacts[w] ? [contacts[w]] : []); }
  if (u.includes("/wa_contacts?on_conflict")) { contacts[body.wa_id] = { ...(contacts[body.wa_id] || {}), ...body }; return R(null, 201); }
  throw new Error("unexpected " + u);
};
const agent = createAgent(env, fake);
const sign = (raw) => "sha256=" + createHmac("sha256", "sec").update(raw).digest("hex");
const hook = (from, text, mid) => {
  const raw = JSON.stringify({ entry: [{ changes: [{ value: {
    contacts: [{ wa_id: from, profile: { name: "Asha" } }],
    messages: [{ from, id: mid, type: "text", text: { body: text } }] } }] }] });
  return new Request("https://x/functions/v1/whatsapp-agent", { method: "POST", body: raw, headers: { "x-hub-signature-256": sign(raw) } });
};

// verification
let r = await agent.handle(new Request("https://x/w?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42"));
ok(r.status === 200 && (await r.text()) === "42", "verify ok");
r = await agent.handle(new Request("https://x/w?hub.mode=subscribe&hub.verify_token=no&hub.challenge=42"));
ok(r.status === 403, "verify rejects wrong token");

// signature
ok(await validSignature("sec", "abc", sign("abc")), "sig valid");
r = await agent.handle(new Request("https://x/w", { method: "POST", body: "{}", headers: { "x-hub-signature-256": "sha256=00" } }));
ok(r.status === 401, "bad signature rejected");

// FAQ answer
r = await agent.handle(hook("919800000001", "fees?", "m1"));
ok(r.status === 200 && sent.length === 1 && sent[0].to === "919800000001" && sent[0].text.body.includes("2,499"), "fees answered");
ok(claudeCalls.length === 0, "FAQ did not call Claude");

// duplicate delivery ignored
await agent.handle(hook("919800000001", "fees?", "m1"));
ok(sent.length === 1, "retry deduped");

// LLM fallback
await agent.handle(hook("919800000001", "Is commerce a good idea for someone who loves drawing and design?", "m2"));
ok(sent.length === 2 && sent[1].text.body === "LLM answer" && claudeCalls.length === 1, "LLM answered");
ok(claudeCalls[0].system.includes("DISHA") && claudeCalls[0].messages.at(-1).role === "user", "LLM request shape");

// handoff pauses bot
await agent.handle(hook("919800000002", "5", "m3"));
ok(contacts["919800000002"].needs_human === true && contacts["919800000002"].paused_until, "handoff flagged");
const before = sent.length;
await agent.handle(hook("919800000002", "hello?", "m4"));
ok(sent.length === before, "bot quiet while paused");
await agent.handle(hook("919800000002", "menu", "m5"));
ok(sent.length === before + 1 && contacts["919800000002"].paused_until === null, "menu resumes bot");

// admin reply
r = await agent.handle(new Request("https://x/functions/v1/whatsapp-agent/reply", { method: "POST", headers: { authorization: "Bearer adm" }, body: JSON.stringify({ to: "+91 98000 00002", text: "Hi, Pawan here", resume: true }) }));
ok((await r.json()).ok && sent.at(-1).to === "919800000002", "admin reply sent");
r = await agent.handle(new Request("https://x/functions/v1/whatsapp-agent/reply", { method: "POST", headers: { authorization: "Bearer nope" }, body: "{}" }));
ok(r.status === 401, "admin reply needs token");

// coexistence: a teammate replies from the phone → bot pauses for that chat
{
  const raw = JSON.stringify({ entry: [{ changes: [{ field: "smb_message_echoes", value: {
    message_echoes: [{ from: "916360740608", to: "919800000004", id: "e1", type: "text", text: { body: "Hi, Megha from DISHA" } }] } }] }] });
  await agent.handle(new Request("https://x/w", { method: "POST", body: raw, headers: { "x-hub-signature-256": sign(raw) } }));
  ok(contacts["919800000004"]?.paused_until, "echo pauses bot");
  const n = sent.length;
  await agent.handle(hook("919800000004", "thanks, and the fee?", "m7"));
  ok(sent.length === n, "bot quiet after human replied from app");
}

// no API key → fallback text, no crash
const noKey = createAgent({ ...env, ANTHROPIC_API_KEY: "" }, fake);
await noKey.handle(hook("919800000003", "Tell me something about quantum biology careers in Finland please now", "m6"));
ok(sent.at(-1).text.body.includes("support@dishacareerlab.com"), "fallback without key");

console.log(`whatsapp agent: ${pass} checks passed`);
