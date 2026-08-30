/* ============================================================
   DISHA Career Lab - v2 behaviour layer
   ------------------------------------------------------------
   Loads AFTER disha-elite-layer. Wraps, never replaces.

   1. Per-class paper length: 75 / 100 / 125 / 150
   2. Class 8-10 subject-interest block (six-point Likert)
   3. Time limit on the Aptitude section
   4. Autosave + resume, so a dropped connection costs nothing
   5. Section coverage in the report ("Interest 18/20")
   6. Duration-aware path ranking (a 3-4 year answer stops
      demanding 5-year courses being ranked first)
   ============================================================ */
window.DISHA_V2 = (function () {
  "use strict";

  var A = window.DISHA_ASSESS || {};
  var origSelect = null, origStreamBlock = null, installed = false;

  /* ---------------------------------------------------------------
     1. HOW LONG IS THIS STUDENT'S PAPER
     The elite layer bands Class 9 and 10 together. They are not the
     same year and should not get the same paper, so the plan is
     keyed on the class itself.

     plan = [interest, aptitude, personality, orientation, eq]
     subject = the Class 8-10 subject-interest block
     --------------------------------------------------------------- */
  function classNum(klass) {
    var t = String(klass || "");
    if (/12/.test(t)) return 12;
    if (/11/.test(t)) return 11;
    if (/10/.test(t)) return 10;
    if (/\b9\b/.test(t) || /9th/i.test(t)) return 9;
    if (/\b8\b/.test(t) || /8th/i.test(t)) return 8;
    if (/pass/i.test(t)) return 12;
    return 10;
  }

  var PLANS = {
    8:  { plan: [16, 16, 10,  9, 10], subject: 14 },   /*  75 */
    9:  { plan: [22, 24, 12, 11, 13], subject: 18 },   /* 100 */
    10: { plan: [28, 32, 15, 14, 16], subject: 20 },   /* 125 */
    11: { plan: [38, 44, 24, 20, 24], subject:  0 },   /* 150 */
    12: { plan: [38, 44, 24, 20, 24], subject:  0 }    /* 150 */
  };

  function planFor(klass) {
    var p = PLANS[classNum(klass)] || PLANS[10];
    return { plan: p.plan.slice(), subject: p.subject };
  }

  function totalFor(klass) {
    var p = planFor(klass), t = p.subject, i;
    for (i = 0; i < p.plan.length; i++) t += p.plan[i];
    return t;
  }

  /* ---------------------------------------------------------------
     2. THE POOL
     Everything the app can draw from: the bundle bank passed in, the
     country content pack, the expanded 500-item bank, and whatever
     the elite layer holds privately (harvested by calling its own
     selector once and keeping the items it returns).
     --------------------------------------------------------------- */
  var harvested = null;

  function harvest(klass, bank, seedKey) {
    if (harvested) return harvested;
    var out = [];
    try {
      if (origSelect) {
        var got = origSelect(klass, bank, seedKey);
        if (got && got.length) out = got.slice();
      }
    } catch (e) {}
    harvested = out;
    return out;
  }

  function poolFor(bank, klass, seedKey) {
    var C = window.DISHA_CONTENT || {};
    var B = window.DISHA_BANK || {};
    var all = (bank || []).slice()
      .concat(C.interest || [], C.extra || [], B.items || [], harvest(klass, bank, seedKey));
    /* one entry per topic - the same item can arrive from two sources */
    var seen = {}, out = [];
    all.forEach(function (it, i) {
      if (!it || typeof it.dim !== "number" || !it.q || !it.opts) return;
      var t = topicOf(it, i);
      if (seen[t]) return;
      seen[t] = 1;
      out.push(it);
    });
    return out;
  }

  function topicOf(item, i) {
    if (item && item.topic) return item.topic;
    var t = (item && item.q && item.q.en) || String(i);
    return t.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 6).join("-");
  }

  /* ---------------------------------------------------------------
     3. THE DRAW
     Seeded, so the same student reloading gets the same paper and a
     resumed sitting still lines up with the answers already given.
     --------------------------------------------------------------- */
  function seedFrom(str) {
    var h = 2166136261, i;
    str = String(str || "disha");
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* Weighting must not silence a reasoning skill: every entrance
     paper this report points at tests all four, so each gets a
     floor before the remainder is shared out. */
  var APT_WEIGHT = {
    "Science (PCM)":            { num: 3, log: 3, spa: 2, verb: 1 },
    "Science (PCB)":            { num: 2, log: 3, verb: 2, spa: 1 },
    "Science (PCMB)":           { num: 3, log: 3, verb: 2, spa: 2 },
    "Commerce (with Maths)":    { num: 3, log: 3, verb: 2, spa: 1 },
    "Commerce (without Maths)": { num: 2, log: 3, verb: 3, spa: 1 },
    "Arts / Humanities":        { verb: 3, log: 3, num: 1, spa: 1 },
    "Vocational / ITI":         { spa: 3, num: 2, log: 2, verb: 1 },
    "":                         { num: 2, log: 2, verb: 2, spa: 2 }
  };

  function aptQuota(want, stream) {
    var w = APT_WEIGHT[stream] || APT_WEIGHT[""];
    var keys = ["num", "log", "verb", "spa"], q = {}, i;
    var floor = Math.max(2, Math.round(want * 0.15));
    var left = want - floor * keys.length;
    if (left < 0) { floor = Math.floor(want / keys.length); left = want - floor * keys.length; }
    var tot = 0;
    keys.forEach(function (x) { q[x] = floor; tot += (w[x] || 1); });
    keys.forEach(function (x) { q[x] += Math.floor(left * (w[x] || 1) / tot); });
    var used = 0; keys.forEach(function (x) { used += q[x]; });
    var order = keys.slice().sort(function (a, b) { return (w[b] || 1) - (w[a] || 1); });
    for (i = 0; used < want; i++, used++) q[order[i % keys.length]] += 1;
    return q;
  }

  function admits(it, klass) {
    var n = classNum(klass);
    /* a Class 8 student should not be handed Class 12 reasoning */
    if (it.dim === 1 && it.level === "advanced" && n <= 8) return false;
    return true;
  }

  function draw(rows, want, rand) {
    if (want <= 0) return [];
    var shuffled = rows.map(function (r) { return { r: r, k: rand() }; });
    shuffled.sort(function (a, b) { return a.k - b.k; });
    return shuffled.slice(0, want).map(function (x) { return x.r; });
  }

  function selectV2(klass, bank, seedKey) {
    var p = planFor(klass);
    var pool = poolFor(bank, klass, seedKey).filter(function (it) { return admits(it, klass); });
    var user = window.__dishaUser || {};
    var stream = user.stream || "";
    var rand = rng(seedFrom([seedKey || klass || "disha", classNum(klass), stream].join("::")));

    var subject = [], byDim = [[], [], [], [], []];
    pool.forEach(function (it) {
      if (it.sect === "subject") { subject.push(it); return; }
      if (byDim[it.dim]) byDim[it.dim].push(it);
    });

    /* aptitude is drawn per sub-skill so the block is balanced */
    var aptWant = p.plan[1];
    var quota = aptQuota(aptWant, stream);
    var aptOut = [], takenApt = {};
    ["num", "log", "verb", "spa"].forEach(function (skill) {
      var rows = byDim[1].filter(function (it) { return it.apt === skill && !takenApt[topicOf(it)]; });
      draw(rows, quota[skill] || 0, rand).forEach(function (it) {
        takenApt[topicOf(it)] = 1; aptOut.push(it);
      });
    });
    if (aptOut.length < aptWant) {
      var rest = byDim[1].filter(function (it) { return !takenApt[topicOf(it)]; });
      draw(rest, aptWant - aptOut.length, rand).forEach(function (it) {
        takenApt[topicOf(it)] = 1; aptOut.push(it);
      });
    }

    /* interest -> subject -> aptitude -> personality -> orientation -> eq */
    var out = []
      .concat(draw(byDim[0], p.plan[0], rand))
      .concat(draw(subject, p.subject, rand))
      .concat(aptOut.slice(0, aptWant))
      .concat(draw(byDim[2], p.plan[2], rand))
      .concat(draw(byDim[3], p.plan[3], rand))
      .concat(draw(byDim[4], p.plan[4], rand));

    if (!out.length) {
      return origSelect ? origSelect(klass, bank, seedKey) : (bank || []).slice();
    }
    lastServed = out;
    return out;
  }

  var lastServed = null;
  function served(fallback) {
    if (lastServed && lastServed.length) return lastServed;
    if (A.served) { try { return A.served(fallback); } catch (e) {} }
    return fallback || null;
  }

  /* ---------------------------------------------------------------
     4. SECTIONS
     One place that decides what section an item belongs to, used by
     the timer, the progress header and the report coverage table.
     --------------------------------------------------------------- */
  var SECTIONS = [
    { key: "interest",    en: "Interest",         hi: "रुचि" },
    { key: "subject",     en: "Subject Interest", hi: "विषय रुचि" },
    { key: "aptitude",    en: "Aptitude",         hi: "योग्यता" },
    { key: "personality", en: "Personality",      hi: "व्यक्तित्व" },
    { key: "orientation", en: "Orientation",      hi: "कार्य-दृष्टि" },
    { key: "eq",          en: "Emotional Skill",  hi: "भावनात्मक कौशल" }
  ];

  function sectionOf(it) {
    if (!it) return null;
    if (it.sect === "subject") return "subject";
    return ["interest", "aptitude", "personality", "orientation", "eq"][it.dim] || null;
  }

  function sectionRanges(list) {
    var r = {}, i, k;
    for (i = 0; i < (list || []).length; i++) {
      k = sectionOf(list[i]);
      if (!k) continue;
      if (!r[k]) r[k] = { from: i, to: i, total: 0 };
      r[k].to = i;
      r[k].total++;
    }
    return r;
  }

  function coverage(list, answers) {
    var ranges = sectionRanges(list), out = [];
    SECTIONS.forEach(function (s) {
      var r = ranges[s.key];
      if (!r || !r.total) return;
      var done = 0, i;
      for (i = r.from; i <= r.to; i++) {
        if (answers && answers[i] != null) done++;
      }
      out.push({ key: s.key, en: s.en, hi: s.hi, done: done, total: r.total });
    });
    return out;
  }

  /* ---------------------------------------------------------------
     5. APTITUDE TIME LIMIT
     45 seconds an item, which is the pace these entrance papers
     actually run at. The clock is stored, not held in memory, so a
     reload does not hand back time the student already spent.
     When it runs out the section closes and the paper moves on -
     unanswered items simply count as not attempted, which the
     report now states openly rather than hiding.
     --------------------------------------------------------------- */
  var SEC_PER_APT_ITEM = 45;
  var CLOCK_KEY = "disha.v2.aptclock";

  function clockGet(sig) {
    try {
      var r = JSON.parse(localStorage.getItem(CLOCK_KEY) || "null");
      return r && r.sig === sig ? r : null;
    } catch (e) { return null; }
  }
  function clockStart(sig, seconds) {
    var r = { sig: sig, start: Date.now(), limit: seconds };
    try { localStorage.setItem(CLOCK_KEY, JSON.stringify(r)); } catch (e) {}
    return r;
  }
  function clockLeft(r) {
    if (!r) return null;
    return Math.max(0, r.limit - Math.floor((Date.now() - r.start) / 1000));
  }
  function clockClear() {
    try { localStorage.removeItem(CLOCK_KEY); } catch (e) {}
  }

  function mmss(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  /* ---------------------------------------------------------------
     6. AUTOSAVE
     Answers are written on every change and restored once, only if
     the saved paper is the same paper. A different sitting must not
     inherit answers keyed to positions that no longer mean the same
     question.
     --------------------------------------------------------------- */
  var SAVE_KEY = "disha.v2.draft";

  function signature(list, klass) {
    var t = (list || []).map(function (it, i) { return topicOf(it, i); }).join("|");
    return classNum(klass) + ":" + (list || []).length + ":" + seedFrom(t);
  }

  function saveDraft(sig, answers, idx) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        sig: sig, answers: answers, idx: idx, ts: Date.now()
      }));
    } catch (e) {}
  }
  function loadDraft(sig) {
    try {
      var r = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      return r && r.sig === sig ? r : null;
    } catch (e) { return null; }
  }
  function clearDraft() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    clockClear();
  }

  /* ---------------------------------------------------------------
     7. QUIZ HOOK
     The bundle hands us its live quiz state each render. Everything
     above is driven from here, and all of it is wrapped so a failure
     can never stop a student mid-paper.
     --------------------------------------------------------------- */
  var restored = {};

  function onQuiz() {
    var q = window.DISHA_QUIZ;
    if (!q || !q.list || !q.list.length) return;
    var sig = signature(q.list, q.klass);

    /* --- resume ------------------------------------------------- */
    if (!restored[sig]) {
      restored[sig] = 1;
      var d = loadDraft(sig);
      if (d && d.answers && Object.keys(d.answers).length) {
        try {
          q.setAnswers(d.answers);
          if (typeof d.idx === "number" && d.idx < q.list.length) q.setIdx(d.idx);
          notify(q.lang === "hi"
            ? "पिछली बार के उत्तर वापस ले आए गए हैं।"
            : "Your earlier answers have been restored.");
        } catch (e) {}
        return;
      }
    }

    /* --- autosave ----------------------------------------------- */
    saveDraft(sig, q.answers || {}, q.idx);

    /* --- aptitude clock ----------------------------------------- */
    var ranges = sectionRanges(q.list);
    var apt = ranges.aptitude;
    if (!apt) { paintClock(null); return; }
    var inApt = q.idx >= apt.from && q.idx <= apt.to;
    if (!inApt) { paintClock(null); return; }

    var csig = sig + ":apt";
    var rec = clockGet(csig) || clockStart(csig, apt.total * SEC_PER_APT_ITEM);
    var left = clockLeft(rec);

    if (left <= 0) {
      paintClock(null);
      var next = apt.to + 1;
      try {
        if (next < q.list.length) {
          q.setIdx(next);
          notify(q.lang === "hi"
            ? "योग्यता अनुभाग का समय समाप्त। शेष अनुभाग जारी हैं।"
            : "Aptitude section time is up. The remaining sections continue.");
        } else {
          q.go("results");
        }
      } catch (e) {}
      return;
    }
    paintClock(left, q.lang, q.idx - apt.from + 1, apt.total);
  }

  /* ---------------------------------------------------------------
     8. THE CLOCK ON SCREEN
     A single node, created once, updated by its own interval so the
     seconds move without waiting for React to re-render.
     --------------------------------------------------------------- */
  var clockNode = null, clockTimer = null;

  function paintClock(left, lang, pos, total) {
    if (left == null) {
      if (clockNode) { clockNode.style.display = "none"; }
      if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
      return;
    }
    if (!clockNode) {
      clockNode = document.createElement("div");
      clockNode.id = "disha-apt-clock";
      clockNode.style.cssText = [
        "position:fixed", "right:16px", "bottom:16px", "z-index:9998",
        "background:#fff", "border:2px solid #8C1515", "box-shadow:4px 4px 0 rgba(0,0,0,.18)",
        "padding:10px 14px", "font-family:Arial,Helvetica,sans-serif",
        "font-size:13px", "color:#2E2D29", "min-width:140px", "text-align:center"
      ].join(";");
      document.body.appendChild(clockNode);
    }
    clockNode.style.display = "block";

    var render = function () {
      var rec = null;
      try {
        rec = JSON.parse(localStorage.getItem(CLOCK_KEY) || "null");
      } catch (e) {}
      var s = clockLeft(rec);
      if (s == null) return;
      var warn = s <= 60;
      clockNode.style.borderColor = warn ? "#8C1515" : "#53565A";
      clockNode.innerHTML =
        '<div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#53565A">' +
        (lang === "hi" ? "योग्यता अनुभाग" : "Aptitude section") + "</div>" +
        '<div style="font-size:22px;font-weight:700;margin-top:2px;color:' +
        (warn ? "#8C1515" : "#2E2D29") + '">' + mmss(s) + "</div>" +
        '<div style="font-size:11px;color:#53565A;margin-top:2px">' +
        (lang === "hi" ? "प्रश्न " : "Q ") + pos + " / " + total + "</div>";
    };
    render();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(render, 1000);
  }

  var noteNode = null, noteTimer = null;
  function notify(text) {
    if (!noteNode) {
      noteNode = document.createElement("div");
      noteNode.style.cssText = [
        "position:fixed", "left:50%", "transform:translateX(-50%)", "top:14px",
        "z-index:9999", "background:#2E2D29", "color:#fff", "padding:10px 16px",
        "font-family:Arial,Helvetica,sans-serif", "font-size:13px",
        "box-shadow:4px 4px 0 rgba(0,0,0,.2)", "max-width:90vw"
      ].join(";");
      document.body.appendChild(noteNode);
    }
    noteNode.textContent = text;
    noteNode.style.display = "block";
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { noteNode.style.display = "none"; }, 4000);
  }

  /* ---------------------------------------------------------------
     9. DURATION-AWARE RANKING
     A student who says "3-4 years then start earning" was still
     being shown BDS at the top, because a path's score only ever
     looked at subject affinity - never at how long the course runs.
     This reads the orientation answers the student actually gave and
     penalises courses longer than the appetite they expressed.
     It demotes rather than hides: an undecided student should still
     see MBBS, and a student who wants it should not lose it.
     --------------------------------------------------------------- */
  function yearsOf(path) {
    var t = String((path && path.years) || "");
    var nums = t.match(/\d+(\.\d+)?/g);
    if (!nums || !nums.length) return null;
    var max = 0;
    nums.forEach(function (n) { var v = parseFloat(n); if (v > max) max = v; });
    /* "3 + 2 yrs" is a five-year commitment, not a three-year one */
    if (/\+/.test(t) && nums.length > 1) {
      var sum = 0;
      nums.forEach(function (n) { sum += parseFloat(n); });
      max = Math.max(max, sum);
    }
    return max || null;
  }

  /* How many years of study is this student actually willing to do?
     Read off the orientation tags their own answers carried. */
  function appetite(answers, list) {
    var t = { earnEarly: 0, degree: 0, longHaul: 0 }, seen = 0, durs = [];
    (list || []).forEach(function (it, i) {
      var a = answers && answers[i];
      if (a == null || !it || !it.opts || !it.opts[a]) return;
      var opt = it.opts[a];
      /* an option carrying dur is a stated number of years, not an
         inference - the student answered the question directly */
      if (typeof opt.dur === "number") durs.push(opt.dur);
      var tag = opt.tag || {};
      ["earnEarly", "degree", "longHaul"].forEach(function (k) {
        if (tag[k]) { t[k] += tag[k]; seen += tag[k]; }
      });
    });
    if (!durs.length && !seen) return null;

    var stated = null, fromTags = null, i, sum = 0;
    if (durs.length) {
      for (i = 0; i < durs.length; i++) sum += durs[i];
      stated = sum / durs.length;
    }
    if (seen) {
      if (t.longHaul >= t.earnEarly && t.longHaul >= t.degree) fromTags = 6;
      else if (t.earnEarly > t.degree && t.earnEarly > t.longHaul) fromTags = 3;
      else fromTags = 4.5;
    }
    if (stated == null) return fromTags;
    if (fromTags == null) return stated;
    /* what they said outweighs what we inferred, but does not erase it */
    return (stated * 2 + fromTags) / 3;
  }

  function durationAdjust(score, path, answers, list) {
    var want = appetite(answers, list);
    var yrs = yearsOf(path);
    if (want == null || yrs == null) return score;
    var over = yrs - want;
    if (over <= 0) return score + 1.5;          /* fits - a mild lift  */
    return score - Math.min(6, over * 2.5);     /* longer - demote     */
  }

  /* ---------------------------------------------------------------
     10. REPORT: SECTION COVERAGE
     Wraps the report block the elite layer already produces and puts
     an honest attempted/total line above it. A parent reading a
     result deserves to know it rests on 18 of 20 answers, not 20.
     --------------------------------------------------------------- */
  function reactH(R) {
    if (typeof R === "function") return R;
    if (R && typeof R.createElement === "function") return R.createElement.bind(R);
    return null;
  }

  var C = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A",
            fog: "#F4F4F4", hairline: "#D5D5D0" };

  function coverageBlock(R, opts) {
    var h = reactH(R);
    if (!h) return null;
    var lang = opts.lang === "hi" ? "hi" : "en";
    var L = function (en, hi) { return lang === "hi" ? hi : en; };
    var list = opts.list || served();
    var rows = coverage(list, opts.answers || {});
    if (!rows.length) return null;

    var done = 0, total = 0;
    rows.forEach(function (r) { done += r.done; total += r.total; });

    return h("div", { key: "v2cov", style: { marginTop: 18, marginBottom: 22 } },
      h("div", { className: "sans", style: { fontSize: 12, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: ".08em", color: C.cardinal,
        marginBottom: 8 } },
        L("Questions attempted", "प्रयास किए गए प्रश्न")),
      h("div", { style: { border: "1px solid " + C.hairline } },
        rows.map(function (r, i) {
          var full = r.done === r.total;
          return h("div", { key: r.key, className: "sans", style: {
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px", fontSize: 14,
            background: i % 2 ? C.fog : "#fff",
            borderBottom: "1px solid " + C.hairline } },
            h("span", { style: { color: C.ink } }, L(r.en, r.hi)),
            h("span", { style: { fontWeight: 700, color: full ? C.ink : C.cardinal } },
              r.done + "/" + r.total));
        }).concat([
          h("div", { key: "tot", className: "sans", style: {
            display: "flex", justifyContent: "space-between",
            padding: "8px 12px", fontSize: 14, fontWeight: 700,
            background: C.ink, color: "#fff" } },
            h("span", null, L("Total", "कुल")),
            h("span", null, done + "/" + total))
        ])),
      done < total
        ? h("p", { className: "sans", style: { fontSize: 12, color: C.grey,
            marginTop: 8, lineHeight: 1.6 } },
            L("Sections below full coverage are read with more caution. A score built on fewer answers is reported, not hidden.",
              "जिन अनुभागों में सभी प्रश्न नहीं हुए, उन्हें अधिक सावधानी से पढ़ा जाता है। कम उत्तरों पर बना स्कोर छिपाया नहीं, बताया जाता है।"))
        : null);
  }

  function v2StreamBlock(R, opts) {
    var h = reactH(R);
    var base = null;
    try { base = origStreamBlock ? origStreamBlock(R, opts) : null; } catch (e) { base = null; }
    if (!h) return base;
    var cov = null;
    try { cov = coverageBlock(R, opts || {}); } catch (e) { cov = null; }
    if (!cov) return base;
    return h("div", { key: "v2wrap" }, cov, base);
  }

  /* ---------------------------------------------------------------
     11. RELIABILITY (Cronbach's alpha), computed against the items
     the student was actually served.

     The original computation read nt[u] for each answered index u.
     That was only ever correct when every student sat the identical
     paper in the identical order. Once the selector started drawing
     from a pool, position 7 in one student's answers and position 7
     in another's were different questions, so the alpha on screen
     was averaging unrelated items.

     Reports now carry qids - the topic of each served item, in order
     - so answers can be keyed to questions rather than to positions.
     Alpha is then computed over the items a given set of students
     genuinely have in common. Legacy rows saved before qids existed
     are skipped rather than guessed at; they are counted separately
     so the number of usable records is never overstated.
     --------------------------------------------------------------- */

  function itemIndex() {
    var C = window.DISHA_CONTENT || {}, B = window.DISHA_BANK || {};
    var map = {};
    [].concat(C.interest || [], C.extra || [], B.items || [], lastServed || [])
      .forEach(function (it, i) {
        if (!it || !it.opts) return;
        var t = topicOf(it, i);
        if (!map[t]) map[t] = it;
      });
    return map;
  }

  function paperIds() {
    var q = window.DISHA_QUIZ;
    var list = (q && q.list) || lastServed;
    if (!list || !list.length) return null;
    return list.map(function (it, i) { return topicOf(it, i); });
  }

  function variance(xs) {
    if (xs.length < 2) return 0;
    var m = 0, i;
    for (i = 0; i < xs.length; i++) m += xs[i];
    m /= xs.length;
    var v = 0;
    for (i = 0; i < xs.length; i++) v += (xs[i] - m) * (xs[i] - m);
    return v / xs.length;
  }

  /* rows: one array of item scores per student, all the same length */
  function alphaOf(rows) {
    if (!rows || rows.length < 2) return null;
    var k = rows[0].length;
    if (k < 2) return null;
    var itemVar = 0, i;
    for (i = 0; i < k; i++) {
      itemVar += variance(rows.map(function (r) { return r[i]; }));
    }
    var totalVar = variance(rows.map(function (r) {
      return r.reduce(function (a, b) { return a + b; }, 0);
    }));
    if (!totalVar) return null;
    return (k / (k - 1)) * (1 - itemVar / totalVar);
  }

  /* Score one served item under one dimension's rule. */
  function scoreItem(item, choice, dim) {
    if (!item || !item.opts || item.opts[choice] == null) return null;
    var opt = item.opts[choice];
    if (dim === 1) return opt.correct ? 1 : 0;
    if (dim === 4) return typeof opt.eq === "number" ? opt.eq : 0;
    return null;
  }

  /* Build the person x item matrix for one dimension, restricted to
     the items that enough students share for the figure to mean
     anything. */
  function matrixFor(reports, dim, items, minShare) {
    var count = {}, perStudent = [];
    reports.forEach(function (rep) {
      var ids = rep && rep.qids, ans = rep && rep.answers;
      if (!ids || !ids.length || !ans) return;
      var mine = {};
      ids.forEach(function (id, i) {
        var it = items[id];
        if (!it || it.dim !== dim || it.sect === "subject") return;
        var s = scoreItem(it, ans[i], dim);
        if (s == null) return;
        mine[id] = s;
        count[id] = (count[id] || 0) + 1;
      });
      if (Object.keys(mine).length) perStudent.push(mine);
    });
    if (!perStudent.length) return { rows: [], k: 0, n: 0 };

    var need = Math.max(2, Math.ceil(perStudent.length * (minShare || 0.6)));
    var common = Object.keys(count).filter(function (id) { return count[id] >= need; });
    if (common.length < 2) return { rows: [], k: 0, n: perStudent.length };

    var rows = [];
    perStudent.forEach(function (m) {
      var row = [], ok = true;
      common.forEach(function (id) {
        if (m[id] == null) { ok = false; return; }
        row.push(m[id]);
      });
      if (ok) rows.push(row);
    });
    return { rows: rows, k: common.length, n: rows.length };
  }

  function reliability(reports) {
    reports = reports || [];
    var items = itemIndex();
    var withIds = reports.filter(function (r) { return r && r.qids && r.qids.length && r.answers; });
    var legacy = reports.filter(function (r) { return r && r.answers && !(r.qids && r.qids.length); });

    var apt = matrixFor(withIds, 1, items, 0.6);
    var eq  = matrixFor(withIds, 4, items, 0.6);
    var r2 = function (x) { return x == null ? null : Math.round(x * 100) / 100; };

    return {
      n: withIds.length,
      legacy: legacy.length,
      aptitude: { n: apt.n, k: apt.k, alpha: r2(alphaOf(apt.rows)) },
      eq:       { n: eq.n,  k: eq.k,  alpha: r2(alphaOf(eq.rows)) }
    };
  }

  /* ---------------------------------------------------------------
     12. INSTALL
     --------------------------------------------------------------- */
  function install() {
    if (!window.DISHA_ASSESS) return;
    A = window.DISHA_ASSESS;
    if (A.__v2) return;
    origSelect = typeof A.select === "function" ? A.select : null;
    origStreamBlock = typeof A.streamBlock === "function" ? A.streamBlock : null;
    A.select = selectV2;
    A.served = served;
    A.streamBlock = v2StreamBlock;
    A.v2 = {
      planFor: planFor, totalFor: totalFor, classNum: classNum,
      coverage: coverage, sections: SECTIONS, clearDraft: clearDraft
    };
    A.__v2 = true;
    installed = true;
  }

  install();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  }
  setInterval(function () { try { install(); } catch (e) {} }, 2000);

  return {
    onQuiz: function () { try { onQuiz(); } catch (e) {} },
    durationAdjust: durationAdjust,
    planFor: planFor, totalFor: totalFor, classNum: classNum,
    coverage: coverage, sectionOf: sectionOf, sectionRanges: sectionRanges,
    sections: SECTIONS,
    clearDraft: clearDraft, appetite: appetite, yearsOf: yearsOf,
    reliability: reliability, paperIds: paperIds, alphaOf: alphaOf,
    installed: function () { return installed; }
  };
})();
