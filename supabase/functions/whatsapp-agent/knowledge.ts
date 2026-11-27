/* ===========================================================================
   DISHA WhatsApp agent — knowledge base + instant answers
   ---------------------------------------------------------------------------
   The ONE place to edit what the WhatsApp agent knows. Prices, schedule,
   contact details and FAQs live here; index.ts never hard-codes a fact.

   Two layers use this file:
     1. instantAnswer()  — keyword FAQ, free and offline, answers most chats.
     2. SYSTEM_PROMPT    — handed to the LLM for anything instantAnswer misses.
   Keep both in step when you change a fact (the test checks the prices).
   =========================================================================== */

export const SITE = "https://dishacareerlab.com";
export const SUPPORT_EMAIL = "support@dishacareerlab.com";

/* Tax-inclusive list prices after the early-bird ended on 30 Sep 2026.
   Source of truth on the site: earlybird-module.js CFG.next. */
export const PRICES: Record<string, { en: string; hi: string }> = {
  India: { en: "₹2,499 incl. 18% GST (~US$28)", hi: "₹2,499 (18% GST सहित, ~US$28)" },
  Nepal: { en: "NPR 2,999 incl. 13% VAT", hi: "NPR 2,999 (13% VAT सहित)" },
  UAE: { en: "AED 999 incl. 5% VAT", hi: "AED 999 (5% VAT सहित)" },
  "South Africa": { en: "R 1,499 incl. 15% VAT", hi: "R 1,499 (15% VAT सहित)" },
};

export const WEBINARS = {
  career: {
    en: "Importance of Career Path Assessment — every Saturday, 5–6 PM IST, ₹99 per participant",
    hi: "करियर पथ मूल्यांकन का महत्व — हर शनिवार, शाम 5–6 बजे IST, ₹99 प्रति प्रतिभागी",
  },
  ai: {
    en: "AI Workshop: Introduction to Claude — every Sunday, 11 AM–1 PM IST, ₹299 per participant",
    hi: "AI कार्यशाला: Claude का परिचय — हर रविवार, सुबह 11 – दोपहर 1 बजे IST, ₹299 प्रति प्रतिभागी",
  },
};

export type Lang = "en" | "hi";

/* Devanagari anywhere in the message → reply in Hindi. */
export function detectLang(text: string): Lang {
  return /[ऀ-ॿ]/.test(text || "") ? "hi" : "en";
}

export function norm(text: string): string {
  return String(text || "").toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function has(hay: string, needle: string): boolean {
  const e = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^\\p{L}\\p{M}\\p{N}])" + e + "($|[^\\p{L}\\p{M}\\p{N}])", "u").test(hay);
}

const priceLines = (l: Lang) =>
  Object.entries(PRICES).map(([c, p]) => `• ${c}: ${p[l]}`).join("\n");

/* ------------------------------------------------------------------ FAQs
   Longest matching keyword wins, so "webinar fee" beats "fee". */
type Fact = { id: string; k: string[]; en: () => string; hi: () => string };

