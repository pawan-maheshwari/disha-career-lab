/* ============================================================
   DISHA Career Lab — country content pack
   India
   ------------------------------------------------------------
   This file is DATA ONLY. No logic lives here, so it is safe to
   edit by hand: change a cut-off, add a college, correct a price.
   Nothing else in the site needs to change.

   Loaded synchronously by index.html BEFORE the app starts, so
   whatever is in this file is what the site shows.

   Rules that keep the site working:
     - Do not rename the top-level keys.
     - Keep the country name string exactly as it is below.
     - Every value is JSON: double quotes, commas between items,
       no trailing comma after the last item.
   ============================================================ */
window.DISHA_PACKS = window.DISHA_PACKS || {};
window.DISHA_PACKS["India"] = {

  /* --- meta ---
     Flag, native-language names, and the word used for a region
     ("state", "province", "emirate"). */
  "meta": {
    "hi": "भारत",
    "flag": "🇮🇳",
    "region": "state",
    "regionHi": "राज्य",
    "adjEn": "Indian",
    "native": {"code":"hi","label":"हिन्दी","name":"भारत","ready":true}
  },

  /* --- pricing ---
     Locally competitive, tax-inclusive price points — NOT currency
     conversions of each other. full = list price, promo = promo-code price.
     cmp / mkt / cap drive the "what others charge" comparison chart. */
  "pricing": {
    "sym": "₹",
    "loc": "en-IN",
    "full": 999,
    "promo": 199,
    "usdRate": 88,
    "vat": "incl. GST",
    "cmp": [
      [2000,6000],
      [1500,5000],
      [5000,15000]
    ],
    "cap": 15000,
    "mkt": [2000,15000],
    "typical": 4000,
    "save": 3000
  },

  /* --- about ---
     Vision and mission shown on the About screen, per language. */
  "about": {
    "mission": {
      "en": "Give every school student a scientific understanding of their strengths and a clear, fully-funded path to a career that fits — regardless of money, language, or technology. We help every student identify their interests, choose the right core stream, and follow a clear roadmap to achieve their goals.",
      "hi": "हर स्कूल के विद्यार्थी को अपनी ताक़त की वैज्ञानिक समझ और एक स्पष्ट, पूर्ण-वित्त-पोषित करियर रास्ता देना — पैसे, भाषा या तकनीक की परवाह किए बिना। हम हर विद्यार्थी को अपनी रुचियाँ पहचानने, सही कोर स्ट्रीम चुनने और लक्ष्य तक पहुँचने का स्पष्ट रोडमैप बनाने में मदद करते हैं।"
    },
    "vision": {
      "en": "An India where a child's career is shaped by interests and aptitude, not by pin code or parents' income — where the guiding star of opportunity is visible from every village.",
      "hi": "एक ऐसा भारत जहाँ बच्चे का करियर उसकी रुचि और योग्यता से तय हो, पिन कोड या माता-पिता की आय से नहीं — जहाँ अवसर का मार्गदर्शक तारा हर गाँव से दिखे।"
    }
  },

  /* --- dataSource ---
     Attribution line shown under the Top Colleges table. */
  "dataSource": "Govt. of India AISHE"
};

/* Note: India's map, cut-offs, school data and college lists are still
   built into the main application bundle rather than this pack. Only the
   four keys above are editable here. Extracting the rest is a separate
   job that needs the bundle's source. */
