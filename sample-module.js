/* ===========================================================================
   DISHA — SAMPLE PAPER  (window.DISHA_SAMPLE)

   Fifteen questions, three per dimension, with an instant read-out. The point
   is not to assess anybody — it is to let a parent or student see what the
   questions feel like and what the five dimensions actually measure, before
   they decide to pay.

   Written to be honest about what it is
   -------------------------------------
   · Every item here is original, written for this demo. Nothing is drawn from
     the live assessment bank, so practising on it gains nobody anything.
   · Three questions cannot measure a dimension. The report says so plainly
     and calls itself a first look, never a result.
   · Two of the five dimensions have right answers (Aptitude, Emotional Skill)
     and three do not (Interest, Personality, Orientation). The report treats
     them differently instead of pretending everything is a score out of ten —
     for the three, the bar shows how clear a signal the answers gave, not how
     good the person is.
   =========================================================================== */
window.DISHA_SAMPLE = (function () {
  "use strict";

  var P = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A", fog: "#F4F4F4",
            hairline: "#D5D5D0", sky: "#006CB8", gold: "#C9A227", green: "#1E7A46" };

  var lang = "en", overlay = null, idx = 0, answers = {}, done = false;

  function T(en, hi) { return lang === "hi" ? hi : en; }
  function L(o) { return o && typeof o === "object" ? (lang === "hi" ? (o.hi || o.en) : o.en) : o; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------------ items */
  var STYLES = {
    build:      { en: "Building",      hi: "निर्माण" },
    investigate:{ en: "Investigating", hi: "खोज" },
    create:     { en: "Creating",      hi: "सृजन" },
    help:       { en: "Helping",       hi: "सहायता" },
    persuade:   { en: "Persuading",    hi: "प्रेरित करना" },
    organise:   { en: "Organising",    hi: "व्यवस्थापन" }
  };
  var DRIVERS = {
    security:  { en: "Security",   hi: "सुरक्षा" },
    enterprise:{ en: "Enterprise", hi: "उद्यम" },
    expertise: { en: "Expertise",  hi: "विशेषज्ञता" },
    service:   { en: "Service",    hi: "सेवा" }
  };

  var Q = [
    /* ---- Interest: what pulls you, with no right answer ------------------ */
    { dim: "interest", q: { en: "A free Saturday, no homework. What are you most likely to end up doing?",
                            hi: "खाली शनिवार, कोई गृहकार्य नहीं। आप सबसे अधिक क्या करेंगे?" },
      opts: [
        { t: { en: "Taking apart the broken speaker to see if I can fix it", hi: "खराब स्पीकर खोलकर देखना कि ठीक कर सकता हूँ या नहीं" }, style: "build" },
        { t: { en: "Falling down a rabbit hole reading about why the sky is that colour", hi: "यह पढ़ने में खो जाना कि आसमान का रंग वैसा क्यों है" }, style: "investigate" },
        { t: { en: "Filming and editing something silly with friends", hi: "दोस्तों के साथ कुछ मज़ेदार शूट और एडिट करना" }, style: "create" },
        { t: { en: "Helping my cousin who is stuck with her maths", hi: "गणित में अटकी चचेरी बहन की मदद करना" }, style: "help" }
      ] },
    { dim: "interest", q: { en: "Your class has to run a stall at the school fair. Which job do you volunteer for?",
                            hi: "आपकी कक्षा को मेले में स्टॉल लगाना है। आप कौन-सा काम लेंगे?" },
      opts: [
        { t: { en: "Designing the banner and how the stall looks", hi: "बैनर और स्टॉल की सजावट डिज़ाइन करना" }, style: "create" },
        { t: { en: "Standing in front and pulling people in", hi: "सामने खड़े होकर लोगों को बुलाना" }, style: "persuade" },
        { t: { en: "Working out the budget, the rota and what we need to buy", hi: "बजट, ड्यूटी और खरीदारी की सूची बनाना" }, style: "organise" },
        { t: { en: "Building the stall frame and rigging the lights", hi: "स्टॉल का ढाँचा बनाना और रोशनी लगाना" }, style: "build" }
      ] },
    { dim: "interest", q: { en: "Which of these would you read to the end without being told to?",
                            hi: "इनमें से कौन-सा आप बिना कहे पूरा पढ़ेंगे?" },
      opts: [
        { t: { en: "How a vaccine actually gets tested", hi: "वैक्सीन का परीक्षण वास्तव में कैसे होता है" }, style: "investigate" },
        { t: { en: "How a small shop grew into a chain", hi: "एक छोटी दुकान कैसे शृंखला बनी" }, style: "persuade" },
        { t: { en: "How a film's sound was put together", hi: "किसी फ़िल्म की ध्वनि कैसे बनी" }, style: "create" },
        { t: { en: "How a relief camp is run after a flood", hi: "बाढ़ के बाद राहत शिविर कैसे चलता है" }, style: "help" }
      ] },

    /* ---- Aptitude: reasoning, one right answer --------------------------- */
    { dim: "aptitude", q: { en: "A shop sells 3 notebooks for \u20B9120. At the same rate, what do 7 notebooks cost?",
                            hi: "एक दुकान 3 नोटबुक \u20B9120 में बेचती है। उसी दर पर 7 नोटबुक का मूल्य?" },
      opts: [
        { t: { en: "\u20B9240", hi: "\u20B9240" } },
        { t: { en: "\u20B9280", hi: "\u20B9280" }, correct: true },
        { t: { en: "\u20B9300", hi: "\u20B9300" } },
        { t: { en: "\u20B9360", hi: "\u20B9360" } }
      ],
      why: { en: "One notebook is \u20B940, so seven are \u20B9280. The trap is doubling \u20B9120 and adding one.",
             hi: "एक नोटबुक \u20B940 की, इसलिए सात की \u20B9280। जाल है \u20B9120 को दोगुना कर एक जोड़ना।" } },
    { dim: "aptitude", q: { en: "All the pens in the box are blue. Some blue things in this room are not pens. Which must be true?",
                            hi: "डिब्बे की सभी कलमें नीली हैं। इस कमरे की कुछ नीली चीज़ें कलम नहीं हैं। क्या अवश्य सत्य है?" },
      opts: [
        { t: { en: "Some pens in the box are not blue", hi: "डिब्बे की कुछ कलमें नीली नहीं हैं" } },
        { t: { en: "Every blue thing in the room is in the box", hi: "कमरे की हर नीली चीज़ डिब्बे में है" } },
        { t: { en: "A blue thing in the room may not be a pen", hi: "कमरे की कोई नीली चीज़ कलम न भी हो सकती है" }, correct: true },
        { t: { en: "The box contains no blue things", hi: "डिब्बे में कोई नीली चीज़ नहीं है" } }
      ],
      why: { en: "Only the third restates what was given. The others add something the statements never said.",
             hi: "केवल तीसरा दिए गए कथन को दोहराता है। बाकी कुछ ऐसा जोड़ते हैं जो कहा ही नहीं गया।" } },
    { dim: "aptitude", q: { en: "A square sheet is folded once down the middle, then a corner is cut off the folded edge. Unfolded, what do you see?",
                            hi: "एक वर्गाकार कागज़ बीच से एक बार मोड़ा गया, फिर मुड़े किनारे से एक कोना काटा गया। खोलने पर क्या दिखेगा?" },
      opts: [
        { t: { en: "One notch at the edge", hi: "किनारे पर एक कटाव" } },
        { t: { en: "Two notches, mirrored about the fold", hi: "दो कटाव, मोड़ के दोनों ओर दर्पण जैसे" }, correct: true },
        { t: { en: "A hole in the centre", hi: "बीच में एक छेद" } },
        { t: { en: "Four notches, one per corner", hi: "चार कटाव, हर कोने पर एक" } }
      ],
      why: { en: "A cut through a folded edge goes through both layers, so it opens as a mirrored pair.",
             hi: "मुड़े किनारे से कटाव दोनों परतों से होकर जाता है, इसलिए खुलने पर दर्पण जैसी जोड़ी बनती है।" } },

    /* ---- Personality: a preference, both ends valid ---------------------- */
    { dim: "personality", axis: "lead", q: { en: "A group project has no leader and the deadline is close. You:",
                                             hi: "समूह परियोजना में कोई नेता नहीं और समय-सीमा पास है। आप:" },
      opts: [
        { t: { en: "Take charge and hand out the work", hi: "कमान सँभालकर काम बाँट देते हैं" }, v: 2 },
        { t: { en: "Suggest a plan and see if people agree", hi: "योजना सुझाकर देखते हैं कि सहमति है या नहीं" }, v: 1 },
        { t: { en: "Wait for someone to organise it, then do my part well", hi: "किसी के व्यवस्थित करने की प्रतीक्षा कर अपना भाग अच्छे से करते हैं" }, v: -1 },
        { t: { en: "Quietly finish my own part and let the rest sort itself", hi: "चुपचाप अपना भाग पूरा कर बाकी को उन पर छोड़ते हैं" }, v: -2 }
      ] },
    { dim: "personality", axis: "social", q: { en: "You learn a hard chapter best by:",
                                               hi: "कठिन अध्याय आप सबसे अच्छे से कैसे सीखते हैं:" },
      opts: [
        { t: { en: "Explaining it aloud to someone else", hi: "किसी और को बोलकर समझाकर" }, v: 2 },
        { t: { en: "Studying with one friend beside me", hi: "एक मित्र के साथ बैठकर" }, v: 1 },
        { t: { en: "Reading it alone, then testing myself", hi: "अकेले पढ़कर, फिर स्वयं की परीक्षा लेकर" }, v: -1 },
        { t: { en: "Alone, in complete silence, for hours", hi: "अकेले, पूर्ण शांति में, घंटों तक" }, v: -2 }
      ] },
    { dim: "personality", axis: "plan", q: { en: "A week-long holiday with family. Which sounds better?",
                                             hi: "परिवार के साथ सप्ताह भर की छुट्टी। कौन-सा बेहतर लगता है?" },
      opts: [
        { t: { en: "Everything booked before we leave", hi: "निकलने से पहले सब कुछ बुक" }, v: 2 },
        { t: { en: "Travel and stay fixed, the days left open", hi: "यात्रा और ठहरना तय, दिन खुले" }, v: 1 },
        { t: { en: "A rough idea and we work it out there", hi: "मोटा अंदाज़ा, बाकी वहीं तय" }, v: -1 },
        { t: { en: "Turn up and see what happens", hi: "पहुँचकर देखेंगे क्या होता है" }, v: -2 }
      ] },

    /* ---- Orientation: what you want the work to give back ---------------- */
    { dim: "orientation", q: { en: "Two offers, same pay. Which do you take?",
                               hi: "दो प्रस्ताव, समान वेतन। कौन-सा लेंगे?" },
      opts: [
        { t: { en: "A government post with a pension and a fixed posting", hi: "पेंशन और स्थायी नियुक्ति वाली सरकारी नौकरी" }, drv: "security" },
        { t: { en: "A four-person start-up with a share of what it becomes", hi: "चार लोगों का स्टार्टअप, भविष्य में हिस्सेदारी के साथ" }, drv: "enterprise" },
        { t: { en: "A research lab where I get very good at one thing", hi: "शोध प्रयोगशाला जहाँ एक चीज़ में महारत मिले" }, drv: "expertise" },
        { t: { en: "A district hospital where the work is plainly needed", hi: "ज़िला अस्पताल जहाँ काम की स्पष्ट आवश्यकता है" }, drv: "service" }
      ] },
    { dim: "orientation", q: { en: "Ten years from now, which sentence would you most want to be true?",
                               hi: "दस वर्ष बाद, कौन-सा वाक्य सत्य होना सबसे अधिक चाहेंगे?" },
      opts: [
        { t: { en: "\u201CMy family never has to worry about the month's money.\u201D", hi: "\u201Cमेरे परिवार को महीने के पैसे की चिंता कभी न हो।\u201D" }, drv: "security" },
        { t: { en: "\u201CI built something that did not exist before.\u201D", hi: "\u201Cमैंने कुछ ऐसा बनाया जो पहले नहीं था।\u201D" }, drv: "enterprise" },
        { t: { en: "\u201CPeople call me when the problem is genuinely hard.\u201D", hi: "\u201Cसमस्या सचमुच कठिन हो तो लोग मुझे बुलाते हैं।\u201D" }, drv: "expertise" },
        { t: { en: "\u201CSomeone's life is better because of work I did.\u201D", hi: "\u201Cमेरे काम से किसी का जीवन बेहतर हुआ।\u201D" }, drv: "service" }
      ] },
    { dim: "orientation", q: { en: "The course you want means five years of study and leaving home. You:",
                               hi: "मनचाहे पाठ्यक्रम के लिए पाँच वर्ष की पढ़ाई और घर छोड़ना होगा। आप:" },
      opts: [
        { t: { en: "Would rather find something closer and shorter", hi: "कुछ पास का और छोटा ढूँढना पसंद करेंगे" }, drv: "security" },
        { t: { en: "Would go, and look for ways to earn while studying", hi: "जाएँगे, और पढ़ाई के साथ कमाने के रास्ते खोजेंगे" }, drv: "enterprise" },
        { t: { en: "Would go — five years is worth it to be properly good", hi: "जाएँगे — सचमुच निपुण बनने के लिए पाँच वर्ष उचित हैं" }, drv: "expertise" },
        { t: { en: "Would go if the work at the end reaches people who need it", hi: "जाएँगे, यदि अंत में वह काम ज़रूरतमंदों तक पहुँचे" }, drv: "service" }
      ] },

    /* ---- Emotional skill: judgement, better and worse answers ------------ */
    { dim: "eq", q: { en: "A teammate has not done their part and the submission is tomorrow. What do you do first?",
                      hi: "एक साथी ने अपना भाग नहीं किया और कल जमा करना है। पहले क्या करेंगे?" },
      opts: [
        { t: { en: "Ask them what happened, then decide together what is still possible", hi: "पूछें क्या हुआ, फिर मिलकर तय करें कि अब क्या संभव है" }, pts: 2 },
        { t: { en: "Quietly do their part yourself and say nothing", hi: "चुपचाप उनका भाग स्वयं कर लें और कुछ न कहें" }, pts: 1 },
        { t: { en: "Tell the teacher before the deadline so you are not blamed", hi: "समय-सीमा से पहले शिक्षक को बता दें ताकि दोष आप पर न आए" }, pts: 1 },
        { t: { en: "Message the group about how unfair it is", hi: "समूह में संदेश भेजें कि यह कितना अनुचित है" }, pts: 0 }
      ] },
    { dim: "eq", q: { en: "You wanted Science. Your parents have decided Commerce. The conversation is tonight.",
                      hi: "आप विज्ञान चाहते थे। माता-पिता ने वाणिज्य तय किया है। बात आज रात होनी है।" },
      opts: [
        { t: { en: "Ask what worries them about Science, and answer that worry", hi: "पूछें कि विज्ञान को लेकर उनकी चिंता क्या है, और उसी का उत्तर दें" }, pts: 2 },
        { t: { en: "Bring your marks and a written plan for how Science would work", hi: "अपने अंक और विज्ञान की लिखित योजना लेकर जाएँ" }, pts: 2 },
        { t: { en: "Agree now and hope to change it after the first term", hi: "अभी सहमत हो जाएँ और पहले सत्र के बाद बदलने की आशा रखें" }, pts: 0 },
        { t: { en: "Refuse to discuss it until they take your side", hi: "जब तक वे आपका पक्ष न लें, बात करने से मना कर दें" }, pts: 0 }
      ] },
    { dim: "eq", q: { en: "You get a much lower mark than you expected on a test you prepared hard for. That evening you:",
                      hi: "जिस परीक्षा की खूब तैयारी की, उसमें अपेक्षा से बहुत कम अंक मिले। उस शाम आप:" },
      opts: [
        { t: { en: "Go through the paper to find where the marks actually went", hi: "उत्तर-पत्र देखकर पता लगाएँ कि अंक कहाँ गए" }, pts: 2 },
        { t: { en: "Take the evening off, then look at it properly tomorrow", hi: "शाम विश्राम करें, कल ठीक से देखें" }, pts: 2 },
        { t: { en: "Decide the subject is not for you", hi: "तय कर लें कि यह विषय आपके लिए नहीं है" }, pts: 0 },
        { t: { en: "Work until 2 a.m. so it never happens again", hi: "रात 2 बजे तक पढ़ें ताकि दोबारा ऐसा न हो" }, pts: 0 }
      ] }
  ];

  var DIM = {
    interest:    { n: { en: "Interest", hi: "रुचि" } },
    aptitude:    { n: { en: "Aptitude", hi: "योग्यता" } },
    personality: { n: { en: "Personality", hi: "व्यक्तित्व" } },
    orientation: { n: { en: "Orientation", hi: "कार्य-दृष्टि" } },
    eq:          { n: { en: "Emotional Skill", hi: "भावनात्मक कौशल" } }
  };

  /* ------------------------------------------------------------------ scoring */
  function score() {
    var r = {};

    /* Interest — a tally, not a score. The bar shows how concentrated the
       three picks were, because three scattered answers mean the signal is
       weak, not that the student is deficient. */
    var tally = {};
    [0, 1, 2].forEach(function (i) {
      var a = answers[i]; if (a == null) return;
      var st = Q[i].opts[a].style;
      tally[st] = (tally[st] || 0) + 1;
    });
    var top = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
    var conc = top.length ? tally[top[0]] : 0;
    r.interest = { pct: conc === 3 ? 100 : conc === 2 ? 70 : 40, top: top, tally: tally,
                   kind: "signal" };

    /* Aptitude — right or wrong. */
    var right = 0;
    [3, 4, 5].forEach(function (i) {
      var a = answers[i];
      if (a != null && Q[i].opts[a].correct) right++;
    });
    r.aptitude = { pct: Math.round((right / 3) * 100), right: right, kind: "score" };

    /* Personality — position on three axes, and how decisive the answers were. */
    var ax = {};
    [6, 7, 8].forEach(function (i) {
      var a = answers[i]; if (a == null) return;
      ax[Q[i].axis] = Q[i].opts[a].v;
    });
    var decisive = Object.keys(ax).reduce(function (s, k) { return s + Math.abs(ax[k]); }, 0);
    r.personality = { pct: Math.round((decisive / 6) * 100), axes: ax, kind: "signal" };

    /* Orientation — which driver dominates. */
    var drv = {};
    [9, 10, 11].forEach(function (i) {
      var a = answers[i]; if (a == null) return;
      var d = Q[i].opts[a].drv;
      drv[d] = (drv[d] || 0) + 1;
    });
    var dtop = Object.keys(drv).sort(function (a, b) { return drv[b] - drv[a]; });
    var dconc = dtop.length ? drv[dtop[0]] : 0;
    r.orientation = { pct: dconc === 3 ? 100 : dconc === 2 ? 70 : 40, top: dtop, tally: drv, kind: "signal" };

    /* Emotional skill — judgement, 0 to 6. */
    var pts = 0;
    [12, 13, 14].forEach(function (i) {
      var a = answers[i];
      if (a != null) pts += Q[i].opts[a].pts || 0;
    });
    r.eq = { pct: Math.round((pts / 6) * 100), pts: pts, kind: "score" };
    return r;
  }

  /* Readable sentences. Deliberately cautious: three items justify an
     observation, never a conclusion. */
  function readout(r) {
    var out = {};
    var st = r.interest.top.map(function (k) { return L(STYLES[k]); });
    out.interest = r.interest.pct === 100
      ? T("All three answers pointed the same way: " + st[0] + ". That is a clear early signal.",
          "तीनों उत्तर एक ही दिशा में गए: " + st[0] + "। यह एक स्पष्ट प्रारंभिक संकेत है।")
      : r.interest.pct === 70
        ? T("Two of three leaned to " + st[0] + ", with " + (st[1] || "") + " alongside. A mix is normal — the full assessment separates them.",
            "तीन में से दो " + st[0] + " की ओर, साथ में " + (st[1] || "") + "। मिश्रण सामान्य है — पूर्ण मूल्यांकन इन्हें अलग करता है।")
        : T("Three different directions. That usually means genuine breadth, which needs more than three questions to untangle.",
            "तीन अलग दिशाएँ। इसका अर्थ प्रायः वास्तविक विविधता होता है, जिसे सुलझाने के लिए तीन प्रश्न पर्याप्त नहीं।");

    out.aptitude = r.aptitude.right === 3
      ? T("Three out of three, across numerical, logical and spatial reasoning.",
          "तीन में से तीन — संख्यात्मक, तार्किक और स्थानिक तर्क में।")
      : r.aptitude.right === 0
        ? T("None right this time — and one sample question of each type proves nothing. Reasoning is the dimension that moves fastest with practice.",
            "इस बार कोई सही नहीं — और हर प्रकार का एक नमूना प्रश्न कुछ सिद्ध नहीं करता। अभ्यास से तर्क सबसे तेज़ी से सुधरता है।")
        : T(r.aptitude.right + " of 3. The full test asks enough of each type to tell a pattern from a bad day.",
            "3 में से " + r.aptitude.right + "। पूर्ण परीक्षा हर प्रकार के पर्याप्त प्रश्न पूछती है ताकि पैटर्न और बुरा दिन अलग दिखें।");

    var a = r.personality.axes, bits = [];
    if (a.lead != null) bits.push(a.lead > 0 ? T("takes charge", "कमान सँभालते हैं") : T("prefers to support", "सहयोग करना पसंद करते हैं"));
    if (a.social != null) bits.push(a.social > 0 ? T("thinks out loud with people", "लोगों के साथ सोचते हैं") : T("works best alone", "अकेले सर्वश्रेष्ठ काम करते हैं"));
    if (a.plan != null) bits.push(a.plan > 0 ? T("wants a plan", "योजना चाहते हैं") : T("is happy improvising", "सहज रूप से चलना पसंद है"));
    out.personality = bits.join(", ") + ". " +
      T("Neither end of any of these is better — they decide which working conditions suit you.",
        "इनमें किसी का कोई सिरा बेहतर नहीं — ये तय करते हैं कि कौन-सी कार्य-परिस्थिति आपको सूट करती है।");

    var d = r.orientation.top.map(function (k) { return L(DRIVERS[k]); });
    out.orientation = d.length
      ? T("Leaning to " + d[0] + (d[1] ? ", with " + d[1] + " close behind" : "") + ". This is the dimension that most often decides between two careers with identical scores.",
          d[0] + " की ओर झुकाव" + (d[1] ? ", " + d[1] + " पीछे-पीछे" : "") + "। समान अंकों वाले दो करियर में प्रायः यही आयाम निर्णय करता है।")
      : "";

    out.eq = r.eq.pts >= 5
      ? T("Strong judgement: you went to the cause before the blame.",
          "मज़बूत निर्णय: आपने दोष से पहले कारण देखा।")
      : r.eq.pts >= 3
        ? T("Reasonable judgement, with a pull towards absorbing the problem yourself rather than naming it.",
            "उचित निर्णय, पर समस्या को कहने के बजाय स्वयं सहने का झुकाव।")
        : T("The choices leaned to avoiding or escalating. This is the most learnable of the five.",
            "चुनाव टालने या बढ़ाने की ओर गए। पाँचों में यह सबसे अधिक सीखा जा सकने वाला है।");
    return out;
  }

  /* ------------------------------------------------------------------ UI */
  function open(uiLang) {
    lang = uiLang === "hi" ? "hi" : "en";
    idx = 0; answers = {}; done = false;
    close();
    overlay = document.createElement("div");
    overlay.id = "disha-sample";
    document.body.appendChild(overlay);
    overlay.innerHTML = css() + '<div id="sp-card"><div id="sp-head"></div><div id="sp-body"></div></div>';
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
    try { document.body.style.overflow = "hidden"; } catch (e) {}
    render();
  }
  function close() {
    if (overlay) { overlay.remove(); overlay = null; }
    document.removeEventListener("keydown", onKey);
    try { document.body.style.overflow = ""; } catch (e) {}
  }
  function onKey(e) { if (e.key === "Escape") close(); }

  function css() {
    return "<style>" +
      "#disha-sample{position:fixed;inset:0;z-index:99996;background:rgba(46,45,41,.6);overflow-y:auto;padding:16px 12px;" +
      "font-family:'Source Sans 3',Arial,sans-serif;-webkit-overflow-scrolling:touch}" +
      "#sp-card{max-width:760px;margin:0 auto;background:#fff;border-top:6px solid " + P.cardinal + ";box-shadow:0 18px 50px rgba(0,0,0,.32)}" +
      "#sp-head{padding:16px 22px 12px;border-bottom:1px solid " + P.hairline + ";display:flex;gap:12px;align-items:flex-start}" +
      "#sp-head h2{font-family:'Source Serif 4',Georgia,serif;font-size:21px;margin:0;color:" + P.ink + "}" +
      "#sp-head p{margin:3px 0 0;font-size:12.5px;color:" + P.grey + "}" +
      "#sp-x{margin-left:auto;background:none;border:none;font-size:25px;line-height:1;color:" + P.grey + ";cursor:pointer;font-family:inherit}" +
      "#sp-body{padding:20px 22px 26px}" +
      ".sp-bar{height:5px;background:" + P.hairline + ";margin-top:12px}" +
      ".sp-bar i{display:block;height:5px;background:" + P.cardinal + ";transition:width .3s}" +
      ".sp-kick{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:" + P.cardinal + "}" +
      ".sp-q{font-family:'Source Serif 4',Georgia,serif;font-size:clamp(18px,2.6vw,23px);line-height:1.35;color:" + P.ink + ";margin:8px 0 0}" +
      ".sp-opt{display:block;width:100%;text-align:left;background:#fff;border:1px solid " + P.hairline + ";border-left:4px solid " + P.hairline + ";" +
      "padding:13px 15px;margin-top:9px;font-size:15px;line-height:1.45;color:" + P.ink + ";cursor:pointer;font-family:inherit}" +
      ".sp-opt:hover{border-left-color:" + P.cardinal + ";background:" + P.fog + "}" +
      ".sp-opt.on{border-left-color:" + P.cardinal + ";background:" + P.fog + ";font-weight:600}" +
      ".sp-nav{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap}" +
      ".sp-btn{background:" + P.cardinal + ";color:#fff;border:none;font-weight:700;font-size:14.5px;padding:11px 20px;cursor:pointer;font-family:inherit}" +
      ".sp-btn:disabled{background:" + P.hairline + ";cursor:not-allowed}" +
      ".sp-ghost{background:#fff;color:" + P.ink + ";border:2px solid " + P.ink + ";font-weight:700;font-size:14px;padding:9px 16px;cursor:pointer;font-family:inherit}" +
      ".sp-link{background:none;border:none;color:" + P.sky + ";font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit;padding:0}" +
      ".sp-why{border-left:4px solid " + P.gold + ";background:" + P.fog + ";padding:10px 13px;font-size:13.5px;line-height:1.55;color:" + P.ink + ";margin-top:12px}" +
      ".sp-row{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;margin-top:14px}" +
      ".sp-row b{font-size:13.5px;color:" + P.ink + "}" +
      ".sp-meter{height:11px;background:" + P.fog + ";border:1px solid " + P.hairline + "}" +
      ".sp-meter i{display:block;height:9px;background:" + P.cardinal + "}" +
      ".sp-read{font-size:13.5px;color:" + P.grey + ";line-height:1.6;margin:5px 0 0;grid-column:1/-1}" +
      ".sp-note{border-left:4px solid " + P.gold + ";background:" + P.fog + ";padding:12px 14px;font-size:13.5px;line-height:1.6;color:" + P.ink + ";margin-top:18px}" +
      ".sp-cta{background:" + P.ink + ";color:#fff;padding:18px 20px;margin-top:18px}" +
      ".sp-cta h3{font-family:'Source Serif 4',Georgia,serif;font-size:20px;margin:0 0 6px}" +
      ".sp-cta p{font-size:13.5px;line-height:1.6;color:#E6E4DF;margin:0 0 12px}" +
      "@media(max-width:560px){.sp-row{grid-template-columns:1fr}#sp-body{padding:16px 15px 22px}}" +
      "</style>";
  }

  function render() {
    if (!overlay) return;
    var head = overlay.querySelector("#sp-head"), body = overlay.querySelector("#sp-body");
    head.innerHTML = "<div><h2>" + T("5-D sample paper", "5-D नमूना प्रश्न-पत्र") + "</h2>" +
      "<p>" + (done ? T("Your first look", "आपकी पहली झलक")
                    : T("Question " + (idx + 1) + " of 15 \u00B7 " + L(DIM[Q[idx].dim].n),
                        "प्रश्न " + (idx + 1) + " / 15 \u00B7 " + L(DIM[Q[idx].dim].n))) + "</p></div>" +
      '<button id="sp-x" aria-label="Close">&times;</button>';
    head.querySelector("#sp-x").onclick = close;
    body.innerHTML = done ? report() : question();
    wire();
    try { if (body.scrollIntoView) body.scrollIntoView({ block: "nearest" }); } catch (e) {}
  }

  function question() {
    var q = Q[idx], picked = answers[idx];
    var showWhy = q.why && picked != null;
    return '<div class="sp-bar"><i style="width:' + Math.round((idx / 15) * 100) + '%"></i></div>' +
      '<div style="margin-top:14px"><span class="sp-kick">' + esc(L(DIM[q.dim].n)) + "</span>" +
      '<p class="sp-q">' + esc(L(q.q)) + "</p></div>" +
      q.opts.map(function (o, i) {
        return '<button class="sp-opt' + (picked === i ? " on" : "") + '" data-o="' + i + '">' + esc(L(o.t)) + "</button>";
      }).join("") +
      (showWhy ? '<div class="sp-why"><b>' + T("Why: ", "क्यों: ") + "</b>" + esc(L(q.why)) + "</div>" : "") +
      '<div class="sp-nav">' +
      (idx > 0 ? '<button class="sp-ghost" id="sp-prev">\u2190 ' + T("Back", "पीछे") + "</button>" : "") +
      '<button class="sp-btn" id="sp-next"' + (picked == null ? " disabled" : "") + ">" +
      (idx === 14 ? T("See my 5-D read \u2192", "मेरी 5-D झलक देखें \u2192") : T("Next \u2192", "आगे \u2192")) + "</button>" +
      '<span style="font-size:12.5px;color:' + P.grey + '">' +
      (q.dim === "aptitude" || q.dim === "eq"
        ? T("This one has a better answer.", "इसका एक बेहतर उत्तर है।")
        : T("No right answer here.", "यहाँ कोई सही उत्तर नहीं।")) + "</span></div>";
  }

  function report() {
    var r = score(), rd = readout(r);
    var order = ["interest", "aptitude", "personality", "orientation", "eq"];
    return '<p class="sp-q" style="font-size:22px">' +
      T("Your first look at the five dimensions", "पाँच आयामों की आपकी पहली झलक") + "</p>" +
      '<p style="font-size:13.5px;color:' + P.grey + ';line-height:1.6;margin-top:6px">' +
      T("Three questions each. Enough to show you what is measured — nowhere near enough to tell you what to study.",
        "प्रत्येक के तीन प्रश्न। यह दिखाने भर के लिए कि क्या मापा जाता है — यह बताने के लिए नहीं कि क्या पढ़ें।") + "</p>" +
      order.map(function (k) {
        var v = r[k];
        return '<div class="sp-row"><b>' + esc(L(DIM[k].n)) +
          '<br><span style="font-weight:400;font-size:11px;color:' + P.grey + '">' +
          (v.kind === "score" ? T("scored", "अंकित") : T("signal strength", "संकेत की स्पष्टता")) + "</span></b>" +
          '<div class="sp-meter"><i style="width:' + v.pct + '%"></i></div>' +
          '<p class="sp-read">' + esc(rd[k]) + "</p></div>";
      }).join("") +
      '<div class="sp-note">' +
      T("Two of these were scored against a right answer; three were not, because there is no right way to be interested in something. The full assessment asks 75\u2013200 questions adapted to your class, which is what makes a stream recommendation, a college list and a term-by-term plan possible.",
        "इनमें दो का मूल्यांकन सही उत्तर के विरुद्ध हुआ; तीन का नहीं, क्योंकि किसी चीज़ में रुचि रखने का कोई सही तरीका नहीं होता। पूर्ण मूल्यांकन आपकी कक्षा के अनुसार 75\u2013200 प्रश्न पूछता है, जिससे स्ट्रीम सुझाव, कॉलेज सूची और सत्र-दर-सत्र योजना संभव होती है।") +
      "</div>" +
      '<div class="sp-cta"><h3>' + T("Find your actual core interests", "अपनी वास्तविक मूल रुचियाँ जानें") + "</h3>" +
      "<p>" + T("The full 5-D assessment turns this first look into a stream recommendation, real colleges with entrance benchmarks, and a plan for the terms ahead.",
                "पूर्ण 5-D मूल्यांकन इस झलक को स्ट्रीम सुझाव, प्रवेश मानकों सहित वास्तविक कॉलेजों और आगामी सत्रों की योजना में बदलता है।") + "</p>" +
      '<button class="sp-btn" id="sp-start">' + T("Take the full assessment \u2192", "पूर्ण मूल्यांकन लें \u2192") + "</button></div>" +
      '<div class="sp-nav"><button class="sp-link" id="sp-again">' + T("Try the questions again", "प्रश्न दोबारा करें") + "</button>" +
      '<button class="sp-link" id="sp-close2">' + T("Close", "बंद करें") + "</button></div>";
  }

  function wire() {
    var q = function (s) { return overlay.querySelector(s); };
    Array.prototype.forEach.call(overlay.querySelectorAll("[data-o]"), function (b) {
      b.onclick = function () { answers[idx] = +b.getAttribute("data-o"); render(); };
    });
    if (q("#sp-next")) q("#sp-next").onclick = function () {
      if (idx === 14) { done = true; } else { idx++; }
      render();
    };
    if (q("#sp-prev")) q("#sp-prev").onclick = function () { idx--; render(); };
    if (q("#sp-again")) q("#sp-again").onclick = function () { idx = 0; answers = {}; done = false; render(); };
    if (q("#sp-close2")) q("#sp-close2").onclick = close;
    if (q("#sp-start")) q("#sp-start").onclick = startAssessment;
  }

  /* The real Start button lives in the app's own React tree. Find it by its
     label and click it; if the label ever changes, fall back to sending the
     person to the top of the page where it sits. */
  function startAssessment() {
    close();
    var labels = ["start my assessment", "मेरा मूल्यांकन", "start assessment"];
    var btns = document.querySelectorAll("button,a");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim().toLowerCase();
      for (var j = 0; j < labels.length; j++) {
        if (t.indexOf(labels[j]) === 0) { btns[i].click(); return; }
      }
    }
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
  }

  /* The invitation card that sits on the home page. */
  function mountInvite(node, uiLang) {
    if (!node) return;
    lang = uiLang === "hi" ? "hi" : "en";
    if (node.getAttribute("data-sp") === lang) return;
    node.setAttribute("data-sp", lang);
    node.innerHTML =
      "<style>" +
      "#sp-inv{border:1px solid " + P.hairline + ";border-left:5px solid " + P.cardinal + ";background:" + P.fog + ";" +
      "padding:18px 20px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-family:'Source Sans 3',Arial,sans-serif}" +
      "#sp-inv h3{font-family:'Source Serif 4',Georgia,serif;font-size:20px;margin:0 0 5px;color:" + P.ink + "}" +
      "#sp-inv p{font-size:13.5px;color:" + P.grey + ";margin:0;line-height:1.6;max-width:560px}" +
      "#sp-go{background:" + P.cardinal + ";color:#fff;border:none;font-weight:700;font-size:14.5px;padding:12px 20px;cursor:pointer;font-family:inherit;white-space:nowrap}" +
      "@media print{#sp-inv{display:none}}" +
      "</style>" +
      '<div id="sp-inv"><div style="flex:1;min-width:240px">' +
      "<h3>" + T("Try 15 sample questions \u2014 free", "15 नमूना प्रश्न आज़माएँ \u2014 निःशुल्क") + "</h3>" +
      "<p>" + T("Three from each dimension, with an instant read of what they show. Written for this demo, so nothing here is from the real paper.",
                "प्रत्येक आयाम से तीन, और तुरंत यह झलक कि वे क्या दिखाते हैं। यह डेमो के लिए लिखे गए हैं, वास्तविक प्रश्न-पत्र से नहीं।") + "</p></div>" +
      '<button id="sp-go">' + T("Start the sample \u2192", "नमूना शुरू करें \u2192") + "</button></div>";
    node.querySelector("#sp-go").onclick = function () { open(lang); };
  }

  return { open: open, close: close, mountInvite: mountInvite, questions: Q, score: score };
})();
