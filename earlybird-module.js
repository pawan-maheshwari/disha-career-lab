/* ===========================================================================
   DISHA — EARLY-BIRD BANNER  (window.DISHA_EARLYBIRD)

   A slim line under the header: the current price, the price it goes to, and
   the date that happens.

   Three rules built into the code, not left to discipline
   ------------------------------------------------------
   1. The deadline is a real date. When it passes the banner removes itself.
      There is no rolling timer that resets to "2 days left" forever — that is
      the kind of thing a parent notices once and never trusts again.
   2. Dismissal sticks. Closing it hides it for that deadline, not for an hour.
   3. It states the next price. "Ending soon" with no number is pressure
      without information; "goes to Rs 2,499 on 31 Oct" lets a family decide.

   Change the date or the next price in CFG below, or at runtime with
   DISHA_EARLYBIRD.set({endsAt:"2026-11-30T23:59:59+05:30"}).
   =========================================================================== */
window.DISHA_EARLYBIRD = (function () {
  "use strict";

  var CFG = {
    enabled: true,
    /* IST, inclusive of the whole day. */
    endsAt: "2026-09-30T23:59:59+05:30",
    /* What the assessment costs the day after. Leave a country out and the
       banner simply says the price rises, without inventing a figure. */
    next: {
      "India": "\u20B92,499",
      "UAE": "AED 999",
      "South Africa": "R 1,499",
      "Nepal": "NPR 2,999"
    }
  };

  var KEY = "disha_earlybird_dismissed";
  var P = { cardinal: "#8C1515", ink: "#2E2D29", gold: "#C9A227", fog: "#F4F4F4" };
  var host = null, lang = "en", timer = null;

  function T(en, hi) { return lang === "hi" ? hi : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function G() { return window.DISHA_GLOBAL || null; }

  function cfg() {
    var c = { enabled: CFG.enabled, endsAt: CFG.endsAt, next: CFG.next };
    try {
      var raw = localStorage.getItem("disha_earlybird_cfg");
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === "object") {
          if (o.endsAt) c.endsAt = o.endsAt;
          if (o.next) c.next = o.next;
          if (o.enabled != null) c.enabled = !!o.enabled;
        }
      }
    } catch (e) {}
    return c;
  }

  function msLeft(c) {
    var t = Date.parse(c.endsAt);
    return isNaN(t) ? -1 : t - Date.now();
  }
  function dismissed(c) {
    try { return localStorage.getItem(KEY) === c.endsAt; } catch (e) { return false; }
  }
  function dismiss(c) {
    try { localStorage.setItem(KEY, c.endsAt); } catch (e) {}
  }

  function endLabel(c) {
    var d = new Date(Date.parse(c.endsAt));
    var mon = { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                hi: ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्ट", "नव", "दिस"] };
    return d.getDate() + " " + mon[lang === "hi" ? "hi" : "en"][d.getMonth()];
  }
  /* Days while there is time to think about it, hours once there is not.
     No seconds ticking down — that is theatre, and it looks like it. */
  function leftLabel(ms) {
    var hrs = Math.floor(ms / 3600000);
    if (hrs >= 48) return T(Math.floor(hrs / 24) + " days left", Math.floor(hrs / 24) + " दिन शेष");
    if (hrs >= 2) return T(hrs + " hours left", hrs + " घंटे शेष");
    var mins = Math.max(1, Math.floor(ms / 60000));
    return T(mins + " minutes left", mins + " मिनट शेष");
  }

  function nextPrice(c) {
    var home = "India";
    try { home = G().home(); } catch (e) {}
    return c.next && c.next[home] ? c.next[home] : "";
  }
  function nowPrice() {
    try { return G().price(); } catch (e) { return ""; }
  }

  function mount(node, uiLang) {
    if (!node) return;
    lang = uiLang === "hi" ? "hi" : "en";
    host = node;
    paint();
    if (timer) clearInterval(timer);
    /* A minute is fast enough for a countdown measured in days. */
    timer = setInterval(paint, 60000);
  }

  function paint() {
    if (!host) return;
    var c = cfg(), ms = msLeft(c);
    if (!c.enabled || ms <= 0 || dismissed(c)) { host.innerHTML = ""; return; }

    var np = nextPrice(c), cp = nowPrice();
    var msg = np
      ? T("Early-bird price " + cp + " — goes to " + np + " on " + endLabel(c) + ".",
          "अर्ली-बर्ड मूल्य " + cp + " — " + endLabel(c) + " से " + np + " हो जाएगा।")
      : T("Early-bird price " + cp + " — rises on " + endLabel(c) + ".",
          "अर्ली-बर्ड मूल्य " + cp + " — " + endLabel(c) + " से बढ़ेगा।");

    host.innerHTML =
      "<style>" +
      "#eb-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:" + P.ink + ";color:#fff;" +
      "padding:9px 16px;font-family:'Source Sans 3',Arial,sans-serif;font-size:13.5px;line-height:1.45}" +
      "#eb-bar b{color:" + P.gold + ";font-weight:700}" +
      "#eb-tag{background:" + P.cardinal + ";color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.12em;" +
      "text-transform:uppercase;padding:3px 8px;white-space:nowrap}" +
      "#eb-x{margin-left:auto;background:none;border:none;color:#B8B5AE;font-size:18px;line-height:1;" +
      "cursor:pointer;padding:0 2px;font-family:inherit}" +
      "#eb-x:hover{color:#fff}" +
      "@media(max-width:560px){#eb-bar{font-size:12.5px;padding:8px 12px;gap:8px}}" +
      "@media print{#eb-bar{display:none}}" +
      "</style>" +
      '<div id="eb-bar" role="status">' +
      '<span id="eb-tag">' + T("Early bird", "अर्ली बर्ड") + "</span>" +
      "<span>" + esc(msg) + " <b>" + esc(leftLabel(ms)) + "</b></span>" +
      '<button id="eb-x" aria-label="' + T("Dismiss", "बंद करें") + '">&times;</button></div>';

    var x = host.querySelector("#eb-x");
    if (x) x.onclick = function () { dismiss(c); paint(); };
  }

  return {
    mount: mount,
    /* Admin helpers, from the console:
         DISHA_EARLYBIRD.set({endsAt:"2026-11-30T23:59:59+05:30"})
         DISHA_EARLYBIRD.set({enabled:false})
         DISHA_EARLYBIRD.reset()   — clears the override and any dismissal   */
    set: function (o) {
      var c = cfg();
      if (o && o.endsAt) c.endsAt = o.endsAt;
      if (o && o.next) c.next = o.next;
      if (o && o.enabled != null) c.enabled = !!o.enabled;
      try { localStorage.setItem("disha_earlybird_cfg", JSON.stringify(c)); } catch (e) {}
      paint();
      return c;
    },
    reset: function () {
      try { localStorage.removeItem("disha_earlybird_cfg"); localStorage.removeItem(KEY); } catch (e) {}
      paint();
    },
    config: cfg
  };
})();