export const FACTS: Fact[] = [
  {
    id: "greet",
    k: ["hi", "hello", "hey", "hii", "namaste", "menu", "start", "help", "नमस्ते", "मेनू", "मदद"],
    en: () => "Hi! I'm Dhruv, DISHA Career Lab's assistant 👋\nI can help with the 5-D career assessment, fees, webinars, colleges and cut-offs.\n\nReply with a number or just ask:\n1️⃣ What is DISHA?\n2️⃣ Fees\n3️⃣ Webinars & workshops\n4️⃣ How to start\n5️⃣ Talk to a person",
    hi: () => "नमस्ते! मैं ध्रुव हूँ, DISHA करियर लैब का सहायक 👋\nमैं 5-D करियर मूल्यांकन, शुल्क, वेबिनार, कॉलेज और कटऑफ़ में मदद कर सकता हूँ।\n\nनंबर भेजें या सीधे पूछें:\n1️⃣ DISHA क्या है?\n2️⃣ शुल्क\n3️⃣ वेबिनार और कार्यशाला\n4️⃣ शुरू कैसे करें\n5️⃣ किसी व्यक्ति से बात",
  },
  {
    id: "about",
    k: ["1", "what is disha", "about disha", "disha", "5d", "5 d", "five dimensions", "dimensions", "assessment", "डिशा क्या", "आयाम", "मूल्यांकन"],
    en: () => "DISHA Career Lab's 5-D assessment measures five dimensions — Interest, Aptitude, Personality, Orientation and Emotional Skill — with 75–200 class-adaptive questions.\n\nYou get a 20+ page report with best-fit career tracks, Dream / Strong / Sure college tiers, the entrance exams and cut-offs to aim for, scholarships, and a term-by-term plan.\n\nClass 8–9: stream & subject selection. Class 10–12: career selection & planning.",
    hi: () => "DISHA करियर लैब का 5-D मूल्यांकन पाँच आयाम मापता है — रुचि, योग्यता, व्यक्तित्व, झुकाव और भावनात्मक कौशल — 75–200 कक्षा-अनुकूल प्रश्नों से।\n\nआपको 20+ पेज की रिपोर्ट मिलती है: उपयुक्त करियर, ड्रीम / स्ट्रॉन्ग / श्योर कॉलेज, प्रवेश परीक्षाएँ और कटऑफ़, छात्रवृत्तियाँ और टर्म-दर-टर्म योजना।\n\nकक्षा 8–9: स्ट्रीम व विषय चयन। कक्षा 10–12: करियर चयन व योजना।",
  },
  {
    id: "fees",
    k: ["2", "fee", "fees", "price", "pricing", "cost", "charges", "how much", "rate", "शुल्क", "फीस", "फ़ीस", "कीमत", "कितना"],
    en: () => `The 5-D assessment costs (tax-inclusive):\n${priceLines("en")}\n\nSponsored seats make it free for eligible school students. Promo codes are applied at checkout. Webinars are ₹99 / ₹299 — reply 3 for details.`,
    hi: () => `5-D मूल्यांकन का शुल्क (कर सहित):\n${priceLines("hi")}\n\nपात्र स्कूल विद्यार्थियों के लिए प्रायोजित सीटें निःशुल्क हैं। प्रोमो कोड भुगतान के समय लगता है। वेबिनार ₹99 / ₹299 — विवरण के लिए 3 भेजें।`,
  },
  {
    id: "webinar",
    k: ["3", "webinar", "webinars", "workshop", "workshops", "session", "ai workshop", "claude", "saturday", "sunday", "वेबिनार", "कार्यशाला", "वर्कशॉप"],
    en: () => `Live online sessions — open to all, no login needed:\n• ${WEBINARS.career.en}\n• ${WEBINARS.ai.en}\n\nBook at ${SITE} → Learn → Webinars. You'll get the joining link and a receipt after booking.`,
    hi: () => `लाइव ऑनलाइन सत्र — सभी के लिए, लॉगिन ज़रूरी नहीं:\n• ${WEBINARS.career.hi}\n• ${WEBINARS.ai.hi}\n\nबुकिंग: ${SITE} → Learn → Webinars। बुकिंग के बाद जुड़ने का लिंक और रसीद मिलेगी।`,
  },
  {
    id: "start",
    k: ["4", "how to start", "start assessment", "sign up", "signup", "register", "login", "log in", "otp", "account", "शुरू", "साइन अप", "लॉगिन", "रजिस्टर"],
    en: () => `To start:\n1. Open ${SITE}\n2. Choose your country, tap Sign Up and verify with the email OTP\n3. Fill your class and details (a parent/guardian consents for under-18s)\n4. Pay, then take the assessment — progress saves as you go\n\nMost students finish in 25–40 minutes. Didn't get the OTP? Check spam, wait 2 minutes and retry.`,
    hi: () => `शुरू करने के लिए:\n1. ${SITE} खोलें\n2. अपना देश चुनें, Sign Up करें और ईमेल OTP से सत्यापित करें\n3. अपनी कक्षा व विवरण भरें (18 से कम उम्र पर अभिभावक की सहमति)\n4. भुगतान करें और मूल्यांकन दें — प्रगति अपने-आप सेव होती है\n\nअधिकांश विद्यार्थी 25–40 मिनट में पूरा करते हैं। OTP नहीं मिला? स्पैम देखें, 2 मिनट बाद दोबारा कोशिश करें।`,
  },
  {
    id: "duration",
    k: ["how long", "duration", "time", "how many questions", "questions", "कितना समय", "अवधि", "कितने प्रश्न"],
    en: () => "The assessment adapts to your class: 75 questions if you've already chosen a stream, up to 200 otherwise. Most students finish in 25–40 minutes, and progress is saved as you go.",
    hi: () => "मूल्यांकन आपकी कक्षा के अनुसार बदलता है: स्ट्रीम चुन चुके हैं तो 75 प्रश्न, अन्यथा 200 तक। अधिकांश विद्यार्थी 25–40 मिनट में पूरा करते हैं, और प्रगति साथ-साथ सेव होती है।",
  },
  {
    id: "payment",
    k: ["payment", "pay", "upi", "razorpay", "card", "receipt", "invoice", "gst", "refund", "payment failed", "भुगतान", "रसीद", "रिफंड"],
    en: () => `You can pay by Razorpay link or UPI/QR on the payment screen. The fee is billed by PlanetAI LLP and the GST number appears on your receipt and certificate.\n\nPayment problem or refund request? Email ${SUPPORT_EMAIL} with your registered email and payment reference — or reply 5 to reach a person. Please never share card numbers, PINs or OTPs on chat.`,
    hi: () => `भुगतान Razorpay लिंक या UPI/QR से भुगतान स्क्रीन पर करें। शुल्क PlanetAI LLP द्वारा लिया जाता है और GST नंबर आपकी रसीद व प्रमाणपत्र पर होता है।\n\nभुगतान में दिक्कत या रिफंड? अपने पंजीकृत ईमेल और भुगतान संदर्भ के साथ ${SUPPORT_EMAIL} पर लिखें — या व्यक्ति से बात के लिए 5 भेजें। कृपया चैट पर कार्ड नंबर, PIN या OTP कभी साझा न करें।`,
  },
  {
    id: "countries",
    k: ["country", "countries", "nepal", "uae", "dubai", "south africa", "overseas", "abroad", "usa", "uk", "germany", "australia", "singapore", "france", "देश", "विदेश", "नेपाल"],
    en: () => "DISHA works for students in India, Nepal, UAE and South Africa — colleges, schools data, cut-offs and prices adapt to the country you pick.\n\nThe Overseas section covers USA, UK, France, Singapore, Germany and Australia: choose Overseas Study at sign-up and your report adds a country section with top colleges.",
    hi: () => "DISHA भारत, नेपाल, UAE और दक्षिण अफ़्रीका के विद्यार्थियों के लिए है — कॉलेज, स्कूल डेटा, कटऑफ़ और शुल्क आपके चुने देश के अनुसार बदलते हैं।\n\nविदेश अनुभाग में USA, UK, फ़्रांस, सिंगापुर, जर्मनी और ऑस्ट्रेलिया हैं: साइन अप पर Overseas Study चुनें, रिपोर्ट में उस देश के शीर्ष कॉलेज जुड़ जाएँगे।",
  },
  {
    id: "colleges",
    k: ["college", "colleges", "cutoff", "cut off", "cutoffs", "university", "iit", "nit", "aiims", "jee", "neet", "cuet", "nda", "exam", "कॉलेज", "कटऑफ", "कटऑफ़", "परीक्षा"],
    en: () => `College lists, ten-year cut-off trends and forecasts are free to browse at ${SITE} → Colleges. Your paid report goes further: Dream / Strong / Sure college tiers matched to your profile, plus the JEE, NEET, NDA, CUET and state CET calendar.\n\nCut-off figures are indicative — always confirm with the official exam body.`,
    hi: () => `कॉलेज सूची, दस साल के कटऑफ़ रुझान और अनुमान ${SITE} → Colleges पर मुफ़्त देखें। आपकी रिपोर्ट आगे जाती है: आपकी प्रोफ़ाइल के अनुसार ड्रीम / स्ट्रॉन्ग / श्योर कॉलेज, और JEE, NEET, NDA, CUET व राज्य CET कैलेंडर।\n\nकटऑफ़ आँकड़े सांकेतिक हैं — आधिकारिक परीक्षा संस्था से पुष्टि करें।`,
  },
  {
    id: "language",
    k: ["language", "hindi", "english", "भाषा", "हिंदी", "हिन्दी", "अंग्रेज़ी"],
    en: () => "The site and report work in English and Hindi — use the हिंदी में switch in the header. You can also chat with me in Hindi.",
    hi: () => "साइट और रिपोर्ट अंग्रेज़ी व हिंदी दोनों में हैं — हेडर में भाषा बदलें। आप मुझसे हिंदी में भी बात कर सकते हैं।",
  },
  {
    id: "privacy",
    k: ["privacy", "private", "my data", "data safe", "secure", "safe", "गोपनीयता", "सुरक्षित", "डेटा"],
    en: () => `Your answers stay in your own account. Reports are visible to you, the parent/guardian who consented, and your school only if the school enrolled you. No advertising or third-party tracking. Full details: ${SITE} → About → Privacy.`,
    hi: () => `आपके उत्तर आपके अपने खाते में रहते हैं। रिपोर्ट आपको, सहमति देने वाले अभिभावक को, और स्कूल को तभी दिखती है जब स्कूल ने नामांकन किया हो। कोई विज्ञापन या थर्ड-पार्टी ट्रैकिंग नहीं। पूरा विवरण: ${SITE} → About → Privacy।`,
  },
  {
    id: "schools",
    k: ["school", "schools", "principal", "bulk", "group", "partner", "partnership", "ngo", "volunteer", "counsellor", "स्कूल", "प्रधानाचार्य", "साझेदारी"],
    en: () => `Schools, NGOs and counsellors can partner with DISHA — group assessments, sponsored seats, capstone projects and workshops for students. Register at ${SITE} → Join Us, or reply 5 and our team will contact you within 3 working days.`,
    hi: () => `स्कूल, NGO और काउंसलर DISHA से जुड़ सकते हैं — सामूहिक मूल्यांकन, प्रायोजित सीटें, कैपस्टोन प्रोजेक्ट और कार्यशालाएँ। ${SITE} → Join Us पर पंजीकरण करें, या 5 भेजें — हमारी टीम 3 कार्यदिवसों में संपर्क करेगी।`,
  },
  {
    id: "counselling",
    k: ["counselling", "counseling", "counsellor call", "1 on 1", "one on one", "expert", "call", "काउंसलिंग", "विशेषज्ञ"],
    en: () => "A 1-on-1, 30-minute live counselling session with a DISHA expert is coming soon — it walks you through your report, builds a personal college shortlist and a 90-day plan. Reply 5 if you'd like us to tell you when it opens.",
    hi: () => "DISHA विशेषज्ञ के साथ 30 मिनट का 1-on-1 लाइव काउंसलिंग सत्र जल्द आ रहा है — रिपोर्ट समझाना, व्यक्तिगत कॉलेज सूची और 90-दिन की योजना। शुरू होने पर सूचना चाहिए तो 5 भेजें।",
  },
  {
    id: "human",
    k: ["5", "human", "person", "agent", "talk to someone", "speak to someone", "call me", "support", "complaint", "व्यक्ति", "किसी से बात", "शिकायत"],
    en: () => `Thanks — I've flagged this chat for the DISHA team. Someone will reply here during working hours (Mon–Sat, 10 AM–6 PM IST). You can also email ${SUPPORT_EMAIL}.`,
    hi: () => `धन्यवाद — मैंने यह चैट DISHA टीम को भेज दी है। कार्य-समय (सोम–शनि, सुबह 10 – शाम 6 IST) में कोई यहीं जवाब देगा। आप ${SUPPORT_EMAIL} पर भी लिख सकते हैं।`,
  },
  {
    id: "thanks",
    k: ["thanks", "thank you", "thx", "ok thanks", "great", "धन्यवाद", "शुक्रिया"],
    en: () => "You're welcome! Good luck — type menu any time to see options again. 🌟",
    hi: () => "आपका स्वागत है! शुभकामनाएँ — विकल्प दोबारा देखने के लिए कभी भी मेनू लिखें। 🌟",
  },
];

