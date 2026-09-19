/* ===========================================================================
   DISHA — THE FIVE DIMENSIONS  (window.DISHA_DIMENSIONS)

   The home page used to show five inert boxes with a number and a word.
   A parent reading "Orientation" learned nothing. This turns the same five
   boxes into a tabbed explainer: tap a dimension and it opens with a written
   account of what is measured, a drawn visual of the idea, and what a strong
   or weak score actually means for the student.

   Built for a phone first
   -----------------------
   · Tabs scroll horizontally on a narrow screen and sit in a row on a wide
     one — the same markup, no separate mobile build.
   · The panel answers to a left/right swipe as well as to a tap, and to the
     arrow keys for anyone on a keyboard (roving tabindex, proper ARIA roles).
   · Each visual is inline SVG drawn here, not a fetched image: it renders on
     a weak connection and prints with the page.
   · Motion is a courtesy, not the content — prefers-reduced-motion turns the
     animation off and nothing is lost.
   =========================================================================== */
window.DISHA_DIMENSIONS = (function () {
  "use strict";

  var P = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A", fog: "#F4F4F4",
            hairline: "#D5D5D0", sky: "#006CB8", gold: "#C9A227", green: "#1E7A46" };

  var host = null, lang = "en", active = 0, labels = null;

  function T(en, hi) { return lang === "hi" ? hi : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------------ content */
  var D = [
    {
      key: "interest",
      name: { en: "Interest", hi: "रुचि" },
      hook: { en: "What you would do even if nobody asked you to.",
              hi: "जो आप बिना कहे भी करते रहेंगे।" },
      what: {
        en: "Interest is the pull — the kind of work that holds your attention long after the novelty wears off. DISHA sorts it across six working styles: building things, investigating them, creating, helping people, persuading and organising. Nobody is one of these alone; what matters is the shape of the mix, because a career that fits your shape stops feeling like effort.",
        hi: "रुचि वह खिंचाव है — वह काम जो नयापन खत्म होने के बाद भी आपका ध्यान बाँधे रखता है। DISHA इसे छह कार्य-शैलियों में बाँटता है: बनाना, खोजना, सृजन करना, लोगों की मदद करना, प्रेरित करना और व्यवस्थित करना। कोई भी केवल एक नहीं होता; मायने रखता है मिश्रण का आकार, क्योंकि आपके आकार से मेल खाता करियर बोझ नहीं लगता।"
      },
      chips: {
        en: [["Measured by", "Forced-choice preferences, not self-rating"],
             ["Shows up as", "The subject you read past the syllabus"],
             ["Grows with", "Exposure — a visit, a workshop, a project"]],
        hi: [["कैसे मापा", "बाध्य-विकल्प वरीयताएँ, स्व-रेटिंग नहीं"],
             ["कहाँ दिखता है", "वह विषय जिसे आप पाठ्यक्रम से आगे पढ़ते हैं"],
             ["कैसे बढ़ता है", "अनुभव — एक दौरा, कार्यशाला, परियोजना"]]
      },
      reads: {
        en: "“Investigative and Creative run well ahead of the rest — this student wants to find out why something works, then make a version of their own.”",
        hi: "“खोजी और सृजनात्मक बाकी सबसे आगे हैं — यह विद्यार्थी पहले कारण जानना चाहता है, फिर अपना संस्करण बनाना चाहता है।”"
      },
      svg: petals
    },
    {
      key: "aptitude",
      name: { en: "Aptitude", hi: "योग्यता" },
      hook: { en: "How your mind solves a problem it has not seen before.",
              hi: "अनदेखी समस्या को आपका मन कैसे हल करता है।" },
      what: {
        en: "Aptitude is reasoning under four heads — numerical, logical, verbal and spatial — measured with puzzles rather than remembered facts, so a well-coached student and a village student meet the same test. It is the one dimension that moves fastest with practice: twenty honest minutes a day shifts it within a term.",
        hi: "योग्यता चार रूपों में तर्क है — संख्यात्मक, तार्किक, शाब्दिक और स्थानिक — याद किए तथ्यों से नहीं, पहेलियों से मापी जाती है, ताकि महँगी कोचिंग वाला और गाँव का विद्यार्थी एक ही परीक्षा पर मिलें। यही वह आयाम है जो अभ्यास से सबसे तेज़ बदलता है: रोज़ बीस ईमानदार मिनट एक सत्र में अंतर ला देते हैं।"
      },
      chips: {
        en: [["Measured by", "Timed reasoning items, scored right or wrong"],
             ["Shows up as", "Speed at an unfamiliar question"],
             ["Grows with", "Daily practice — the fastest-moving dimension"]],
        hi: [["कैसे मापा", "समयबद्ध तर्क प्रश्न, सही या गलत"],
             ["कहाँ दिखता है", "अपरिचित प्रश्न पर आपकी गति"],
             ["कैसे बढ़ता है", "रोज़ का अभ्यास — सबसे तेज़ बदलने वाला आयाम"]]
      },
      reads: {
        en: "“Spatial reasoning is the standout at 82% — worth taking seriously before ruling out architecture or design.”",
        hi: "“स्थानिक तर्क 82% पर सबसे ऊपर — वास्तुकला या डिज़ाइन को खारिज करने से पहले इस पर ध्यान दें।”"
      },
      svg: bars
    },
    {
      key: "personality",
      name: { en: "Personality", hi: "व्यक्तित्व" },
      hook: { en: "Not who you are — how you prefer to work.",
              hi: "आप कौन हैं नहीं — आप कैसे काम करना पसंद करते हैं।" },
      what: {
        en: "This is the dimension people misread most. It is not a verdict on character and there is no good or bad end of any scale. It places you on three working preferences — leading or supporting, alone or among people, planned or exploratory — so that the careers we suggest match the conditions in which you do your best work, not just the subjects you can pass.",
        hi: "यही आयाम सबसे अधिक गलत समझा जाता है। यह चरित्र पर फ़ैसला नहीं है और किसी पैमाने का कोई अच्छा या बुरा सिरा नहीं होता। यह आपको तीन कार्य-वरीयताओं पर रखता है — नेतृत्व या सहयोग, अकेले या लोगों के बीच, नियोजित या खोजी — ताकि सुझाए गए करियर उन परिस्थितियों से मेल खाएँ जिनमें आप सर्वश्रेष्ठ काम करते हैं।"
      },
      chips: {
        en: [["Measured by", "Situation choices, both ends equally valid"],
             ["Shows up as", "How you behave in a group project"],
             ["Grows with", "Nothing — it is matched, not improved"]],
        hi: [["कैसे मापा", "परिस्थिति-आधारित चुनाव, दोनों सिरे समान रूप से वैध"],
             ["कहाँ दिखता है", "समूह परियोजना में आपका व्यवहार"],
             ["कैसे बढ़ता है", "यह सुधारा नहीं, मिलान किया जाता है"]]
      },
      reads: {
        en: "“Strongly independent and planned — thrives with a clear brief and quiet hours; a floor-facing sales role would drain this student.”",
        hi: "“अत्यधिक स्वतंत्र और नियोजित — स्पष्ट निर्देश व शांत समय में खिलता है; निरंतर लोगों से जुड़ी बिक्री भूमिका इसे थका देगी।”"
      },
      svg: sliders
    },
    {
      key: "orientation",
      name: { en: "Orientation", hi: "कार्य-दृष्टि" },
      hook: { en: "What you want the work to give back.",
              hi: "आप काम से क्या पाना चाहते हैं।" },
      what: {
        en: "Two students can share every other score and still belong in different careers, because one needs a stable government post and the other wants to build something of their own. Orientation records what you are actually optimising for — security, enterprise, expertise or service — along with how far you are willing to move and how many years you are willing to study.",
        hi: "दो विद्यार्थियों के बाकी सब अंक समान हो सकते हैं और फिर भी उनके करियर अलग होंगे, क्योंकि एक को स्थिर सरकारी पद चाहिए और दूसरा अपना कुछ बनाना चाहता है। कार्य-दृष्टि यह दर्ज करती है कि आप वास्तव में क्या चाहते हैं — सुरक्षा, उद्यम, विशेषज्ञता या सेवा — साथ ही आप कितनी दूर जाने और कितने वर्ष पढ़ने को तैयार हैं।"
      },
      chips: {
        en: [["Measured by", "Trade-offs between real-life options"],
             ["Shows up as", "Which job you would take at the same pay"],
             ["Grows with", "Family circumstances — revisit it each year"]],
        hi: [["कैसे मापा", "वास्तविक विकल्पों के बीच समझौते"],
             ["कहाँ दिखता है", "समान वेतन पर आप कौन-सी नौकरी चुनेंगे"],
             ["कैसे बदलता है", "पारिवारिक परिस्थिति — हर वर्ष दोबारा देखें"]]
      },
      reads: {
        en: "“High security, low mobility — the shortlist stays within the home state and leans to public-sector and teaching pathways.”",
        hi: "“सुरक्षा अधिक, गतिशीलता कम — सूची गृह-राज्य तक सीमित रहती है और सार्वजनिक क्षेत्र व शिक्षण की ओर झुकती है।”"
      },
      svg: compass
    },
    {
      key: "eq",
      name: { en: "Emotional Skill", hi: "भावनात्मक कौशल" },
      hook: { en: "The dimension that decides how far the other four travel.",
              hi: "वह आयाम जो तय करता है बाकी चार कितनी दूर जाएँगे।" },
      what: {
        en: "Marks get a student to the interview; this decides what happens after. DISHA scores it on situations — a teammate who has not done their part, a parent who disagrees, a plan that fails the night before it is due — looking for empathy, composure and judgement rather than the polite answer. It is fully learnable, and it strengthens every career on the list.",
        hi: "अंक विद्यार्थी को साक्षात्कार तक पहुँचाते हैं; उसके बाद क्या होगा, यह आयाम तय करता है। DISHA इसे परिस्थितियों पर मापता है — साथी जिसने अपना हिस्सा नहीं किया, असहमत अभिभावक, अंतिम रात विफल होती योजना — विनम्र उत्तर नहीं, सहानुभूति, संयम और निर्णय देखते हुए। यह पूरी तरह सीखा जा सकता है और सूची के हर करियर को मज़बूत करता है।"
      },
      chips: {
        en: [["Measured by", "Judgement in real situations, not agreement"],
             ["Shows up as", "What you do when a plan fails"],
             ["Grows with", "Practice and honest feedback — at any age"]],
        hi: [["कैसे मापा", "वास्तविक स्थितियों में निर्णय, सहमति नहीं"],
             ["कहाँ दिखता है", "योजना विफल होने पर आपका व्यवहार"],
             ["कैसे बढ़ता है", "अभ्यास व ईमानदार प्रतिक्रिया — किसी भी उम्र में"]]
      },
      reads: {
        en: "“Composure is strong, but conflict is avoided rather than resolved — a team-lead role would need support in the first year.”",
        hi: "“संयम मज़बूत है, पर टकराव सुलझाने के बजाय टाला जाता है — टीम-लीड भूमिका में पहले वर्ष सहयोग चाहिए।”"
      },
      svg: rings
    }
  ];

  /* ------------------------------------------------------------------ visuals
     Each is a small idea drawn honestly: six petals for the interest mix,
     four filling bars for reasoning, three sliders with no better end, a
     compass of competing pulls, and widening rings for emotional reach. */
  function petals() {
    var v = [92, 74, 88, 46, 58, 66], out = "";
    for (var i = 0; i < 6; i++) {
      var a = i * 60, r = 26 + v[i] * 0.52;
      out += '<g transform="rotate(' + a + ' 130 100)">' +
        '<path class="dz-grow" style="animation-delay:' + (i * 90) + 'ms" ' +
        'd="M130,100 C' + (130 - 16) + ',' + (100 - r * 0.6) + ' ' + (130 - 13) + ',' + (100 - r) +
        ' 130,' + (100 - r) + ' C' + (130 + 13) + ',' + (100 - r) + ' ' + (130 + 16) + ',' +
        (100 - r * 0.6) + ' 130,100 Z" fill="' + (i % 2 ? P.cardinal : "#B24545") +
        '" opacity="' + (0.55 + i * 0.06) + '"/></g>';
    }
    return svg(out + '<circle cx="130" cy="100" r="19" fill="#fff" stroke="' + P.cardinal + '" stroke-width="3"/>' +
      '<text x="130" y="105" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="' + P.cardinal + '">6</text>' +
      label(T("Six working styles, one shape", "छह कार्य-शैलियाँ, एक आकार")));
  }
  function bars() {
    var d = [["NUM", 71], ["LOG", 64], ["VERB", 58], ["SPA", 82]], out = "";
    for (var i = 0; i < 4; i++) {
      var x = 44 + i * 58, h = d[i][1] * 1.15;
      out += '<rect x="' + x + '" y="30" width="34" height="132" fill="' + P.fog + '" stroke="' + P.hairline + '"/>' +
        '<rect class="dz-rise" style="animation-delay:' + (i * 110) + 'ms;--h:' + h + 'px" x="' + x +
        '" y="' + (162 - h) + '" width="34" height="' + h + '" fill="' + (i === 3 ? P.cardinal : "#9E5252") + '"/>' +
        '<text x="' + (x + 17) + '" y="176" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="' + P.grey + '">' + d[i][0] + "</text>" +
        '<text x="' + (x + 17) + '" y="' + (156 - h) + '" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="' + P.ink + '">' + d[i][1] + "</text>";
    }
    return svg(out + label(T("Reasoning, scored four ways", "तर्क, चार तरह से मापा गया")));
  }
  function sliders() {
    var rows = [[T("Supporting", "सहयोगी"), T("Leading", "नेतृत्व"), 0.72],
                [T("With people", "लोगों के साथ"), T("Alone", "अकेले"), 0.34],
                [T("Exploratory", "खोजी"), T("Planned", "नियोजित"), 0.81]];
    var out = "";
    for (var i = 0; i < 3; i++) {
      var y = 48 + i * 46, x = 46 + rows[i][2] * 168;
      out += '<line x1="46" y1="' + y + '" x2="214" y2="' + y + '" stroke="' + P.hairline + '" stroke-width="6" stroke-linecap="round"/>' +
        '<circle class="dz-slide" style="animation-delay:' + (i * 120) + 'ms" cx="' + x + '" cy="' + y + '" r="11" fill="' + P.cardinal + '"/>' +
        '<text x="46" y="' + (y - 14) + '" font-family="Arial,sans-serif" font-size="10" fill="' + P.grey + '">' + esc(rows[i][0]) + "</text>" +
        '<text x="214" y="' + (y - 14) + '" text-anchor="end" font-family="Arial,sans-serif" font-size="10" fill="' + P.grey + '">' + esc(rows[i][1]) + "</text>";
    }
    return svg(out + label(T("No better end of any scale", "किसी पैमाने का कोई श्रेष्ठ सिरा नहीं")));
  }
  function compass() {
    var arms = [[T("Security", "सुरक्षा"), 88, 0], [T("Enterprise", "उद्यम"), 54, 90],
                [T("Expertise", "विशेषज्ञता"), 70, 180], [T("Service", "सेवा"), 62, 270]];
    var out = '<circle cx="130" cy="100" r="74" fill="none" stroke="' + P.hairline + '" stroke-dasharray="3 5"/>';
    for (var i = 0; i < 4; i++) {
      var r = arms[i][1] * 0.82, a = arms[i][2] * Math.PI / 180;
      var x = 130 + Math.sin(a) * r, y = 100 - Math.cos(a) * r;
      out += '<line class="dz-arm" style="animation-delay:' + (i * 100) + 'ms" x1="130" y1="100" x2="' + x.toFixed(1) +
        '" y2="' + y.toFixed(1) + '" stroke="' + (i === 0 ? P.cardinal : "#A96A6A") + '" stroke-width="' + (i === 0 ? 6 : 4) + '" stroke-linecap="round"/>' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="' + (i === 0 ? P.cardinal : "#A96A6A") + '"/>' +
        '<text x="' + (130 + Math.sin(a) * 92).toFixed(1) + '" y="' + (100 - Math.cos(a) * 92 + 4).toFixed(1) +
        '" text-anchor="middle" font-family="Arial,sans-serif" font-size="10.5" fill="' + P.grey + '">' + esc(arms[i][0]) + "</text>";
    }
    return svg(out + '<circle cx="130" cy="100" r="8" fill="#fff" stroke="' + P.ink + '" stroke-width="2.5"/>' +
      label(T("What you are optimising for", "आप किसके लिए चुन रहे हैं")));
  }
  function rings() {
    var out = "";
    for (var i = 3; i >= 0; i--) {
      out += '<circle class="dz-pulse" style="animation-delay:' + (i * 220) + 'ms" cx="130" cy="98" r="' + (26 + i * 21) +
        '" fill="none" stroke="' + P.cardinal + '" stroke-width="' + (3 - i * 0.5) + '" opacity="' + (0.9 - i * 0.2) + '"/>';
    }
    var stages = [[T("Self", "स्वयं"), 30], [T("Team", "टीम"), 51], [T("Pressure", "दबाव"), 72]];
    for (var j = 0; j < 3; j++) {
      out += '<text x="130" y="' + (98 - stages[j][1] + 4) + '" text-anchor="middle" ' +
        'font-family="Arial,sans-serif" font-size="10" fill="' + P.grey + '">' + esc(stages[j][0]) + "</text>";
    }
    return svg(out + '<circle cx="130" cy="98" r="13" fill="' + P.cardinal + '"/>' +
      '<text x="130" y="103" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#fff">EQ</text>' +
      label(T("Self, then team, then pressure", "पहले स्वयं, फिर टीम, फिर दबाव")));
  }
  function label(t) {
    return '<text x="130" y="192" text-anchor="middle" font-family="Arial,sans-serif" font-size="11.5" fill="' + P.grey + '">' + esc(t) + "</text>";
  }
  function svg(inner) {
    return '<svg viewBox="0 0 260 200" width="100%" height="100%" role="img" preserveAspectRatio="xMidYMid meet">' + inner + "</svg>";
  }

  /* ------------------------------------------------------------------ mount */
  /* React calls a ref on every render and with null on unmount, so this has to
     be safe to call repeatedly. It rebuilds only when the language changes. */
  function mount(node, uiLang, dimLabels) {
    if (!node) return;
    lang = uiLang === "hi" ? "hi" : "en";
    labels = dimLabels && dimLabels.length === 5 ? dimLabels : null;
    if (node.getAttribute("data-dz") === lang) return;
    node.setAttribute("data-dz", lang);
    host = node;
    node.innerHTML = css() + tabsHtml() + '<div id="dz-panel"></div>';
    wire();
    paint();
  }

  function css() {
    return "<style>" +
      "#dz-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}" +
      "#dz-tabs::-webkit-scrollbar{display:none}" +
      ".dz-tab{flex:1 0 auto;min-width:128px;background:#fff;border:1px solid " + P.hairline + ";border-top:4px solid " + P.hairline + ";" +
      "padding:12px 13px;cursor:pointer;text-align:left;font-family:inherit;transition:border-color .2s,background .2s,transform .2s}" +
      ".dz-tab b{display:block;font-family:'Source Serif 4',Georgia,serif;font-size:21px;color:" + P.grey + ";line-height:1}" +
      ".dz-tab span{display:block;font-weight:700;font-size:14px;color:" + P.ink + ";margin-top:4px}" +
      ".dz-tab small{display:block;font-size:11px;color:" + P.grey + ";margin-top:3px;opacity:0}" +
      ".dz-tab[aria-selected=true]{border-top-color:" + P.cardinal + ";background:" + P.fog + "}" +
      ".dz-tab[aria-selected=true] b{color:" + P.cardinal + "}" +
      ".dz-tab[aria-selected=true] small{opacity:1}" +
      ".dz-tab:hover{transform:translateY(-2px)}" +
      ".dz-tab:focus-visible{outline:3px solid " + P.sky + ";outline-offset:2px}" +
      "#dz-panel{border:1px solid " + P.hairline + ";border-top:4px solid " + P.cardinal + ";background:#fff;margin-top:10px;" +
      "padding:20px 22px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(220px,.95fr);gap:22px;align-items:start}" +
      ".dz-hook{font-family:'Source Serif 4',Georgia,serif;font-size:clamp(19px,2.6vw,25px);line-height:1.25;color:" + P.ink + ";margin:0}" +
      ".dz-kick{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:" + P.cardinal + ";margin-bottom:8px}" +
      ".dz-what{font-size:14.5px;line-height:1.7;color:" + P.grey + ";margin:12px 0 0}" +
      ".dz-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}" +
      ".dz-chip{border:1px solid " + P.hairline + ";background:" + P.fog + ";padding:7px 11px;font-size:12px;color:" + P.ink + ";line-height:1.4}" +
      ".dz-chip i{display:block;font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:" + P.cardinal + ";font-weight:800}" +
      ".dz-reads{margin-top:16px;border-left:4px solid " + P.gold + ";background:" + P.fog + ";padding:11px 14px;" +
      "font-family:'Source Serif 4',Georgia,serif;font-size:14px;line-height:1.6;color:" + P.ink + "}" +
      ".dz-art{border:1px solid " + P.hairline + ";background:" + P.fog + ";padding:10px;min-height:190px}" +
      ".dz-dots{display:flex;gap:6px;justify-content:center;margin-top:12px}" +
      ".dz-dot{width:7px;height:7px;border-radius:50%;background:" + P.hairline + ";border:none;padding:0;cursor:pointer}" +
      ".dz-dot.on{background:" + P.cardinal + ";width:20px;border-radius:4px}" +
      ".dz-fade{animation:dzFade .35s ease both}" +
      "@keyframes dzFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
      "@keyframes dzGrow{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}" +
      "@keyframes dzRise{from{transform:translateY(var(--h))}to{transform:none}}" +
      "@keyframes dzSlide{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}" +
      "@keyframes dzArm{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}" +
      "@keyframes dzPulse{from{opacity:0;transform:scale(.55)}to{opacity:inherit;transform:none}}" +
      ".dz-grow{animation:dzGrow .5s ease both;transform-origin:130px 100px}" +
      ".dz-rise{animation:dzRise .55s cubic-bezier(.2,.8,.3,1) both}" +
      ".dz-slide{animation:dzSlide .5s ease both}" +
      ".dz-arm{animation:dzArm .5s ease both;transform-origin:130px 100px}" +
      ".dz-pulse{animation:dzPulse .6s ease both;transform-origin:130px 98px}" +
      "@media(max-width:700px){#dz-panel{grid-template-columns:1fr;padding:16px}" +
      ".dz-tab{min-width:118px;padding:10px 11px}.dz-art{order:-1;min-height:160px}}" +
      "@media(prefers-reduced-motion:reduce){.dz-fade,.dz-grow,.dz-rise,.dz-slide,.dz-arm,.dz-pulse{animation:none!important}" +
      ".dz-tab{transition:none}}" +
      "@media print{#dz-tabs,.dz-dots{display:none}#dz-panel{grid-template-columns:1fr}}" +
      "</style>";
  }

  function nameOf(i) {
    /* Prefer the labels the app already uses, so a wording change there does
       not leave this panel disagreeing with the rest of the site. */
    return labels ? labels[i] : D[i].name[lang === "hi" ? "hi" : "en"];
  }

  function tabsHtml() {
    return '<div id="dz-tabs" role="tablist" aria-label="' +
      esc(T("The five dimensions", "पाँच आयाम")) + '">' +
      D.map(function (d, i) {
        return '<button class="dz-tab" role="tab" id="dz-t' + i + '" data-i="' + i +
          '" aria-controls="dz-panel" aria-selected="' + (i === active) + '" tabindex="' + (i === active ? 0 : -1) + '">' +
          "<b>" + (i + 1) + "</b><span>" + esc(nameOf(i)) + "</span>" +
          "<small>" + esc(T("Open", "खोलें")) + " →</small></button>";
      }).join("") + "</div>";
  }

  function panelHtml() {
    var d = D[active], L = lang === "hi" ? "hi" : "en";
    return '<div class="dz-fade" style="min-width:0">' +
      '<div class="dz-kick">' + esc(T("Dimension", "आयाम")) + " " + (active + 1) + " · " + esc(nameOf(active)) + "</div>" +
      '<p class="dz-hook">' + esc(d.hook[L]) + "</p>" +
      '<p class="dz-what">' + esc(d.what[L]) + "</p>" +
      '<div class="dz-chips">' +
      d.chips[L].map(function (c) { return '<div class="dz-chip"><i>' + esc(c[0]) + "</i>" + esc(c[1]) + "</div>"; }).join("") +
      "</div>" +
      '<div class="dz-reads">' + esc(d.reads[L]) + "</div>" +
      "</div>" +
      '<div class="dz-art dz-fade">' + d.svg() + "</div>";
  }

  function dotsHtml() {
    return '<div class="dz-dots">' + D.map(function (d, i) {
      return '<button class="dz-dot' + (i === active ? " on" : "") + '" data-i="' + i +
        '" aria-label="' + esc(nameOf(i)) + '"></button>';
    }).join("") + "</div>";
  }

  function paint() {
    if (!host) return;
    var panel = host.querySelector("#dz-panel");
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", "dz-t" + active);
    panel.innerHTML = panelHtml();
    var old = host.querySelector(".dz-dots");
    if (old) old.remove();
    panel.insertAdjacentHTML("afterend", dotsHtml());
    Array.prototype.forEach.call(host.querySelectorAll(".dz-dot"), function (b) {
      b.onclick = function () { go(+b.getAttribute("data-i")); };
    });
    Array.prototype.forEach.call(host.querySelectorAll(".dz-tab"), function (b) {
      var i = +b.getAttribute("data-i");
      b.setAttribute("aria-selected", i === active);
      b.tabIndex = i === active ? 0 : -1;
    });
  }

  function go(i, focusTab) {
    if (i < 0) i = D.length - 1;
    if (i >= D.length) i = 0;
    active = i;
    paint();
    var tab = host.querySelector("#dz-t" + i);
    if (tab) {
      if (focusTab) tab.focus();
      /* Keep the chosen tab in view on a narrow screen without yanking the
         whole page around. */
      try { tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); } catch (e) {}
    }
  }

  function wire() {
    var tabs = host.querySelector("#dz-tabs");
    Array.prototype.forEach.call(tabs.querySelectorAll(".dz-tab"), function (b) {
      b.onclick = function () { go(+b.getAttribute("data-i")); };
    });
    tabs.onkeydown = function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") { go(active + 1, true); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { go(active - 1, true); e.preventDefault(); }
      else if (k === "Home") { go(0, true); e.preventDefault(); }
      else if (k === "End") { go(D.length - 1, true); e.preventDefault(); }
    };
    /* Swipe the panel on a phone. Vertical drags are left alone so the page
       still scrolls normally. */
    var x0 = null, y0 = null;
    host.addEventListener("touchstart", function (e) {
      if (!e.touches || !e.touches[0]) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    host.addEventListener("touchend", function (e) {
      if (x0 == null || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) go(active + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    }, { passive: true });
  }

  return { mount: mount, go: go, dimensions: D };
})();
