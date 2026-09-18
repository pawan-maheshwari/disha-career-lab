/* ===========================================================================
   DISHA — WEBINARS  (window.DISHA_WEBINAR)

   A self-contained pop-up that sells and books the two live sessions:

     · Importance of Career Path Assessment — Rs 99  · every Saturday, 5–6 PM IST
     · AI Workshop (Introduction to Claude)  — Rs 299 · every Sunday, 11 AM–1 PM IST

   Deliberate decisions
   --------------------
   · Plain DOM, no React. The app bundle is untouched; this module only
     mounts its own overlay, so nothing existing can break if it fails.
   · Upcoming dates are GENERATED from the weekday rule, so the schedule
     never goes stale and no one has to publish dates every week.
   · Seats are counted, not promised: the local ledger and (when the cloud
     is reachable) the webinar_registrations table both feed the count.
   · Payment reuses DISHA_PAY — same VPA, same QR, same tax split, same
     receipt-number discipline as the assessment. No second payment story.
   · The Zoom link is never invented. An admin stores a recurring link per
     webinar (or a one-off link per date); a registered student sees it on
     the confirmation and in the receipt, and it is pushed to notifyUrl so
     the mail/WhatsApp automation can send it. With no link stored the
     student is told plainly that it is emailed before the session — the
     app does not pretend to have sent something it does not have.
   =========================================================================== */