/* Keywords that are only safe as the WHOLE message (a bare "5" or "hi"),
   so "my 5 subjects" or "hi, what's the fee" go to the better match. */
const WHOLE_ONLY = new Set(["1", "2", "3", "4", "5", "hi", "hey", "hii", "hello", "start", "help", "menu", "disha", "time", "call"]);

export function instantAnswer(text: string): { id: string; reply: string; lang: Lang } | null {
  const lang = detectLang(text);
  const raw = norm(text);
  if (!raw) return null;
  let best: Fact | null = null, len = 0;
  for (const f of FACTS) {
    for (const key of f.k) {
      const k = key.toLowerCase();
      const ok = WHOLE_ONLY.has(k) ? raw === k : has(raw, k);
      if (ok && k.length > len) { best = f; len = k.length; }
    }
  }
  /* a long, specific question with only a weak generic hit is better
     answered by the model than by a canned paragraph */
  if (best && raw.split(" ").length > 12 && len < 5 && best.id !== "human") return null;
  return best ? { id: best.id, reply: best[lang](), lang } : null;
}

export const FALLBACK = {
  en: `I'm not sure about that one. Type menu to see what I can help with, reply 5 to reach a person, or email ${SUPPORT_EMAIL}.`,
  hi: `इसके बारे में मुझे पक्का नहीं पता। मेनू लिखें, व्यक्ति से बात के लिए 5 भेजें, या ${SUPPORT_EMAIL} पर लिखें।`,
};

export const NON_TEXT = {
  en: "I can only read text messages for now — please type your question. 🙂",
  hi: "अभी मैं केवल टेक्स्ट संदेश पढ़ सकता हूँ — कृपया अपना प्रश्न लिखें। 🙂",
};

/* ------------------------------------------------------------ LLM prompt */
export const SYSTEM_PROMPT = `You are Dhruv, the WhatsApp support assistant for DISHA Career Lab (${SITE}), a career-guidance service for school students built by PlanetAI LLP.

FACTS YOU MAY USE (do not invent others):
- Product: the 5-D career assessment — Interest, Aptitude, Personality, Orientation, Emotional Skill. 75–200 class-adaptive questions, 25–40 minutes, progress saves automatically. Output: 20+ page bilingual report with best-fit career tracks (match %), Dream/Strong/Sure college tiers (IIT–NIT–AIIMS down to state colleges & ITIs), entrance exam calendar (JEE, NEET, NDA, CUET, state CETs), scholarships (NMMS in Class 8, Post-Matric at CSC), a term-by-term plan, and a certificate.
- Class 8–9: stream & subject selection. Class 10–12: career selection & planning. Same assessment, guidance tuned to the class.
- Prices (tax-inclusive): ${Object.entries(PRICES).map(([c, p]) => `${c} ${p.en}`).join("; ")}. Sponsored seats make it free for eligible school students. Promo codes apply at checkout. Billed by PlanetAI LLP; GST number on receipt.
- Payment: Razorpay link or UPI/QR on the payment screen.
- Webinars (open to all, no login): ${WEBINARS.career.en}. ${WEBINARS.ai.en}. Book at ${SITE} → Learn → Webinars.
- Countries: India, Nepal, UAE, South Africa (content and price adapt). Overseas section: USA, UK, France, Singapore, Germany, Australia.
- Sign-up: choose country → Sign Up → email OTP → details (parent/guardian consent under 18) → pay → take the test.
- Free to browse on the site: colleges, ten-year cut-off trends and forecasts (indicative only).
- Coming soon: 1-on-1 30-minute counselling with a DISHA expert.
- Partners: schools, NGOs, counsellors and volunteers register at ${SITE} → Join Us; team replies within 3 working days.
- Support: ${SUPPORT_EMAIL}; humans reply Mon–Sat 10 AM–6 PM IST. Users can type 5 to reach a person.

RULES:
- WhatsApp style: short (under 120 words), plain text, *bold* sparingly, no markdown headings or tables.
- Reply in the user's language (English, Hindi or Hinglish as they write).
- Many users are minors. Be warm and encouraging; never ask for personal details beyond what's needed, and never ask for card numbers, PINs, OTPs or passwords.
- General career/stream/exam questions: give brief, balanced, accurate guidance, say exam dates and cut-offs must be confirmed on official sites, and suggest the 5-D assessment only where it genuinely fits — no pressure selling.
- Never promise admission, ranks, results or refunds. For refunds, payment disputes, account problems or anything you can't resolve, tell them to type 5 or email ${SUPPORT_EMAIL}.
- If unsure, say so. Never make up prices, dates, discounts or policies.
- If someone is in distress or mentions self-harm, respond kindly, encourage them to talk to a trusted adult, and share India's Tele-MANAS helpline 14416 (or local emergency services), then type 5 is available for the team.
- Stay on DISHA, careers, education and study topics; politely decline unrelated requests.`;