window.DISHA_WEBINAR = (function () {
  "use strict";

  var P = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A", fog: "#F4F4F4",
            hairline: "#D5D5D0", sky: "#006CB8", gold: "#C9A227", green: "#1E7A46",
            amber: "#B26A00" };

  var STORE = "disha_webinar_v1";
  var SEAT_CAP = 100;
  var SHOW_WEEKS = 8;
  var SUPA_CFG = "./disha-supabase.json";
  var SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";

  /* ------------------------------------------------------------------ the two webinars */
  var WEBINARS = [
    {
      id: "career", fee: 99, day: 6, from: [17, 0], to: [18, 0],
      window: { en: "5:00 PM – 6:00 PM IST", hi: "शाम 5:00 – 6:00 बजे IST" },
      every: { en: "Every Saturday", hi: "हर शनिवार" },
      title: { en: "Importance of Career Path Assessment",
               hi: "करियर पथ मूल्यांकन का महत्व" },
      blurb: {
        en: "A live hour on why a stream is chosen with evidence rather than with a relative's advice — and what a 5-D assessment actually tells a student and a parent.",
        hi: "एक लाइव घंटा — स्ट्रीम किसी रिश्तेदार की सलाह से नहीं, प्रमाण से क्यों चुनी जाए, और 5-D मूल्यांकन वास्तव में विद्यार्थी व अभिभावक को क्या बताता है।"
      },
      points: {
        en: ["How Class 9–12 choices open and close doors later",
             "What the five dimensions measure, in plain language",
             "Reading a DISHA report with your parents",
             "Live Q&A — bring your own situation"],
        hi: ["कक्षा 9–12 के चुनाव आगे कौन-से रास्ते खोलते व बंद करते हैं",
             "पाँच आयाम क्या मापते हैं — सरल भाषा में",
             "अपने अभिभावकों के साथ DISHA रिपोर्ट पढ़ना",
             "लाइव प्रश्नोत्तर — अपनी स्थिति लेकर आएँ"]
      }
    },
    {
      id: "ai", fee: 299, day: 0, from: [11, 0], to: [13, 0],
      window: { en: "11:00 AM – 1:00 PM IST", hi: "सुबह 11:00 – दोपहर 1:00 बजे IST" },
      every: { en: "Every Sunday", hi: "हर रविवार" },
      title: { en: "AI Workshop — Introduction to Claude",
               hi: "AI कार्यशाला — Claude का परिचय" },
      blurb: {
        en: "Two hands-on hours with an AI assistant: how to ask well, where it helps with study and projects, and where it must not be trusted.",
        hi: "AI सहायक के साथ दो व्यावहारिक घंटे: सही तरह से कैसे पूछें, पढ़ाई व प्रोजेक्ट में यह कहाँ मदद करता है, और कहाँ इस पर भरोसा नहीं करना चाहिए।"
      },
      points: {
        en: ["What a large language model is — and is not",
             "Prompting that gets useful answers, live on screen",
             "Homework, projects and the honesty line",
             "Build one small thing together before we close"],
        hi: ["लार्ज लैंग्वेज मॉडल क्या है — और क्या नहीं",
             "उपयोगी उत्तर देने वाला प्रॉम्प्टिंग, स्क्रीन पर लाइव",
             "गृहकार्य, प्रोजेक्ट और ईमानदारी की सीमा",
             "समाप्ति से पहले मिलकर एक छोटी चीज़ बनाएँ"]
      }
    }
  ];

  /* ------------------------------------------------------------------ state */
  var lang = "en", overlay = null, active = "career",
      step = "browse", chosen = null, draft = {}, made = null, payMsg = "";

  function T(en, hi) { return lang === "hi" ? hi : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function PAY() { return window.DISHA_PAY || null; }
  function GLB() { return window.DISHA_GLOBAL || null; }
  function user() { return window.__dishaUser || null; }
  function isAdmin() { var u = user(); return !!(u && u.role === "admin"); }
  function webinar(id) {
    for (var i = 0; i < WEBINARS.length; i++) if (WEBINARS[i].id === id) return WEBINARS[i];
    return WEBINARS[0];
  }

  /* ------------------------------------------------------------------ store */
  function read() {
    try {
      var raw = localStorage.getItem(STORE);
      var s = raw ? JSON.parse(raw) : null;
      if (!s || typeof s !== "object") s = {};
    } catch (e) { s = {}; }
    if (!s.bookings) s.bookings = [];
    if (!s.links) s.links = {};        /* sessionId -> zoom url */
    if (!s.recurring) s.recurring = {}; /* webinar id -> zoom url */
    if (!s.caps) s.caps = {};
    return s;
  }
  function write(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  /* ------------------------------------------------------------------ cloud (optional) */
  var cloudP = null;
  function loadSdk() {
    return new Promise(function (res, rej) {
      if (window.supabase && window.supabase.createClient) return res();
      var s = document.createElement("script");
      s.src = SDK;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("sdk-blocked")); };
      document.head.appendChild(s);
    });
  }
  /* Resolves to a client or null. Never rejects: no cloud simply means the
     booking lives on this device and in the notify payload. */
  function cloud() {
    if (cloudP) return cloudP;
    cloudP = fetch(SUPA_CFG, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.url || !j.anonKey) return null;
        return loadSdk().then(function () {
          return window.supabase.createClient(j.url, j.anonKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
          });
        });
      })
      .catch(function () { return null; });
    return cloudP;
  }
  function cloudSave(b) {
    return cloud().then(function (c) {
      if (!c) return { ok: false, reason: "cloud-off" };
      return c.from("webinar_registrations").insert({
        receipt_no: b.receiptNo, webinar: b.kind, session_date: b.date,
        session_time: b.timeLabel, name: b.name, email: b.email, mobile: b.mobile,
        klass: b.klass || null, city: b.city || null,
        amount: b.gross, currency: b.currency, method: b.method,
        reference: b.reference || null, zoom_link: b.zoom || null,
        status: b.status, created_at: new Date().toISOString()
      }).then(function (r) {
        return r && r.error ? { ok: false, reason: r.error.message } : { ok: true };
      });
    }).catch(function () { return { ok: false, reason: "failed" }; });
  }
  /* Seat counts come from webinar_seats — a public tally kept by a trigger.
     The registration rows themselves stay unreadable to anonymous visitors,
     so a student cannot list who else has booked. */
  function cloudCounts() {
    return cloud().then(function (c) {
      if (!c) return null;
      return c.from("webinar_seats").select("session_key,booked").then(function (r) {
        if (!r || r.error || !r.data) return null;
        var m = {};
        r.data.forEach(function (row) { m[row.session_key] = Number(row.booked) || 0; });
        return m;
      });
    }).catch(function () { return null; });
  }
  var cloudSeat = null;

  /* ------------------------------------------------------------------ dates */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  /* Upcoming occurrences of the webinar's weekday. A session stops being
     offered two hours before it starts — booking a seat for a class that is
     already running helps nobody. */
  function sessions(w) {
    var out = [], now = new Date(), cur = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var guard = 0;
    while (out.length < SHOW_WEEKS && guard++ < 120) {
      if (cur.getDay() === w.day) {
        var start = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), w.from[0], w.from[1]);
        if (start.getTime() - now.getTime() > 2 * 3600 * 1000) {
          out.push({ id: w.id + "-" + ymd(cur), kind: w.id, date: ymd(cur), start: start });
        }
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    return out;
  }
  function dateLabel(d) {
    var days = { en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                 hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"] };
    var mon = { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                hi: ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्ट", "नव", "दिस"] };
    var L = lang === "hi" ? "hi" : "en";
    return days[L][d.getDay()] + ", " + d.getDate() + " " + mon[L][d.getMonth()] + " " + d.getFullYear();
  }
  function seatsUsed(sessionId) {
    var s = read(), n = 0;
    s.bookings.forEach(function (b) { if (b.sessionId === sessionId) n++; });
    if (cloudSeat && cloudSeat[sessionId] != null) n = Math.max(n, cloudSeat[sessionId]);
    return n;
  }
  function cap(sessionId) {
    var s = read();
    return Number(s.caps[sessionId] || SEAT_CAP);
  }
  function zoomFor(sessionId, kind) {
    var s = read();
    return s.links[sessionId] || s.recurring[kind] || "";
  }

  /* ------------------------------------------------------------------ money */
  function taxOf(net) {
    try { return PAY().taxOf(net); }
    catch (e) { return { gross: net, base: net, tax: 0, pct: 0, name: "GST" }; }
  }
  function money(n) {
    try { return GLB().fmtLocal(n); } catch (e) { return "₹" + Number(n).toFixed(0); }
  }
  function inrOf(net) {
    /* The two fees are quoted in rupees; outside India show the rupee amount
       so the QR, the gateway and the receipt cannot disagree. */
    return Math.round(taxOf(net).gross * 100) / 100;
  }
  function receiptNumber() {
    return "DISHA-WEB-" + new Date().getFullYear() + "-" + String(Date.now() % 1e6);
  }

  /* ------------------------------------------------------------------ delivery */
  function notify(b) {
    var c = PAY() ? PAY().cfg() : null;
    if (!c || !c.notifyUrl) return Promise.resolve({ status: "not-configured" });
    var payload = JSON.stringify({
      token: c.notifyKey || "", type: "webinar_registration",
      receiptNo: b.receiptNo, product: b.titleEn, webinar: b.kind,
      sessionDate: b.date, sessionTime: b.timeLabel,
      name: b.name, email: b.email, mobile: b.mobile,
      klass: b.klass || "", city: b.city || "",
      amount: b.gross, currency: b.currency, taxable: b.base,
      taxAmount: b.tax, taxRate: b.pct, taxName: b.taxName,
      gstin: b.gstin, billedBy: b.billedBy,
      method: b.method, reference: b.reference || "",
      zoomLink: b.zoom || "", date: b.when
    });
    return fetch(c.notifyUrl, {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload
    }).then(function (r) { return { status: r.ok ? "sent" : "failed" }; })
      .catch(function () {
        return fetch(c.notifyUrl, { method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload })
          .then(function () { return { status: "sent-unverified" }; })
          .catch(function () { return { status: "failed" }; });
      });
  }

  function bookingText(b) {
    var hi = lang === "hi";
    return [
      hi ? "DISHA करियर लैब — वेबिनार पंजीकरण" : "DISHA Career Lab — webinar registration",
      "",
      (hi ? "सत्र: " : "Session: ") + (hi ? b.titleHi : b.titleEn),
      (hi ? "तिथि: " : "Date: ") + b.dateLabel + " · " + b.timeLabel,
      (hi ? "नाम: " : "Name: ") + b.name,
      (hi ? "रसीद सं.: " : "Receipt no.: ") + b.receiptNo,
      (hi ? "कुल भुगतान: " : "Total paid: ") + money(b.gross) +
        (b.pct ? " (" + b.taxName + " @ " + b.pct + "% " + (hi ? "सहित" : "included") + ")" : ""),
      b.reference ? (hi ? "संदर्भ: " : "Reference: ") + b.reference : "",
      b.billedBy ? (hi ? "बिलकर्ता: " : "Billed by: ") + b.billedBy : "",
      b.gstin ? "GSTIN: " + b.gstin : "",
      "",
      b.zoom ? (hi ? "ज़ूम लिंक: " : "Zoom link: ") + b.zoom
             : (hi ? "ज़ूम लिंक सत्र से पहले आपके ईमेल व मोबाइल पर भेजा जाएगा।"
                   : "The Zoom link will be sent to your email and mobile before the session."),
      "",
      hi ? "कृपया 5 मिनट पहले जुड़ें।" : "Please join 5 minutes early."
    ].filter(Boolean).join("\n");
  }
  function mailtoLink(b) {
    return "mailto:" + encodeURIComponent(b.email || "") +
      "?subject=" + encodeURIComponent("DISHA webinar " + b.receiptNo) +
      "&body=" + encodeURIComponent(bookingText(b));
  }
  function waLink(b) {
    var n = String(b.mobile || "").replace(/\D/g, "");
    if (n.length === 10) n = "91" + n;
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(bookingText(b));
  }
  function supportMailto(b) {
    var c = PAY() ? PAY().cfg() : null;
    var to = (c && c.supportEmail) || "support@dishacareerlab.com";
    return "mailto:" + encodeURIComponent(to) +
      "?subject=" + encodeURIComponent("Webinar booking " + b.receiptNo + " — " + b.titleEn) +
      "&body=" + encodeURIComponent(bookingText(b));
  }

  /* An .ics so the session lands in the student's own calendar with a
     reminder — the single most effective thing against no-shows. */
  function icsFor(b) {
    function stamp(d) {
      return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
             pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
    }
    var w = webinar(b.kind);
    var parts = b.date.split("-");
    /* Session times are Indian time; +05:30 is applied explicitly so the
       calendar entry is right for a student in Dubai or Johannesburg too. */
    var startUTC = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2], w.from[0], w.from[1]) - 330 * 60000);
    var endUTC = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2], w.to[0], w.to[1]) - 330 * 60000);
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DISHA Career Lab//Webinar//EN",
      "BEGIN:VEVENT", "UID:" + b.receiptNo + "@dishacareerlab.com",
      "DTSTAMP:" + stamp(new Date()), "DTSTART:" + stamp(startUTC), "DTEND:" + stamp(endUTC),
      "SUMMARY:" + b.titleEn + " — DISHA Career Lab",
      "DESCRIPTION:" + bookingText(b).replace(/\n/g, "\\n"),
      b.zoom ? "LOCATION:" + b.zoom : "LOCATION:Online (Zoom link by email)",
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:DISHA webinar in 30 minutes", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
  }
  function downloadIcs(b) {
    try {
      var blob = new Blob([icsFor(b)], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "disha-webinar-" + b.date + ".ics";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    } catch (e) {}
  }
  function printReceipt(b) {
    var hi = lang === "hi";
    var rows = [
      [hi ? "रसीद सं." : "Receipt no.", b.receiptNo],
      [hi ? "नाम" : "Name", b.name],
      [hi ? "सत्र" : "Session", hi ? b.titleHi : b.titleEn],
      [hi ? "तिथि व समय" : "Date & time", b.dateLabel + " · " + b.timeLabel],
      [hi ? "शुल्क" : "Fee", money(b.base)],
      b.pct ? [b.taxName + " @ " + b.pct + "%", money(b.tax)] : null,
      [hi ? "कुल भुगतान" : "Total paid", money(b.gross)],
      [hi ? "विधि" : "Method", b.method],
      b.reference ? [hi ? "संदर्भ" : "Reference", b.reference] : null,
      [hi ? "दिनांक" : "Issued", b.when]
    ].filter(Boolean);
    var html = '<html><head><meta charset="utf-8"><title>' + esc(b.receiptNo) + '</title>' +
      '<style>body{font-family:Georgia,serif;color:#2E2D29;padding:28px;max-width:640px;margin:0 auto}' +
      'h1{font-size:22px;color:#8C1515;border-bottom:2px solid #8C1515;padding-bottom:8px}' +
      'table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin-top:14px}' +
      'td{padding:9px 4px;border-bottom:1px solid #D5D5D0}td:last-child{text-align:right;font-weight:700}' +
      '.note{font-family:Arial,sans-serif;font-size:12px;color:#53565A;margin-top:16px;line-height:1.6}</style></head><body>' +
      "<h1>DISHA Career Lab — " + (hi ? "वेबिनार रसीद" : "Webinar receipt") + "</h1><table>" +
      rows.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("") +
      "</table><p class='note'>" +
      (b.billedBy ? esc(b.billedBy) + "<br>" : "") + (b.gstin ? "GSTIN: " + esc(b.gstin) + "<br>" : "") +
      (b.zoom ? (hi ? "ज़ूम लिंक: " : "Zoom link: ") + esc(b.zoom)
              : (hi ? "ज़ूम लिंक सत्र से पहले ईमेल किया जाएगा।" : "The Zoom link is emailed before the session.")) +
      "</p></body></html>";
    try {
      var w = window.open("", "_blank");
      w.document.write(html); w.document.close(); w.focus();
      setTimeout(function () { try { w.print(); } catch (e) {} }, 300);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ overlay */
  function open(uiLang, startKind) {
    lang = uiLang === "hi" ? "hi" : "en";
    active = startKind && webinar(startKind).id === startKind ? startKind : active || "career";
    step = "browse"; chosen = null; made = null; payMsg = "";
    var u = user();
    draft = { name: (u && u.name) || "", email: (u && u.email) || "",
              mobile: (u && u.mobile) || "", klass: (u && u.klass) || "",
              city: (u && u.city) || "", ref: "" };
    close();
    overlay = document.createElement("div");
    overlay.id = "disha-webinar";
    document.body.appendChild(overlay);
    overlay.innerHTML = shell();
    wireShell();
    render();
    try { document.body.style.overflow = "hidden"; } catch (e) {}
    /* Seat counts arrive late and simply re-render when they do. */
    cloudCounts().then(function (m) { if (m && overlay) { cloudSeat = m; render(); } });
  }
  function close() {
    if (overlay) { overlay.remove(); overlay = null; }
    try { document.body.style.overflow = ""; } catch (e) {}
  }

  function shell() {
    return "<style>" +
      "#disha-webinar{position:fixed;inset:0;z-index:99997;background:rgba(46,45,41,.55);overflow-y:auto;" +
      "padding:18px 12px;font-family:'Source Sans 3',Arial,sans-serif;-webkit-overflow-scrolling:touch}" +
      "#wb-card{max-width:940px;margin:0 auto;background:#fff;border-top:6px solid " + P.cardinal + ";box-shadow:0 18px 50px rgba(0,0,0,.3)}" +
      "#wb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 22px 12px;border-bottom:1px solid " + P.hairline + "}" +
      "#wb-head h2{font-family:'Source Serif 4',Georgia,serif;margin:0;font-size:24px;color:" + P.ink + "}" +
      "#wb-head p{margin:4px 0 0;font-size:13px;color:" + P.grey + "}" +
      "#wb-x{background:none;border:none;font-size:26px;line-height:1;color:" + P.grey + ";cursor:pointer;padding:0 4px}" +
      "#wb-tabs{display:flex;gap:0;border-bottom:1px solid " + P.hairline + ";background:" + P.fog + "}" +
      ".wb-tab{flex:1;background:none;border:none;border-bottom:4px solid transparent;padding:13px 14px;cursor:pointer;" +
      "font-size:14px;font-weight:700;color:" + P.ink + ";font-family:inherit;text-align:left}" +
      ".wb-tab small{display:block;font-weight:400;font-size:11.5px;color:" + P.grey + ";margin-top:3px}" +
      ".wb-tab.on{background:#fff;border-bottom-color:" + P.cardinal + ";color:" + P.cardinal + "}" +
      "#wb-body{padding:20px 22px 26px}" +
      ".wb-hero{border:1px solid " + P.hairline + ";border-left:5px solid " + P.cardinal + ";background:" + P.fog + ";padding:16px 18px}" +
      ".wb-hero h3{font-family:'Source Serif 4',Georgia,serif;margin:0;font-size:21px;color:" + P.ink + "}" +
      ".wb-pill{display:inline-block;background:" + P.cardinal + ";color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;" +
      "text-transform:uppercase;padding:4px 10px;margin-bottom:8px}" +
      ".wb-price{font-family:'Source Serif 4',Georgia,serif;font-size:30px;font-weight:700;color:" + P.cardinal + "}" +
      ".wb-list{margin:12px 0 0;padding-left:18px;font-size:14px;color:" + P.ink + ";line-height:1.75}" +
      ".wb-slot{display:flex;justify-content:space-between;align-items:center;gap:12px;border:1px solid " + P.hairline + ";" +
      "background:#fff;padding:12px 14px;margin-top:8px;flex-wrap:wrap}" +
      ".wb-slot b{font-size:15px;color:" + P.ink + "}" +
      ".wb-slot span{font-size:12.5px;color:" + P.grey + "}" +
      ".wb-btn{background:" + P.cardinal + ";color:#fff;border:none;font-weight:700;font-size:14px;padding:10px 18px;cursor:pointer;font-family:inherit}" +
      ".wb-btn:disabled{background:" + P.hairline + ";cursor:not-allowed}" +
      ".wb-ghost{background:#fff;color:" + P.ink + ";border:2px solid " + P.ink + ";font-weight:700;font-size:14px;padding:9px 16px;cursor:pointer;font-family:inherit}" +
      ".wb-link{background:none;border:none;color:" + P.sky + ";font-weight:700;font-size:14px;cursor:pointer;padding:0;font-family:inherit}" +
      ".wb-field{display:block;margin-top:12px;font-size:13px;font-weight:700;color:" + P.ink + "}" +
      ".wb-field input{width:100%;box-sizing:border-box;margin-top:5px;padding:10px 12px;font-size:15px;font-family:inherit;" +
      "border:1px solid " + P.hairline + ";border-left:4px solid " + P.cardinal + ";outline:none}" +
      ".wb-grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}" +
      ".wb-note{border-left:4px solid " + P.gold + ";background:" + P.fog + ";padding:11px 14px;font-size:13px;color:" + P.ink + ";line-height:1.6;margin-top:14px}" +
      ".wb-ok{border:1px solid " + P.green + ";border-left:5px solid " + P.green + ";background:#F2F8F4;padding:16px 18px}" +
      ".wb-err{color:" + P.cardinal + ";font-size:13px;font-weight:700;margin-top:8px}" +
      ".wb-qr{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-top:14px}" +
      ".wb-tbl{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:10px}" +
      ".wb-tbl td{padding:8px 4px;border-bottom:1px solid " + P.hairline + "}" +
      ".wb-tbl td:last-child{text-align:right;font-weight:700}" +
      "@media(max-width:620px){.wb-grid2{grid-template-columns:1fr}#wb-head h2{font-size:20px}}" +
      "</style>" +
      '<div id="wb-card">' +
      '<div id="wb-head"><div><h2>' + T("DISHA Live Webinars", "DISHA लाइव वेबिनार") + "</h2>" +
      "<p>" + T("Register, pay, and get your Zoom link — seats are limited.",
                "पंजीकरण करें, भुगतान करें और अपना ज़ूम लिंक पाएँ — सीमित सीटें।") + "</p></div>" +
      '<button id="wb-x" aria-label="Close">&times;</button></div>' +
      '<div id="wb-tabs"></div><div id="wb-body"></div></div>';
  }

  function wireShell() {
    overlay.querySelector("#wb-x").onclick = close;
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (e.key === "Escape" && overlay) { close(); document.removeEventListener("keydown", onKey); }
  }

  function render() {
    if (!overlay) return;
    var tabs = overlay.querySelector("#wb-tabs");
    tabs.innerHTML = WEBINARS.map(function (w) {
      return '<button class="wb-tab' + (w.id === active ? " on" : "") + '" data-k="' + w.id + '">' +
        esc(w.title[lang === "hi" ? "hi" : "en"]) +
        "<small>" + esc(w.every[lang === "hi" ? "hi" : "en"]) + " · " +
        esc(w.window[lang === "hi" ? "hi" : "en"]) + " · " + money(taxOf(w.fee).gross) + "</small></button>";
    }).join("");
    Array.prototype.forEach.call(tabs.querySelectorAll(".wb-tab"), function (b) {
      b.onclick = function () {
        active = b.getAttribute("data-k");
        step = "browse"; chosen = null; made = null; payMsg = "";
        render();
      };
    });
    var body = overlay.querySelector("#wb-body");
    if (step === "browse") { body.innerHTML = browseHtml(); wireBrowse(); }
    else if (step === "form") { body.innerHTML = formHtml(); wireForm(); }
    else if (step === "pay") { body.innerHTML = payHtml(); wirePay(); }
    else if (step === "done") { body.innerHTML = doneHtml(); wireDone(); }
    else if (step === "admin") { body.innerHTML = adminHtml(); wireAdmin(); }
    body.scrollIntoView({ block: "nearest" });
  }

  /* -------------------------------------------------------- 1. browse & pick a slot */
  function browseHtml() {
    var w = webinar(active), L = lang === "hi" ? "hi" : "en", list = sessions(w);
    var t = taxOf(w.fee);
    return '<div class="wb-hero">' +
      '<span class="wb-pill">' + esc(w.every[L]) + " · " + esc(w.window[L]) + "</span>" +
      "<h3>" + esc(w.title[L]) + "</h3>" +
      '<p style="margin:8px 0 0;font-size:14px;color:' + P.grey + ';line-height:1.6">' + esc(w.blurb[L]) + "</p>" +
      '<div style="margin-top:12px"><span class="wb-price">' + money(t.gross) + "</span>" +
      '<span style="font-size:12.5px;color:' + P.grey + ';margin-left:8px">' +
      T("per participant · open to all, no login needed", "प्रति प्रतिभागी · सभी के लिए, लॉगिन आवश्यक नहीं") +
      (t.pct ? " · " + esc(t.name) + " " + t.pct + "% " + T("included", "सहित") : "") + "</span></div>" +
      '<ul class="wb-list">' + w.points[L].map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
      "</div>" +

      '<h4 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:18px;margin:22px 0 4px;color:' + P.ink + '">' +
      T("Upcoming sessions", "आगामी सत्र") + "</h4>" +
      '<p style="font-size:12.5px;color:' + P.grey + ';margin:0">' +
      T("Pick a date to book your slot.", "अपनी सीट बुक करने हेतु तिथि चुनें।") + "</p>" +

      list.map(function (s) {
        var used = seatsUsed(s.id), left = Math.max(0, cap(s.id) - used), full = left <= 0;
        return '<div class="wb-slot"><div><b>' + esc(dateLabel(s.start)) + "</b>" +
          "<br><span>" + esc(w.window[L]) + " · " +
          (full ? T("Session full", "सत्र भर गया")
                : (left <= 10 ? T("Only " + left + " seats left", "केवल " + left + " सीटें शेष")
                              : T(left + " seats available", left + " सीटें उपलब्ध"))) +
          "</span></div>" +
          '<button class="wb-btn" data-slot="' + esc(s.id) + '"' + (full ? " disabled" : "") + ">" +
          (full ? T("Full", "भरा") : T("Book this slot →", "यह सत्र बुक करें →")) + "</button></div>";
      }).join("") +

      '<div class="wb-note">' +
      T("Sessions run on Zoom. Your link is sent to the email and mobile you register with, and also shown on your receipt.",
        "सत्र ज़ूम पर होते हैं। आपका लिंक पंजीकृत ईमेल व मोबाइल पर भेजा जाता है और रसीद पर भी दिखता है।") +
      "</div>" +
      (isAdmin() ? '<button class="wb-link" id="wb-admin" style="margin-top:14px">' +
        T("Admin · manage Zoom links, seats & registrations", "एडमिन · ज़ूम लिंक, सीटें व पंजीकरण") + "</button>" : "");
  }
  function wireBrowse() {
    Array.prototype.forEach.call(overlay.querySelectorAll("[data-slot]"), function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-slot");
        var all = sessions(webinar(active));
        for (var i = 0; i < all.length; i++) if (all[i].id === id) chosen = all[i];
        if (!chosen) return;
        step = "form"; render();
      };
    });
    var a = overlay.querySelector("#wb-admin");
    if (a) a.onclick = function () { step = "admin"; render(); };
  }

  /* -------------------------------------------------------- 2. who is coming */
  function formHtml() {
    var w = webinar(active), L = lang === "hi" ? "hi" : "en";
    function fld(id, label, val, type, ph) {
      return '<label class="wb-field">' + esc(label) +
        '<input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") +
        '" placeholder="' + esc(ph || "") + '"></label>';
    }
    return '<button class="wb-link" id="wb-back">← ' + T("Back to dates", "तिथियों पर वापस") + "</button>" +
      '<div class="wb-hero" style="margin-top:12px">' +
      "<h3>" + esc(w.title[L]) + "</h3>" +
      '<p style="margin:6px 0 0;font-size:14px;color:' + P.ink + '"><b>' + esc(dateLabel(chosen.start)) + "</b> · " +
      esc(w.window[L]) + " · " + money(taxOf(w.fee).gross) + "</p></div>" +

      '<h4 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:18px;margin:20px 0 0;color:' + P.ink + '">' +
      T("Your details", "आपका विवरण") + "</h4>" +
      '<p style="font-size:12.5px;color:' + P.grey + ';margin:4px 0 0">' +
      T("The Zoom link goes to this email and mobile.", "ज़ूम लिंक इसी ईमेल व मोबाइल पर जाएगा।") + "</p>" +
      fld("wb-name", T("Full name *", "पूरा नाम *"), draft.name, "text", T("Student or parent name", "विद्यार्थी या अभिभावक का नाम")) +
      '<div class="wb-grid2">' +
      fld("wb-email", T("Email *", "ईमेल *"), draft.email, "email", "you@example.com") +
      fld("wb-mobile", T("Mobile *", "मोबाइल *"), draft.mobile, "tel", "10-digit") +
      fld("wb-klass", T("Class (optional)", "कक्षा (वैकल्पिक)"), draft.klass) +
      fld("wb-city", T("City (optional)", "शहर (वैकल्पिक)"), draft.city) +
      "</div>" +
      '<div id="wb-formerr" class="wb-err"></div>' +
      '<button class="wb-btn" id="wb-next" style="margin-top:18px">' +
      T("Continue to payment →", "भुगतान पर जाएँ →") + "</button>" +
      '<div class="wb-note">' +
      T("No account is needed for a webinar. We keep only what is written above, and use it only for this session.",
        "वेबिनार हेतु खाता आवश्यक नहीं। हम केवल ऊपर लिखा विवरण रखते हैं और उसका उपयोग केवल इसी सत्र के लिए करते हैं।") +
      "</div>";
  }
  function wireForm() {
    var q = function (s) { return overlay.querySelector(s); };
    q("#wb-back").onclick = function () { step = "browse"; render(); };
    q("#wb-next").onclick = function () {
      draft.name = q("#wb-name").value.trim();
      draft.email = q("#wb-email").value.trim();
      draft.mobile = q("#wb-mobile").value.trim();
      draft.klass = q("#wb-klass").value.trim();
      draft.city = q("#wb-city").value.trim();
      var err = "";
      if (!draft.name) err = T("Please enter a name.", "कृपया नाम दर्ज करें।");
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email))
        err = T("Please enter a valid email — the Zoom link is sent there.",
                "कृपया वैध ईमेल दर्ज करें — ज़ूम लिंक वहीं भेजा जाएगा।");
      else if (String(draft.mobile).replace(/\D/g, "").length < 10)
        err = T("Please enter a 10-digit mobile number.", "कृपया 10-अंकीय मोबाइल नंबर दर्ज करें।");
      if (err) { q("#wb-formerr").textContent = err; return; }
      step = "pay"; payMsg = ""; render();
    };
  }

  /* -------------------------------------------------------- 3. pay */
  function payHtml() {
    var w = webinar(active), L = lang === "hi" ? "hi" : "en", t = taxOf(w.fee);
    var ref = "WEB" + String(draft.mobile).replace(/\D/g, "").slice(-6) + chosen.date.replace(/-/g, "").slice(4);
    var amtINR = inrOf(w.fee);
    var upi = "", qr = "", rzp = "", c = null;
    try {
      c = PAY().cfg();
      upi = PAY().upiLink(amtINR, ref);
      qr = PAY().qrSvg(upi, 190);
      rzp = PAY().razorpayLink(amtINR, { name: draft.name, email: draft.email, mobile: draft.mobile });
    } catch (e) {}
    return '<button class="wb-link" id="wb-back">← ' + T("Back to details", "विवरण पर वापस") + "</button>" +
      '<div class="wb-hero" style="margin-top:12px"><h3>' + esc(w.title[L]) + "</h3>" +
      '<p style="margin:6px 0 0;font-size:14px;color:' + P.ink + '"><b>' + esc(dateLabel(chosen.start)) + "</b> · " +
      esc(w.window[L]) + "</p></div>" +

      '<table class="wb-tbl">' +
      "<tr><td>" + T("Webinar fee", "वेबिनार शुल्क") + "</td><td>" + money(t.base) + "</td></tr>" +
      (t.pct ? "<tr><td>" + esc(t.name) + " @ " + t.pct + "%</td><td>" + money(t.tax) + "</td></tr>" : "") +
      "<tr><td><b>" + T("Total payable", "कुल देय") + "</b></td><td>" + money(t.gross) + "</td></tr>" +
      "</table>" +

      '<div class="wb-qr">' +
      (qr ? '<div style="border:1px solid ' + P.hairline + ';padding:8px;background:#fff">' + qr + "</div>" : "") +
      '<div style="flex:1;min-width:210px">' +
      (c && c.vpa ? '<div style="font-size:13.5px;color:' + P.ink + '"><b>UPI:</b> ' + esc(c.vpa) + "</div>" : "") +
      (upi ? '<a class="wb-btn" style="display:inline-block;text-decoration:none;margin-top:10px" href="' + esc(upi) + '">' +
             T("Pay ", "भुगतान करें ") + money(t.gross) + T(" by UPI", " UPI से") + "</a>" : "") +
      (rzp ? '<a class="wb-ghost" style="display:inline-block;text-decoration:none;margin-top:10px" target="_blank" rel="noopener" href="' + esc(rzp) + '">' +
             T("Pay by card / netbanking", "कार्ड / नेटबैंकिंग से भुगतान") + "</a>" : "") +
      '<p style="font-size:12.5px;color:' + P.grey + ';margin-top:10px;line-height:1.55">' +
      T("Scan the QR with any UPI app, or tap the button on a phone. Then enter the transaction ID below.",
        "किसी भी UPI ऐप से QR स्कैन करें, या फ़ोन पर बटन दबाएँ। फिर नीचे ट्रांज़ैक्शन आईडी दर्ज करें।") +
      "</p></div></div>" +

      '<label class="wb-field">' + T("Transaction ID / UTR *", "ट्रांज़ैक्शन आईडी / UTR *") +
      '<input id="wb-ref" value="' + esc(draft.ref || "") + '" placeholder="' +
      T("From your UPI or bank app", "अपने UPI या बैंक ऐप से") + '"></label>' +
      '<div id="wb-payerr" class="wb-err">' + esc(payMsg) + "</div>" +
      '<button class="wb-btn" id="wb-confirm" style="margin-top:16px">' +
      T("I've paid — confirm my seat", "मैंने भुगतान कर दिया — सीट पक्की करें") + "</button>" +
      '<div class="wb-note">' +
      T("Your seat is held as soon as you confirm. The receipt is issued immediately; the transaction ID lets us match your payment.",
        "पुष्टि करते ही आपकी सीट सुरक्षित हो जाती है। रसीद तुरंत जारी होती है; ट्रांज़ैक्शन आईडी से भुगतान का मिलान होता है।") +
      "</div>";
  }
  function wirePay() {
    var q = function (s) { return overlay.querySelector(s); };
    q("#wb-back").onclick = function () { step = "form"; render(); };
    q("#wb-confirm").onclick = function () {
      var ref = q("#wb-ref").value.trim();
      draft.ref = ref;
      if (ref.length < 6) {
        payMsg = T("Please enter the transaction ID (UTR) from your payment app — without it your payment cannot be matched.",
                   "कृपया अपने भुगतान ऐप से ट्रांज़ैक्शन आईडी (UTR) दर्ज करें — इसके बिना भुगतान का मिलान नहीं हो सकेगा।");
        render(); return;
      }
      confirmBooking(ref);
    };
  }

  function confirmBooking(ref) {
    var w = webinar(active), t = taxOf(w.fee);
    var gst = "", billed = "";
    try { gst = GLB().gstId(); } catch (e) {}
    try { billed = GLB().entity(); } catch (e) { billed = "PlanetAI LLP"; }
    var b = {
      receiptNo: receiptNumber(), sessionId: chosen.id, kind: w.id,
      date: chosen.date, dateLabel: dateLabel(chosen.start),
      timeLabel: w.window[lang === "hi" ? "hi" : "en"],
      titleEn: w.title.en, titleHi: w.title.hi,
      name: draft.name, email: draft.email, mobile: draft.mobile,
      klass: draft.klass, city: draft.city,
      base: t.base, tax: t.tax, pct: t.pct, taxName: t.name, gross: t.gross,
      currency: (function () { try { return GLB().currency ? GLB().currency() : "INR"; } catch (e) { return "INR"; } })(),
      method: "UPI", reference: ref, gstin: gst, billedBy: billed,
      zoom: zoomFor(chosen.id, w.id), status: "paid-claimed",
      when: new Date().toLocaleString(), ts: Date.now()
    };
    var s = read(); s.bookings.push(b); write(s);
    made = b; step = "done"; render();
    cloudSave(b).then(function (r) {
      if (r && r.ok) { var all = read(); all.bookings[all.bookings.length - 1].synced = true; write(all); }
    });
    notify(b);
  }

  /* -------------------------------------------------------- 4. confirmation */
  function doneHtml() {
    var b = made;
    return '<div class="wb-ok"><div style="font-size:30px">✅</div>' +
      '<h3 style="font-family:\'Source Serif 4\',Georgia,serif;margin:6px 0 0;font-size:22px;color:' + P.green + '">' +
      T("Your seat is booked", "आपकी सीट बुक हो गई") + "</h3>" +
      '<p style="margin:8px 0 0;font-size:14.5px;color:' + P.ink + ';line-height:1.6"><b>' +
      esc(lang === "hi" ? b.titleHi : b.titleEn) + "</b><br>" + esc(b.dateLabel) + " · " + esc(b.timeLabel) + "</p></div>" +

      '<table class="wb-tbl">' +
      "<tr><td>" + T("Receipt no.", "रसीद सं.") + "</td><td>" + esc(b.receiptNo) + "</td></tr>" +
      "<tr><td>" + T("Name", "नाम") + "</td><td>" + esc(b.name) + "</td></tr>" +
      "<tr><td>" + T("Fee", "शुल्क") + "</td><td>" + money(b.base) + "</td></tr>" +
      (b.pct ? "<tr><td>" + esc(b.taxName) + " @ " + b.pct + "%</td><td>" + money(b.tax) + "</td></tr>" : "") +
      "<tr><td><b>" + T("Total paid", "कुल भुगतान") + "</b></td><td>" + money(b.gross) + "</td></tr>" +
      "<tr><td>" + T("Reference", "संदर्भ") + "</td><td>" + esc(b.reference) + "</td></tr>" +
      "</table>" +

      (b.zoom
        ? '<div class="wb-ok" style="margin-top:16px"><div style="font-size:12px;font-weight:800;letter-spacing:.08em;' +
          'text-transform:uppercase;color:' + P.green + '">' + T("Your Zoom link", "आपका ज़ूम लिंक") + "</div>" +
          '<a href="' + esc(b.zoom) + '" target="_blank" rel="noopener" style="display:block;margin-top:6px;font-size:14px;' +
          'color:' + P.sky + ';font-weight:700;word-break:break-all">' + esc(b.zoom) + "</a>" +
          '<p style="margin:8px 0 0;font-size:12.5px;color:' + P.grey + '">' +
          T("It is also on your receipt and in the email below. Join 5 minutes early.",
            "यह आपकी रसीद और नीचे दिए ईमेल में भी है। 5 मिनट पहले जुड़ें।") + "</p></div>"
        : '<div class="wb-note">' +
          T("Your Zoom link will be emailed and messaged to you before the session. Keep this receipt number handy.",
            "आपका ज़ूम लिंक सत्र से पहले ईमेल व संदेश द्वारा भेजा जाएगा। यह रसीद संख्या संभालकर रखें।") + "</div>") +

      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">' +
      '<button class="wb-btn" id="wb-print">' + T("Download receipt", "रसीद डाउनलोड करें") + "</button>" +
      '<button class="wb-ghost" id="wb-ics">' + T("Add to calendar", "कैलेंडर में जोड़ें") + "</button>" +
      '<a class="wb-ghost" style="text-decoration:none" href="' + esc(mailtoLink(made)) + '">' +
      T("Email me the details", "विवरण ईमेल करें") + "</a>" +
      '<a class="wb-ghost" style="text-decoration:none" target="_blank" rel="noopener" href="' + esc(waLink(made)) + '">' +
      T("Send on WhatsApp", "व्हाट्सएप पर भेजें") + "</a>" +
      "</div>" +
      '<p style="font-size:12.5px;color:' + P.grey + ';margin-top:14px;line-height:1.6">' +
      T("Trouble with the link or the payment? Write to us with your receipt number: ",
        "लिंक या भुगतान में समस्या? अपनी रसीद संख्या के साथ लिखें: ") +
      '<a class="wb-link" href="' + esc(supportMailto(made)) + '">' +
      esc((PAY() && PAY().cfg().supportEmail) || "support@dishacareerlab.com") + "</a></p>" +
      '<button class="wb-link" id="wb-more" style="margin-top:12px">' +
      T("Book another session", "एक और सत्र बुक करें") + "</button>";
  }
  function wireDone() {
    overlay.querySelector("#wb-print").onclick = function () { printReceipt(made); };
    overlay.querySelector("#wb-ics").onclick = function () { downloadIcs(made); };
    overlay.querySelector("#wb-more").onclick = function () {
      step = "browse"; chosen = null; made = null; render();
    };
  }

  /* -------------------------------------------------------- 5. admin */
  function adminHtml() {
    var w = webinar(active), s = read(), list = sessions(w);
    var mine = s.bookings.filter(function (b) { return b.kind === w.id; }).slice(-40).reverse();
    return '<button class="wb-link" id="wb-back">← ' + T("Back", "वापस") + "</button>" +
      '<h4 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:19px;margin:12px 0 2px;color:' + P.ink + '">' +
      T("Recurring Zoom link", "आवर्ती ज़ूम लिंक") + " — " + esc(w.title[lang === "hi" ? "hi" : "en"]) + "</h4>" +
      '<p style="font-size:12.5px;color:' + P.grey + ';margin:0 0 6px">' +
      T("Used for every date of this webinar unless a date below has its own link.",
        "नीचे किसी तिथि का अलग लिंक न हो तो हर तिथि के लिए यही उपयोग होगा।") + "</p>" +
      '<input id="wb-rec" class="wb-recin" value="' + esc(s.recurring[w.id] || "") +
      '" placeholder="https://zoom.us/j/..." style="width:100%;box-sizing:border-box;padding:10px 12px;font-size:14px;' +
      "border:1px solid " + P.hairline + ";border-left:4px solid " + P.cardinal + ';outline:none;font-family:inherit">' +
      '<button class="wb-btn" id="wb-recsave" style="margin-top:10px">' + T("Save link", "लिंक सहेजें") + "</button>" +

      '<h4 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:19px;margin:22px 0 6px;color:' + P.ink + '">' +
      T("Per-date link & seats", "प्रति-तिथि लिंक व सीटें") + "</h4>" +
      list.map(function (x) {
        return '<div class="wb-slot" style="display:block">' +
          "<b>" + esc(dateLabel(x.start)) + "</b> " +
          "<span>" + seatsUsed(x.id) + " / " + cap(x.id) + " " + T("booked", "बुक") + "</span>" +
          '<div class="wb-grid2" style="margin-top:8px">' +
          '<input data-link="' + esc(x.id) + '" value="' + esc(s.links[x.id] || "") +
          '" placeholder="' + T("Zoom link for this date", "इस तिथि का ज़ूम लिंक") +
          '" style="padding:8px 10px;font-size:13px;border:1px solid ' + P.hairline + ';font-family:inherit">' +
          '<input data-cap="' + esc(x.id) + '" value="' + esc(cap(x.id)) +
          '" style="padding:8px 10px;font-size:13px;border:1px solid ' + P.hairline + ';font-family:inherit">' +
          "</div></div>";
      }).join("") +
      '<button class="wb-btn" id="wb-savedates" style="margin-top:12px">' +
      T("Save dates", "तिथियाँ सहेजें") + "</button>" +

      '<h4 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:19px;margin:22px 0 6px;color:' + P.ink + '">' +
      T("Registrations on this device", "इस डिवाइस पर पंजीकरण") + " (" + mine.length + ")</h4>" +
      (mine.length
        ? '<table class="wb-tbl"><tr><td><b>' + T("Name", "नाम") + "</b></td><td><b>" +
          T("Date", "तिथि") + "</b></td></tr>" +
          mine.map(function (b) {
            return "<tr><td>" + esc(b.name) + '<br><span style="font-size:11.5px;color:' + P.grey + '">' +
              esc(b.email) + " · " + esc(b.mobile) + " · " + esc(b.receiptNo) +
              (b.synced ? " · " + T("synced", "सिंक") : "") + "</span></td><td>" + esc(b.dateLabel) + "</td></tr>";
          }).join("") + "</table>" +
          '<button class="wb-ghost" id="wb-csv" style="margin-top:12px">' + T("Download CSV", "CSV डाउनलोड करें") + "</button>"
        : '<p style="font-size:13px;color:' + P.grey + '">' + T("No registrations yet.", "अभी कोई पंजीकरण नहीं।") + "</p>");
  }
  function wireAdmin() {
    var q = function (s) { return overlay.querySelector(s); };
    q("#wb-back").onclick = function () { step = "browse"; render(); };
    q("#wb-recsave").onclick = function () {
      var s = read(); s.recurring[active] = q("#wb-rec").value.trim(); write(s);
      alert(T("Zoom link saved.", "ज़ूम लिंक सहेजा गया।"));
    };
    q("#wb-savedates").onclick = function () {
      var s = read();
      Array.prototype.forEach.call(overlay.querySelectorAll("[data-link]"), function (i) {
        var v = i.value.trim();
        if (v) s.links[i.getAttribute("data-link")] = v;
        else delete s.links[i.getAttribute("data-link")];
      });
      Array.prototype.forEach.call(overlay.querySelectorAll("[data-cap]"), function (i) {
        var n = parseInt(i.value, 10);
        if (n > 0) s.caps[i.getAttribute("data-cap")] = n;
      });
      write(s); render();
    };
    var csv = q("#wb-csv");
    if (csv) csv.onclick = function () {
      var rows = [["receipt", "webinar", "date", "time", "name", "email", "mobile", "class", "city", "amount", "reference", "zoom"]];
      read().bookings.forEach(function (b) {
        rows.push([b.receiptNo, b.kind, b.date, b.timeLabel, b.name, b.email, b.mobile,
                   b.klass || "", b.city || "", b.gross, b.reference || "", b.zoom || ""]);
      });
      var out = rows.map(function (r) {
        return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\n");
      try {
        var blob = new Blob([out], { type: "text/csv;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "disha-webinar-registrations.csv";
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      } catch (e) {}
    };
  }

  return {
    open: open, close: close,
    webinars: WEBINARS, sessions: function (id) { return sessions(webinar(id)); },
    bookings: function () { return read().bookings; },
    setZoom: function (id, url) { var s = read(); s.recurring[id] = url; write(s); return url; },
    seats: seatsUsed
  };
})();
