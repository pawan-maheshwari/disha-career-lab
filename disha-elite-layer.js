/* ============================================================
   DISHA Career Lab — ELITE LAYER
   Sits on top of disha-fix-layer. Adds:

     1. School / student profiling  — board, setting, learner type,
        so one assessment serves a Kendriya Vidyalaya, a village
        state-board school, an IB school and an ITI equally well.
     2. A SAT / CUET-level aptitude bank (48 new items across
        numerical, logical, verbal and spatial reasoning) and a
        larger aptitude block in every paper.
     3. Stream-aware dynamic question selection — once a student
        has declared a stream, the paper deepens inside it and
        runs counter-checks against it.
     4. Attempt control: one attempt per student, with an admin
        console that grants re-attempts. A re-attempt serves a
        genuinely different paper, not the same one again.
     5. An elite report layer: percentile bands, aptitude read,
        new-age interdisciplinary courses, a 24-month roadmap,
        funding routed by school setting, and honest watch-outs.

   Nothing here replaces the existing engine; every piece wraps
   what is already there and falls back to it on any error.
   ============================================================ */
window.DISHA_ELITE = (function () {
  "use strict";

  var L = function (lang, en, hi) { return lang === "hi" && hi ? hi : en; };

  /* ================================================================
     1. WHO IS SITTING THE PAPER
     Board, setting and learner type are inferred from what the
     student already gave us at sign-up (school name, city, class,
     stream). Nothing new is asked of them. An administrator can
     override any of it from the console.
     ================================================================ */

  var PROFILE_KEY = "disha.elite.profile";

  var BOARDS = [
    { id: "kv",       label: "Kendriya Vidyalaya (CBSE)",      board: "CBSE",
      match: ["kendriya", "kv "] },
    { id: "jnv",      label: "Jawahar Navodaya Vidyalaya",     board: "CBSE",
      match: ["navodaya", "jnv"] },
    { id: "sainik",   label: "Sainik / Military School",       board: "CBSE",
      match: ["sainik", "military school", "rashtriya indian military"] },
    { id: "ib",       label: "IB World School",                board: "IB",
      match: ["international baccalaureate", " ib ", "ib school", "world school"] },
    { id: "cambridge",label: "Cambridge / IGCSE School",       board: "Cambridge",
      match: ["cambridge", "igcse", "a-level", "a level"] },
    { id: "intl",     label: "International School",           board: "International",
      match: ["international"] },
    { id: "icse",     label: "ICSE / ISC School",              board: "ICSE",
      match: ["icse", "isc ", "convent", "st. ", "st ", "saint "] },
    { id: "madrasa",  label: "Madrasa / Minority Institution", board: "Board / Madrasa Board",
      match: ["madrasa", "madarsa", "maktab", "islamia"] },
    { id: "gurukul",  label: "Gurukul / Vidya Mandir",         board: "State / Sanskrit Board",
      match: ["gurukul", "vidya mandir", "shishu mandir", "veda"] },
    { id: "nios",     label: "Open school (NIOS / State Open)",board: "NIOS",
      match: ["nios", "open school", "open schooling", "distance"] },
    { id: "iti",      label: "ITI / Polytechnic / Skill centre",board: "NCVT / SCVT",
      match: ["iti", "industrial training", "polytechnic", "skill", "itc "] },
    { id: "govt",     label: "Government / Zilla Parishad school", board: "State Board",
      match: ["government", "govt", "zilla", "zp ", "panchayat", "municipal",
              "sarkari", "residential school", "ashram shala", "eklavya"] },
    { id: "private",  label: "Private / Public school",        board: "CBSE / State Board",
      match: ["public school", "academy", "vidyalaya", "high school", "school"] }
  ];

  var METROS = ["mumbai", "delhi", "new delhi", "bengaluru", "bangalore", "hyderabad",
    "chennai", "kolkata", "pune", "ahmedabad", "surat", "jaipur", "lucknow",
    "gurugram", "gurgaon", "noida", "thane", "navi mumbai", "dubai", "abu dhabi",
    "sharjah", "kathmandu", "johannesburg", "cape town", "pretoria", "durban"];

  var TIER2 = ["nagpur", "indore", "bhopal", "patna", "kanpur", "nashik", "coimbatore",
    "kochi", "cochin", "visakhapatnam", "vijayawada", "madurai", "trichy", "mysuru",
    "mysore", "hubli", "belagavi", "mangaluru", "rajkot", "vadodara", "ludhiana",
    "amritsar", "chandigarh", "dehradun", "ranchi", "raipur", "guwahati", "bhubaneswar",
    "cuttack", "varanasi", "prayagraj", "allahabad", "agra", "meerut", "jodhpur",
    "udaipur", "kota", "pokhara", "al ain", "ajman", "port elizabeth", "bloemfontein"];

  function lower(s) { return String(s || "").toLowerCase(); }

  function inferBoard(school) {
    var s = " " + lower(school) + " ";
    for (var i = 0; i < BOARDS.length; i++) {
      var b = BOARDS[i];
      for (var j = 0; j < b.match.length; j++) {
        if (s.indexOf(b.match[j]) > -1) return b;
      }
    }
    return { id: "unknown", label: "School", board: "Board not declared", match: [] };
  }

  function inferSetting(city) {
    var c = lower(city).trim();
    if (!c) return "unknown";
    for (var i = 0; i < METROS.length; i++) if (c.indexOf(METROS[i]) > -1) return "metro";
    for (var k = 0; k < TIER2.length; k++) if (c.indexOf(TIER2[k]) > -1) return "semi-urban";
    return "district";        /* district town or rural — treated as the same equity band */
  }

  /* learner type decides what the report should lead with */
  function inferLearner(user, board) {
    var klass = String((user && user.klass) || "");
    var stream = String((user && user.stream) || "");
    if (board.id === "iti" || /Vocational/i.test(stream)) return "vocational";
    if (board.id === "nios") return "open";
    if (/Passed/i.test(klass)) return "repeater";
    if (board.id === "ib" || board.id === "cambridge" || board.id === "intl") return "international";
    if (board.id === "sainik") return "defence-track";
    return "mainstream";
  }

  function overrides() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch (e) { return {}; }
  }
  function setOverride(userId, patch) {
    var all = overrides();
    all[userId] = Object.assign({}, all[userId] || {}, patch || {});
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(all)); } catch (e) {}
    return all[userId];
  }

  function profile(user) {
    user = user || window.__dishaUser || {};
    var board = inferBoard(user.school);
    var p = {
      id: user.id || "anon",
      name: user.name || "",
      klass: user.klass || "",
      stream: user.stream || "",
      school: user.school || "",
      city: user.city || "",
      boardId: board.id,
      boardLabel: board.label,
      board: board.board,
      setting: inferSetting(user.city),
      learner: inferLearner(user, board)
    };
    var o = overrides()[p.id];
    if (o) p = Object.assign(p, o);
    return p;
  }

  /* ================================================================
     2. APTITUDE BANK — SAT / CUET level
     Item shape matches the app's own bank exactly:
       { dim:1, apt:"num|log|verb|spa", q:{en,hi}, opts:[{en,hi,correct}] }
     Extra keys (topic, level, skew) are read only by this layer.
     level: "core"     — Class 8–10 sitting
            "advanced" — Class 11–12 / Passed 12, pitched at
                         CUET-UG General Test and SAT difficulty
     skew:  streams the item discriminates best for
     ================================================================ */

  var APT = [

    /* ---------------- NUMERICAL ---------------- */
    { dim: 1, apt: "num", topic: "apt-linear-eq", level: "advanced",
      q: { en: "If 3x + 7 = 2x + 15, what is the value of x?",
           hi: "यदि 3x + 7 = 2x + 15 है, तो x का मान क्या है?" },
      opts: [ { en: "4", hi: "4" }, { en: "8", hi: "8", correct: true },
              { en: "11", hi: "11" }, { en: "22", hi: "22" } ] },

    { dim: 1, apt: "num", topic: "apt-successive-pct", level: "advanced",
      q: { en: "A price is increased by 20% and then reduced by 20%. Compared with the original price, the final price is:",
           hi: "एक क़ीमत 20% बढ़ाई जाती है, फिर 20% घटाई जाती है। मूल क़ीमत की तुलना में अंतिम क़ीमत:" },
      opts: [ { en: "The same", hi: "वही रहती है" },
              { en: "4% lower", hi: "4% कम", correct: true },
              { en: "4% higher", hi: "4% अधिक" },
              { en: "20% lower", hi: "20% कम" } ] },

    { dim: 1, apt: "num", topic: "apt-average-removed", level: "advanced",
      q: { en: "The average of 5 numbers is 18. If the number 30 is removed, the average of the remaining 4 is:",
           hi: "5 संख्याओं का औसत 18 है। यदि संख्या 30 हटा दी जाए, तो शेष 4 का औसत होगा:" },
      opts: [ { en: "12", hi: "12" }, { en: "15", hi: "15", correct: true },
              { en: "16", hi: "16" }, { en: "18", hi: "18" } ] },

    { dim: 1, apt: "num", topic: "apt-train-pole", level: "advanced",
      q: { en: "A train 180 m long runs at 54 km/h. How long does it take to pass an electric pole?",
           hi: "180 मीटर लंबी रेलगाड़ी 54 किमी/घंटा से चलती है। बिजली के खंभे को पार करने में कितना समय लगेगा?" },
      opts: [ { en: "9 seconds", hi: "9 सेकंड" }, { en: "10 seconds", hi: "10 सेकंड" },
              { en: "12 seconds", hi: "12 सेकंड", correct: true }, { en: "15 seconds", hi: "15 सेकंड" } ] },

    { dim: 1, apt: "num", topic: "apt-ratio-diff", level: "core",
      q: { en: "Two numbers are in the ratio 5 : 7 and differ by 24. The smaller number is:",
           hi: "दो संख्याओं का अनुपात 5 : 7 है और उनका अंतर 24 है। छोटी संख्या है:" },
      opts: [ { en: "48", hi: "48" }, { en: "60", hi: "60", correct: true },
              { en: "72", hi: "72" }, { en: "84", hi: "84" } ] },

    { dim: 1, apt: "num", topic: "apt-compound-interest", level: "advanced",
      q: { en: "₹10,000 is invested at 10% per year, compounded annually. The amount after 2 years is:",
           hi: "₹10,000 प्रति वर्ष 10% चक्रवृद्धि ब्याज पर लगाए जाते हैं। 2 वर्ष बाद राशि होगी:" },
      opts: [ { en: "₹11,000", hi: "₹11,000" }, { en: "₹12,000", hi: "₹12,000" },
              { en: "₹12,100", hi: "₹12,100", correct: true }, { en: "₹12,210", hi: "₹12,210" } ] },

    { dim: 1, apt: "num", topic: "apt-work-together", level: "advanced",
      q: { en: "A can finish a job in 12 days and B in 6 days. Working together, they finish it in:",
           hi: "A एक काम 12 दिन में और B 6 दिन में पूरा करता है। साथ काम करने पर वे इसे पूरा करेंगे:" },
      opts: [ { en: "3 days", hi: "3 दिन" }, { en: "4 days", hi: "4 दिन", correct: true },
              { en: "6 days", hi: "6 दिन" }, { en: "9 days", hi: "9 दिन" } ] },

    { dim: 1, apt: "num", topic: "apt-quadratic-roots", level: "advanced",
      q: { en: "The roots of x² − 5x + 6 = 0 are:",
           hi: "x² − 5x + 6 = 0 के मूल हैं:" },
      opts: [ { en: "1 and 6", hi: "1 और 6" }, { en: "2 and 3", hi: "2 और 3", correct: true },
              { en: "−2 and −3", hi: "−2 और −3" }, { en: "5 and 6", hi: "5 और 6" } ] },

    { dim: 1, apt: "num", topic: "apt-weighted-pct", level: "core",
      q: { en: "A student scores 68, 72, 80 and 60 out of 100 in four subjects. The overall percentage is:",
           hi: "एक विद्यार्थी चार विषयों में 100 में से 68, 72, 80 और 60 अंक पाता है। कुल प्रतिशत है:" },
      opts: [ { en: "68%", hi: "68%" }, { en: "70%", hi: "70%", correct: true },
              { en: "72%", hi: "72%" }, { en: "75%", hi: "75%" } ] },

    { dim: 1, apt: "num", topic: "apt-probability-die", level: "advanced",
      q: { en: "A fair die is rolled once. The probability of getting a prime number is:",
           hi: "एक निष्पक्ष पासा एक बार फेंका जाता है। अभाज्य संख्या आने की प्रायिकता है:" },
      opts: [ { en: "1/3", hi: "1/3" }, { en: "1/2", hi: "1/2", correct: true },
              { en: "2/3", hi: "2/3" }, { en: "5/6", hi: "5/6" } ] },

    { dim: 1, apt: "num", topic: "apt-area-scaling", level: "core",
      q: { en: "If the radius of a circle is doubled, its area becomes:",
           hi: "यदि किसी वृत्त की त्रिज्या दोगुनी कर दी जाए, तो उसका क्षेत्रफल हो जाता है:" },
      opts: [ { en: "2 times", hi: "2 गुना" }, { en: "3 times", hi: "3 गुना" },
              { en: "4 times", hi: "4 गुना", correct: true }, { en: "8 times", hi: "8 गुना" } ] },

    { dim: 1, apt: "num", topic: "apt-average-speed", level: "advanced",
      q: { en: "A car covers 90 km at 45 km/h and the next 60 km at 60 km/h. Its average speed for the whole trip is:",
           hi: "एक कार 90 किमी 45 किमी/घंटा से और अगले 60 किमी 60 किमी/घंटा से तय करती है। पूरी यात्रा की औसत चाल है:" },
      opts: [ { en: "50 km/h", hi: "50 किमी/घंटा", correct: true }, { en: "52.5 km/h", hi: "52.5 किमी/घंटा" },
              { en: "54 km/h", hi: "54 किमी/घंटा" }, { en: "55 km/h", hi: "55 किमी/घंटा" } ] },

    { dim: 1, apt: "num", topic: "apt-data-growth", level: "advanced",
      q: { en: "A shop's sales rose from ₹40 lakh in 2024 to ₹50 lakh in 2025. The percentage increase is:",
           hi: "एक दुकान की बिक्री 2024 में ₹40 लाख से बढ़कर 2025 में ₹50 लाख हो गई। प्रतिशत वृद्धि है:" },
      opts: [ { en: "10%", hi: "10%" }, { en: "20%", hi: "20%" },
              { en: "25%", hi: "25%", correct: true }, { en: "50%", hi: "50%" } ] },

    { dim: 1, apt: "num", topic: "apt-unitary-scale", level: "core",
      q: { en: "If 6 workers build a wall in 10 days, how long will 15 workers take, working at the same rate?",
           hi: "यदि 6 मज़दूर एक दीवार 10 दिन में बनाते हैं, तो उसी दर से 15 मज़दूर कितने दिन लेंगे?" },
      opts: [ { en: "3 days", hi: "3 दिन" }, { en: "4 days", hi: "4 दिन", correct: true },
              { en: "5 days", hi: "5 दिन" }, { en: "6 days", hi: "6 दिन" } ] },

    /* ---------------- LOGICAL ---------------- */
    { dim: 1, apt: "log", topic: "apt-coding-shift", level: "advanced",
      q: { en: "If FLOWER is written as GMPXFS, how is GARDEN written in the same code?",
           hi: "यदि FLOWER को GMPXFS लिखा जाता है, तो उसी कोड में GARDEN कैसे लिखा जाएगा?" },
      opts: [ { en: "HBSEFO", hi: "HBSEFO", correct: true }, { en: "HBSFEO", hi: "HBSFEO" },
              { en: "FZQCDM", hi: "FZQCDM" }, { en: "HBTEFO", hi: "HBTEFO" } ] },

    { dim: 1, apt: "log", topic: "apt-blood-relation", level: "advanced",
      q: { en: "Ravi says, \"She is the daughter of my grandfather's only son.\" Who is she to Ravi?",
           hi: "रवि कहता है, \"वह मेरे दादा के इकलौते पुत्र की पुत्री है।\" वह रवि की कौन है?" },
      opts: [ { en: "His cousin", hi: "उसकी चचेरी बहन" }, { en: "His sister", hi: "उसकी बहन", correct: true },
              { en: "His aunt", hi: "उसकी बुआ" }, { en: "His niece", hi: "उसकी भतीजी" } ] },

    { dim: 1, apt: "log", topic: "apt-syllogism", level: "advanced",
      q: { en: "All engineers are graduates. Some graduates are teachers. Which conclusion definitely follows?",
           hi: "सभी इंजीनियर स्नातक हैं। कुछ स्नातक शिक्षक हैं। कौन-सा निष्कर्ष निश्चित रूप से निकलता है?" },
      opts: [ { en: "Some engineers are teachers", hi: "कुछ इंजीनियर शिक्षक हैं" },
              { en: "All teachers are graduates", hi: "सभी शिक्षक स्नातक हैं" },
              { en: "No engineer is a teacher", hi: "कोई इंजीनियर शिक्षक नहीं है" },
              { en: "None of these follows for certain", hi: "इनमें से कोई भी निश्चित नहीं", correct: true } ] },

    { dim: 1, apt: "log", topic: "apt-series-square", level: "advanced",
      q: { en: "Find the next term: 2, 5, 10, 17, 26, …",
           hi: "अगला पद बताइए: 2, 5, 10, 17, 26, …" },
      opts: [ { en: "35", hi: "35" }, { en: "36", hi: "36" },
              { en: "37", hi: "37", correct: true }, { en: "38", hi: "38" } ] },

    { dim: 1, apt: "log", topic: "apt-odd-square", level: "core",
      q: { en: "Which one does not belong with the others: 121, 144, 169, 180?",
           hi: "इनमें कौन-सी संख्या बाक़ी से मेल नहीं खाती: 121, 144, 169, 180?" },
      opts: [ { en: "121", hi: "121" }, { en: "144", hi: "144" },
              { en: "169", hi: "169" }, { en: "180", hi: "180", correct: true } ] },

    { dim: 1, apt: "log", topic: "apt-direction", level: "core",
      q: { en: "You walk 5 km north, then 3 km east, then 5 km south. Where are you now, relative to the start?",
           hi: "आप 5 किमी उत्तर, फिर 3 किमी पूर्व, फिर 5 किमी दक्षिण चलते हैं। अब आप शुरुआत से कहाँ हैं?" },
      opts: [ { en: "3 km east", hi: "3 किमी पूर्व", correct: true }, { en: "3 km west", hi: "3 किमी पश्चिम" },
              { en: "5 km north", hi: "5 किमी उत्तर" }, { en: "Back at the start", hi: "वापस शुरुआत पर" } ] },

    { dim: 1, apt: "log", topic: "apt-venn-neither", level: "advanced",
      q: { en: "In a class of 40, 25 play cricket, 20 play football and 10 play both. How many play neither?",
           hi: "40 विद्यार्थियों की कक्षा में 25 क्रिकेट, 20 फ़ुटबॉल और 10 दोनों खेलते हैं। कितने कोई भी नहीं खेलते?" },
      opts: [ { en: "0", hi: "0" }, { en: "5", hi: "5", correct: true },
              { en: "10", hi: "10" }, { en: "15", hi: "15" } ] },

    { dim: 1, apt: "log", topic: "apt-clock-angle", level: "advanced",
      q: { en: "What is the angle between the hour and minute hands of a clock at 3:30?",
           hi: "3:30 बजे घड़ी की घंटे और मिनट की सुइयों के बीच कोण कितना है?" },
      opts: [ { en: "60°", hi: "60°" }, { en: "75°", hi: "75°", correct: true },
              { en: "90°", hi: "90°" }, { en: "105°", hi: "105°" } ] },

    { dim: 1, apt: "log", topic: "apt-analogy-function", level: "core",
      q: { en: "Bird is to Nest as Bee is to —",
           hi: "पक्षी का संबंध घोंसले से है, वैसे ही मधुमक्खी का संबंध — से है" },
      opts: [ { en: "Flower", hi: "फूल" }, { en: "Honey", hi: "शहद" },
              { en: "Hive", hi: "छत्ता", correct: true }, { en: "Garden", hi: "बग़ीचा" } ] },

    { dim: 1, apt: "log", topic: "apt-ordering", level: "core",
      q: { en: "A is taller than B. C is shorter than B. D is taller than A. Who is the tallest?",
           hi: "A, B से लंबा है। C, B से छोटा है। D, A से लंबा है। सबसे लंबा कौन है?" },
      opts: [ { en: "A", hi: "A" }, { en: "B", hi: "B" },
              { en: "C", hi: "C" }, { en: "D", hi: "D", correct: true } ] },

    { dim: 1, apt: "log", topic: "apt-assumption", level: "advanced",
      q: { en: "A school notice says: \"Bring your own water bottle to the picnic.\" What is the school assuming?",
           hi: "स्कूल की सूचना: \"पिकनिक पर अपनी पानी की बोतल लाएँ।\" स्कूल क्या मान रहा है?" },
      opts: [ { en: "Drinking water may not be easily available there",
               hi: "वहाँ पीने का पानी आसानी से उपलब्ध नहीं हो सकता", correct: true },
              { en: "Students dislike the school's water", hi: "विद्यार्थियों को स्कूल का पानी पसंद नहीं" },
              { en: "The picnic will be cancelled", hi: "पिकनिक रद्द हो जाएगी" },
              { en: "Bottles are cheaper than tanks", hi: "बोतलें टंकियों से सस्ती हैं" } ] },

    { dim: 1, apt: "log", topic: "apt-data-sufficiency", level: "advanced",
      q: { en: "To find Meena's age, is this enough? (i) She is 4 years older than her brother. (ii) Her brother is 11.",
           hi: "मीना की आयु ज्ञात करने के लिए क्या यह पर्याप्त है? (i) वह अपने भाई से 4 वर्ष बड़ी है। (ii) उसका भाई 11 वर्ष का है।" },
      opts: [ { en: "(i) alone is enough", hi: "केवल (i) पर्याप्त है" },
              { en: "(ii) alone is enough", hi: "केवल (ii) पर्याप्त है" },
              { en: "Both together are needed", hi: "दोनों मिलकर आवश्यक हैं", correct: true },
              { en: "Even both are not enough", hi: "दोनों मिलकर भी पर्याप्त नहीं" } ] },

    { dim: 1, apt: "log", topic: "apt-alpha-series", level: "advanced",
      q: { en: "Find the next term: AZ, BY, CX, DW, …",
           hi: "अगला पद बताइए: AZ, BY, CX, DW, …" },
      opts: [ { en: "EV", hi: "EV", correct: true }, { en: "EW", hi: "EW" },
              { en: "FV", hi: "FV" }, { en: "DV", hi: "DV" } ] },

    { dim: 1, apt: "log", topic: "apt-conclusion-data", level: "advanced",
      q: { en: "In a village, 80% of families own a phone and 30% own a computer. What must be true?",
           hi: "एक गाँव में 80% परिवारों के पास फ़ोन और 30% के पास कंप्यूटर है। क्या अवश्य सत्य है?" },
      opts: [ { en: "At least 10% own both", hi: "कम से कम 10% के पास दोनों हैं", correct: true },
              { en: "Exactly 30% own both", hi: "ठीक 30% के पास दोनों हैं" },
              { en: "No family owns both", hi: "किसी परिवार के पास दोनों नहीं" },
              { en: "50% own only a phone", hi: "50% के पास केवल फ़ोन है" } ] },

    /* ---------------- VERBAL ---------------- */
    { dim: 1, apt: "verb", topic: "apt-analogy-opposite", level: "advanced",
      q: { en: "EPHEMERAL is to PERMANENT as OPAQUE is to —",
           hi: "EPHEMERAL (क्षणिक) का संबंध PERMANENT (स्थायी) से है, वैसे ही OPAQUE (अपारदर्शी) का संबंध — से है" },
      opts: [ { en: "Transparent", hi: "पारदर्शी", correct: true }, { en: "Dense", hi: "घना" },
              { en: "Coloured", hi: "रंगीन" }, { en: "Solid", hi: "ठोस" } ] },

    { dim: 1, apt: "verb", topic: "apt-word-context", level: "advanced",
      q: { en: "\"The committee's response to the proposal was tepid.\" Here, tepid most nearly means:",
           hi: "\"प्रस्ताव पर समिति की प्रतिक्रिया tepid थी।\" यहाँ tepid का निकटतम अर्थ है:" },
      opts: [ { en: "Unenthusiastic", hi: "उत्साहहीन", correct: true }, { en: "Hostile", hi: "शत्रुतापूर्ण" },
              { en: "Immediate", hi: "तत्काल" }, { en: "Warm and welcoming", hi: "गर्मजोशी भरा" } ] },

    { dim: 1, apt: "verb", topic: "apt-subject-verb", level: "advanced",
      q: { en: "Choose the correct sentence.",
           hi: "सही वाक्य चुनिए।" },
      opts: [ { en: "Neither of the students have submitted the form.",
               hi: "Neither of the students have submitted the form." },
              { en: "Neither of the students has submitted the form.",
               hi: "Neither of the students has submitted the form.", correct: true },
              { en: "Neither of the student have submitted the form.",
               hi: "Neither of the student have submitted the form." },
              { en: "Neither of the students having submitted the form.",
               hi: "Neither of the students having submitted the form." } ] },

    { dim: 1, apt: "verb", topic: "apt-inference-passage", level: "advanced",
      q: { en: "\"Although the village had no library, almost every child could name three books they had read.\" What does this most suggest?",
           hi: "\"हालाँकि गाँव में कोई पुस्तकालय नहीं था, फिर भी लगभग हर बच्चा तीन पढ़ी हुई पुस्तकों के नाम बता सकता था।\" इससे सबसे अधिक क्या संकेत मिलता है?" },
      opts: [ { en: "Books reached the children by some other route",
               hi: "पुस्तकें बच्चों तक किसी अन्य माध्यम से पहुँचीं", correct: true },
              { en: "The children were exaggerating", hi: "बच्चे बढ़ा-चढ़ाकर बता रहे थे" },
              { en: "Libraries are unnecessary", hi: "पुस्तकालय अनावश्यक हैं" },
              { en: "The village was wealthy", hi: "गाँव संपन्न था" } ] },

    { dim: 1, apt: "verb", topic: "apt-synonym-meticulous", level: "core",
      q: { en: "METICULOUS most nearly means:",
           hi: "METICULOUS का निकटतम अर्थ है:" },
      opts: [ { en: "Very careful about detail", hi: "विवरण के प्रति अत्यंत सावधान", correct: true },
              { en: "Quick and rough", hi: "जल्दबाज़ और मोटा-मोटी" },
              { en: "Unwilling", hi: "अनिच्छुक" }, { en: "Generous", hi: "उदार" } ] },

    { dim: 1, apt: "verb", topic: "apt-antonym-candid", level: "advanced",
      q: { en: "The opposite of CANDID is:",
           hi: "CANDID (स्पष्टवादी) का विलोम है:" },
      opts: [ { en: "Honest", hi: "ईमानदार" }, { en: "Evasive", hi: "टालमटोल करने वाला", correct: true },
              { en: "Blunt", hi: "बेबाक" }, { en: "Cheerful", hi: "प्रसन्न" } ] },

    { dim: 1, apt: "verb", topic: "apt-sentence-completion", level: "advanced",
      q: { en: "Although the evidence was ______, the team's conclusion was stated as ______.",
           hi: "यद्यपि प्रमाण ______ थे, फिर भी टीम का निष्कर्ष ______ रूप में कहा गया।" },
      opts: [ { en: "scanty … tentative", hi: "अल्प … अनंतिम", correct: true },
              { en: "abundant … doubtful", hi: "प्रचुर … संदिग्ध" },
              { en: "scanty … certain", hi: "अल्प … निश्चित" },
              { en: "clear … obvious", hi: "स्पष्ट … सुस्पष्ट" } ] },

    { dim: 1, apt: "verb", topic: "apt-para-order", level: "advanced",
      q: { en: "Arrange into a paragraph: (1) It then spread to nearby districts. (2) The scheme began in one block. (3) Today it runs in the whole state.",
           hi: "अनुच्छेद के क्रम में रखें: (1) फिर यह आस-पास के ज़िलों में फैली। (2) योजना एक ब्लॉक में शुरू हुई। (3) आज यह पूरे राज्य में चलती है।" },
      opts: [ { en: "2 – 1 – 3", hi: "2 – 1 – 3", correct: true }, { en: "1 – 2 – 3", hi: "1 – 2 – 3" },
              { en: "3 – 2 – 1", hi: "3 – 2 – 1" }, { en: "2 – 3 – 1", hi: "2 – 3 – 1" } ] },

    { dim: 1, apt: "verb", topic: "apt-idiom", level: "core",
      q: { en: "\"She decided to turn over a new leaf.\" This means she decided to:",
           hi: "\"उसने turn over a new leaf करने का निश्चय किया।\" इसका अर्थ है उसने निश्चय किया:" },
      opts: [ { en: "Start behaving differently and better", hi: "अलग और बेहतर तरीक़े से चलना", correct: true },
              { en: "Read a new book", hi: "नई किताब पढ़ना" },
              { en: "Move to a new town", hi: "नए शहर जाना" },
              { en: "Plant a tree", hi: "पेड़ लगाना" } ] },

    { dim: 1, apt: "verb", topic: "apt-argument-flaw", level: "advanced",
      q: { en: "\"Every successful shopkeeper I know wakes early. So waking early makes people successful.\" The weakness in this argument is that it:",
           hi: "\"मैं जिन सफल दुकानदारों को जानता हूँ, वे जल्दी उठते हैं। इसलिए जल्दी उठना लोगों को सफल बनाता है।\" इस तर्क की कमज़ोरी है कि यह:" },
      opts: [ { en: "Treats a pattern as a cause", hi: "एक प्रवृत्ति को कारण मान लेता है", correct: true },
              { en: "Uses too many examples", hi: "बहुत अधिक उदाहरण देता है" },
              { en: "Is about shopkeepers only", hi: "केवल दुकानदारों की बात करता है" },
              { en: "Does not define success", hi: "सफलता की परिभाषा नहीं देता" } ] },

    /* ---------------- SPATIAL ---------------- */
    { dim: 1, apt: "spa", topic: "apt-dice-opposite", level: "core",
      q: { en: "On a standard die, opposite faces add up to 7. If the top face shows 3, the bottom face shows:",
           hi: "एक सामान्य पासे में सामने-सामने के फलकों का योग 7 होता है। यदि ऊपरी फलक 3 दिखाता है, तो निचला फलक होगा:" },
      opts: [ { en: "2", hi: "2" }, { en: "4", hi: "4", correct: true },
              { en: "5", hi: "5" }, { en: "6", hi: "6" } ] },

    { dim: 1, apt: "spa", topic: "apt-painted-cube", level: "advanced",
      q: { en: "A 3 × 3 × 3 cube is painted on all outer faces, then cut into 27 unit cubes. How many unit cubes have exactly two painted faces?",
           hi: "3 × 3 × 3 घन के सभी बाहरी फलक रंगे जाते हैं, फिर उसे 27 इकाई घनों में काटा जाता है। कितने इकाई घनों के ठीक दो फलक रंगे हैं?" },
      opts: [ { en: "6", hi: "6" }, { en: "8", hi: "8" },
              { en: "12", hi: "12", correct: true }, { en: "18", hi: "18" } ] },

    { dim: 1, apt: "spa", topic: "apt-cone-section", level: "advanced",
      q: { en: "A solid cone is cut by a plane parallel to its base. The shape of the cut surface is:",
           hi: "एक ठोस शंकु को उसके आधार के समांतर तल से काटा जाता है। कटे हुए तल का आकार होगा:" },
      opts: [ { en: "A triangle", hi: "त्रिभुज" }, { en: "A circle", hi: "वृत्त", correct: true },
              { en: "An ellipse", hi: "दीर्घवृत्त" }, { en: "A parabola", hi: "परवलय" } ] },

    { dim: 1, apt: "spa", topic: "apt-fold-punch-two", level: "advanced",
      q: { en: "A square sheet is folded in half, then in half again, and one hole is punched through all layers. When unfolded, how many holes are there?",
           hi: "एक चौकोर काग़ज़ को आधा, फिर दोबारा आधा मोड़ा जाता है और सभी परतों में एक छेद किया जाता है। खोलने पर कितने छेद होंगे?" },
      opts: [ { en: "2", hi: "2" }, { en: "3", hi: "3" },
              { en: "4", hi: "4", correct: true }, { en: "8", hi: "8" } ] },

    { dim: 1, apt: "spa", topic: "apt-rotation-clock", level: "core",
      q: { en: "An arrow points north. It is rotated 90° clockwise, then 180°. Which way does it point now?",
           hi: "एक तीर उत्तर की ओर है। उसे 90° दक्षिणावर्त, फिर 180° घुमाया जाता है। अब वह किस ओर है?" },
      opts: [ { en: "North", hi: "उत्तर" }, { en: "East", hi: "पूर्व" },
              { en: "South", hi: "दक्षिण" }, { en: "West", hi: "पश्चिम", correct: true } ] },

    { dim: 1, apt: "spa", topic: "apt-mirror-word", level: "core",
      q: { en: "Held in front of a mirror, which of these words looks unchanged (each letter written in simple block capitals, one below the other)?",
           hi: "दर्पण के सामने रखने पर इनमें से कौन-सा शब्द अपरिवर्तित दिखेगा (सरल बड़े अक्षरों में, एक के नीचे एक लिखा हुआ)?" },
      opts: [ { en: "TOMATO", hi: "TOMATO", correct: true }, { en: "GARDEN", hi: "GARDEN" },
              { en: "PENCIL", hi: "PENCIL" }, { en: "BRIDGE", hi: "BRIDGE" } ] },

    { dim: 1, apt: "spa", topic: "apt-net-cube", level: "advanced",
      q: { en: "A cube net is laid flat as a cross of six squares. When folded, how many pairs of faces end up opposite each other?",
           hi: "छह वर्गों वाला घन का जाल क्रॉस के आकार में बिछा है। मोड़ने पर कितने जोड़े फलक आमने-सामने आते हैं?" },
      opts: [ { en: "2", hi: "2" }, { en: "3", hi: "3", correct: true },
              { en: "4", hi: "4" }, { en: "6", hi: "6" } ] },

    { dim: 1, apt: "spa", topic: "apt-top-view", level: "core",
      q: { en: "A closed cylinder stands upright on a table. Seen from directly above, it looks like:",
           hi: "एक बंद बेलन मेज़ पर सीधा खड़ा है। ठीक ऊपर से देखने पर वह दिखेगा:" },
      opts: [ { en: "A rectangle", hi: "आयत" }, { en: "A circle", hi: "वृत्त", correct: true },
              { en: "A triangle", hi: "त्रिभुज" }, { en: "An oval", hi: "अंडाकार" } ] },

    { dim: 1, apt: "spa", topic: "apt-map-scale", level: "advanced",
      q: { en: "On a map, 1 cm represents 4 km. Two towns are 7.5 cm apart on the map. The real distance is:",
           hi: "एक मानचित्र पर 1 सेमी = 4 किमी। दो क़स्बे मानचित्र पर 7.5 सेमी दूर हैं। वास्तविक दूरी है:" },
      opts: [ { en: "24 km", hi: "24 किमी" }, { en: "28 km", hi: "28 किमी" },
              { en: "30 km", hi: "30 किमी", correct: true }, { en: "32 km", hi: "32 किमी" } ] },

    { dim: 1, apt: "spa", topic: "apt-volume-fill", level: "advanced",
      q: { en: "A tank 2 m × 1 m × 0.5 m is filled to the brim. How many litres does it hold?",
           hi: "2 मी × 1 मी × 0.5 मी की एक टंकी पूरी भरी है। उसमें कितने लीटर पानी आएगा?" },
      opts: [ { en: "100 litres", hi: "100 लीटर" }, { en: "500 litres", hi: "500 लीटर" },
              { en: "1000 litres", hi: "1000 लीटर", correct: true }, { en: "2000 litres", hi: "2000 लीटर" } ] }
  ];

  /* ================================================================
     3. STREAM-ADAPTIVE ITEMS
     Once a student has declared a stream, the paper stops asking
     "which stream?" and starts asking "where inside it, and are you
     sure?". Every item carries:
        streams  — the declared streams it is served to
        role     — "deepen" (which path inside the stream)
                   "counter" (does the choice actually fit?)
     Items with streams:"*" are served to everyone.
     ================================================================ */

  var SCI_ALL   = ["Science (PCM)", "Science (PCB)", "Science (PCMB)"];
  var COM_ALL   = ["Commerce (with Maths)", "Commerce (without Maths)"];
  var PCM       = ["Science (PCM)", "Science (PCMB)"];
  var PCB       = ["Science (PCB)", "Science (PCMB)"];

  var STREAM_ITEMS = [

    /* ---------- Science (PCM) : deepen ---------- */
    { dim: 0, topic: "pcm-build-vs-prove", streams: PCM, role: "deepen",
      q: { en: "You have a whole week free and full marks are guaranteed either way. Which would you actually choose?",
           hi: "आपके पास पूरा एक सप्ताह ख़ाली है और दोनों में पूरे अंक पक्के हैं। आप वास्तव में क्या चुनेंगे?" },
      opts: [
        { en: "Build a working machine or circuit", hi: "एक चालू मशीन या सर्किट बनाना", tag: { P: 2, I: 1 }, sub: { eng: 3, trade: 1 } },
        { en: "Prove a result nobody in class could", hi: "ऐसा प्रमेय सिद्ध करना जो कक्षा में कोई न कर सका", tag: { I: 2 }, sub: { sci: 3, math: 3 } },
        { en: "Write software that solves a real problem", hi: "वास्तविक समस्या हल करने वाला सॉफ़्टवेयर लिखना", tag: { I: 2, P: 1 }, sub: { it: 3, math: 1 } },
        { en: "Design a building or product and model it", hi: "इमारत या उत्पाद डिज़ाइन कर उसका मॉडल बनाना", tag: { A: 2, P: 1 }, sub: { design: 3, eng: 1 } } ] },

    { dim: 0, topic: "pcm-failure-response", streams: PCM, role: "deepen",
      q: { en: "Your design fails on the third attempt. What happens next in your head?",
           hi: "आपका डिज़ाइन तीसरी बार भी विफल हो जाता है। आपके मन में आगे क्या चलता है?" },
      opts: [
        { en: "Take it apart and test each part", hi: "उसे खोलकर हर हिस्से की जाँच करना", tag: { I: 2, P: 1 }, sub: { eng: 3, sci: 1 } },
        { en: "Go back to the maths and check the model", hi: "गणित पर लौटकर मॉडल जाँचना", tag: { I: 2 }, sub: { math: 3, sci: 2 } },
        { en: "Rewrite the code and log everything", hi: "कोड दोबारा लिखना और सब कुछ लॉग करना", tag: { I: 2 }, sub: { it: 3 } },
        { en: "Rethink the whole approach from scratch", hi: "पूरे तरीक़े पर नए सिरे से सोचना", tag: { A: 2, E: 1 }, sub: { design: 2, mgmt: 1 } } ] },

    { dim: 0, topic: "pcm-scale-of-work", streams: PCM, role: "deepen",
      q: { en: "Which of these would you rather your name be attached to in ten years?",
           hi: "दस साल बाद इनमें से किससे आपका नाम जुड़ा हो, यह आप ज़्यादा चाहेंगे?" },
      opts: [
        { en: "A bridge, plant or highway that people use daily", hi: "पुल, संयंत्र या राजमार्ग जिसे लोग रोज़ इस्तेमाल करें", tag: { P: 2, O: 1 }, sub: { eng: 3 } },
        { en: "A paper that changes how a problem is understood", hi: "एक शोध-पत्र जो समस्या की समझ बदल दे", tag: { I: 3 }, sub: { sci: 3, math: 2 } },
        { en: "An app or platform used by lakhs of people", hi: "एक ऐप या प्लेटफ़ॉर्म जिसे लाखों लोग उपयोग करें", tag: { I: 2, E: 2 }, sub: { it: 3, mgmt: 1 } },
        { en: "A company you built yourself", hi: "एक कंपनी जो आपने ख़ुद खड़ी की", tag: { E: 3 }, sub: { mgmt: 3, com: 2 } } ] },

    /* ---------- Science (PCB) : deepen ---------- */
    { dim: 0, topic: "pcb-patient-vs-bench", streams: PCB, role: "deepen",
      q: { en: "Same illness, two ways to fight it. Which work would you want to be doing?",
           hi: "एक ही बीमारी, लड़ने के दो तरीक़े। आप कौन-सा काम करना चाहेंगे?" },
      opts: [
        { en: "Treating the patients in front of me", hi: "अपने सामने के मरीज़ों का इलाज करना", tag: { S: 2, I: 1 }, sub: { med: 3, allied: 1 } },
        { en: "Finding the drug or test in a lab", hi: "प्रयोगशाला में दवा या जाँच खोजना", tag: { I: 3 }, sub: { biotech: 3, sci: 2 } },
        { en: "Running the ward, theatre or diagnostics that make treatment possible", hi: "वार्ड, ऑपरेशन थिएटर या जाँच सेवा चलाना जिससे इलाज संभव हो", tag: { O: 2, S: 1 }, sub: { allied: 3 } },
        { en: "Stopping it in the community before it spreads", hi: "समुदाय में फैलने से पहले रोकना", tag: { S: 2, O: 1 }, sub: { med: 2, socsci: 2 } } ] },

    { dim: 0, topic: "pcb-years-of-study", streams: PCB, role: "deepen",
      q: { en: "Be honest about the road, not the destination. Which length of training suits your life?",
           hi: "मंज़िल नहीं, रास्ते के बारे में सच बताइए। कितनी लंबी पढ़ाई आपके जीवन के अनुकूल है?" },
      opts: [
        { en: "9–11 years including specialisation — I can wait", hi: "विशेषज्ञता सहित 9–11 वर्ष — मैं रुक सकता/सकती हूँ", tag: { I: 2, O: 1 }, sub: { med: 3 } },
        { en: "4–5 years, then a clinical job", hi: "4–5 वर्ष, फिर नैदानिक नौकरी", tag: { S: 2, O: 1 }, sub: { allied: 3 } },
        { en: "3 years, then decide with a degree in hand", hi: "3 वर्ष, फिर डिग्री लेकर तय करना", tag: { I: 1, E: 1 }, sub: { bio: 2, biotech: 2 } },
        { en: "5 years but with animals and farms, not hospitals", hi: "5 वर्ष, पर अस्पताल नहीं — पशु और खेत", tag: { P: 1, I: 1 }, sub: { agri: 3, bio: 2 } } ] },

    { dim: 0, topic: "pcb-evidence-habit", streams: PCB, role: "deepen",
      q: { en: "A popular health claim is going around your area. What do you do about it?",
           hi: "आपके इलाक़े में स्वास्थ्य से जुड़ा एक प्रचलित दावा फैल रहा है। आप क्या करेंगे?" },
      opts: [
        { en: "Look for the study behind it", hi: "उसके पीछे का शोध खोजेंगे", tag: { I: 3 }, sub: { sci: 3, biotech: 2 } },
        { en: "Ask a doctor I trust", hi: "किसी विश्वसनीय डॉक्टर से पूछेंगे", tag: { S: 2 }, sub: { med: 2, allied: 2 } },
        { en: "Explain to my family why it may be wrong", hi: "परिवार को समझाएँगे कि यह ग़लत क्यों हो सकता है", tag: { S: 2, E: 1 }, sub: { teach: 2, socsci: 2 } },
        { en: "Test it myself if I can", hi: "यदि संभव हो तो ख़ुद जाँचेंगे", tag: { I: 2, P: 1 }, sub: { sci: 3 } } ] },

    /* ---------- Commerce : deepen ---------- */
    { dim: 0, topic: "com-numbers-vs-people", streams: COM_ALL, role: "deepen",
      q: { en: "A business is in trouble. Which part of fixing it would you want to own?",
           hi: "एक व्यवसाय मुश्किल में है। उसे ठीक करने का कौन-सा हिस्सा आप संभालना चाहेंगे?" },
      opts: [
        { en: "The books — find where the money is leaking", hi: "बहीखाते — देखें पैसा कहाँ रिस रहा है", tag: { O: 3 }, sub: { com: 3 } },
        { en: "The customers — win them back", hi: "ग्राहक — उन्हें वापस लाएँ", tag: { E: 3, S: 1 }, sub: { mgmt: 3 } },
        { en: "The data — find the pattern behind the fall", hi: "आँकड़े — गिरावट के पीछे का पैटर्न ढूँढें", tag: { I: 3 }, sub: { math: 3, it: 2, com: 1 } },
        { en: "The contracts and compliance", hi: "अनुबंध और अनुपालन", tag: { O: 2, I: 1 }, sub: { civil: 2, com: 2 } } ] },

    { dim: 0, topic: "com-risk-appetite", streams: COM_ALL, role: "deepen",
      q: { en: "You have ₹50,000 of your own money at 22. What are you most likely to do?",
           hi: "22 वर्ष की आयु में आपके पास अपने ₹50,000 हैं। आप सबसे अधिक क्या करेंगे?" },
      opts: [
        { en: "Put it in something safe and study for a qualification", hi: "सुरक्षित जगह रखेंगे और किसी योग्यता की पढ़ाई करेंगे", tag: { O: 3 }, sub: { com: 3, civil: 1 } },
        { en: "Start a small trading or service business", hi: "छोटा व्यापार या सेवा शुरू करेंगे", tag: { E: 3 }, sub: { mgmt: 2, trade: 2, com: 1 } },
        { en: "Invest it after reading up properly", hi: "ठीक से पढ़ने के बाद निवेश करेंगे", tag: { I: 2, O: 1 }, sub: { com: 3, math: 2 } },
        { en: "Spend it on a course that raises my earning", hi: "ऐसे कोर्स पर लगाएँगे जो कमाई बढ़ाए", tag: { I: 1, E: 1 }, sub: { it: 2, mgmt: 1 } } ] },

    { dim: 0, topic: "com-maths-tolerance", streams: ["Commerce (with Maths)"], role: "deepen",
      q: { en: "Commerce with Maths opens finance and analytics. How do you actually feel about heavy maths for three more years?",
           hi: "गणित सहित वाणिज्य वित्त और एनालिटिक्स के रास्ते खोलता है। तीन और वर्ष कठिन गणित के बारे में आप सच में क्या महसूस करते हैं?" },
      opts: [
        { en: "Good — it is the part I am best at", hi: "अच्छा — यही मेरा सबसे मज़बूत हिस्सा है", tag: { I: 3 }, sub: { math: 3, com: 2 } },
        { en: "Fine, if it leads to a strong qualification", hi: "ठीक है, यदि मज़बूत योग्यता मिले", tag: { O: 2 }, sub: { com: 3 } },
        { en: "I would rather work with people than numbers", hi: "मैं संख्याओं से ज़्यादा लोगों के साथ काम करना चाहूँगा/चाहूँगी", tag: { E: 2, S: 1 }, sub: { mgmt: 3 } },
        { en: "Honestly, it drains me", hi: "सच कहूँ तो यह मुझे थका देता है", tag: { A: 1 }, sub: { math: -3, com: -1, arts: 1 } } ] },

    /* ---------- Arts / Humanities : deepen ---------- */
    { dim: 0, topic: "arts-power-vs-page", streams: ["Arts / Humanities"], role: "deepen",
      q: { en: "You care about something wrong in your district. Which lever would you reach for?",
           hi: "आपके ज़िले में कुछ ग़लत हो रहा है और आप उसकी परवाह करते हैं। आप कौन-सा रास्ता अपनाएँगे?" },
      opts: [
        { en: "Get into the system and change it from inside", hi: "व्यवस्था में जाकर उसे भीतर से बदलेंगे", tag: { E: 2, O: 2 }, sub: { civil: 3 } },
        { en: "Take it to court", hi: "अदालत तक ले जाएँगे", tag: { I: 2, E: 1 }, sub: { civil: 3, arts: 1 } },
        { en: "Write about it until people cannot ignore it", hi: "तब तक लिखेंगे जब तक लोग अनदेखा न कर सकें", tag: { A: 3 }, sub: { arts: 3, design: 1 } },
        { en: "Work directly with the families affected", hi: "प्रभावित परिवारों के साथ सीधे काम करेंगे", tag: { S: 3 }, sub: { socsci: 3, psych: 2 } } ] },

    { dim: 0, topic: "arts-craft-vs-analysis", streams: ["Arts / Humanities"], role: "deepen",
      q: { en: "Which sentence describes your best work so far?",
           hi: "अब तक के आपके सर्वश्रेष्ठ काम का वर्णन कौन-सा वाक्य करता है?" },
      opts: [
        { en: "I made something people felt", hi: "मैंने कुछ ऐसा बनाया जिसे लोगों ने महसूस किया", tag: { A: 3 }, sub: { arts: 3, design: 2 } },
        { en: "I explained something people had not understood", hi: "मैंने कुछ ऐसा समझाया जो लोग समझ नहीं पाए थे", tag: { S: 2, I: 1 }, sub: { teach: 3, arts: 1 } },
        { en: "I argued a case and won it", hi: "मैंने एक पक्ष रखा और जीता", tag: { E: 2, I: 1 }, sub: { civil: 3 } },
        { en: "I organised people and it actually worked", hi: "मैंने लोगों को संगठित किया और वह चला", tag: { E: 3, O: 1 }, sub: { mgmt: 3, socsci: 1 } } ] },

    /* ---------- Vocational / ITI : deepen ---------- */
    { dim: 0, topic: "iti-employ-vs-own", streams: ["Vocational / ITI"], role: "deepen",
      q: { en: "Three years after your trade certificate, which situation would you call success?",
           hi: "अपने ट्रेड प्रमाणपत्र के तीन साल बाद, किस स्थिति को आप सफलता कहेंगे?" },
      opts: [
        { en: "A permanent technician post in a PSU or plant", hi: "किसी पीएसयू या संयंत्र में स्थायी तकनीशियन पद", tag: { O: 3, P: 1 }, sub: { trade: 3, eng: 1 } },
        { en: "My own shop or service unit with two helpers", hi: "दो सहायकों के साथ अपनी दुकान या सेवा इकाई", tag: { E: 3, P: 1 }, sub: { trade: 3, mgmt: 2 } },
        { en: "A diploma finished part-time, on the way to a degree", hi: "अंशकालिक डिप्लोमा पूरा, डिग्री की ओर बढ़ते हुए", tag: { I: 2, O: 1 }, sub: { eng: 3, trade: 1 } },
        { en: "Working abroad on a skilled-worker visa", hi: "कुशल कामगार वीज़ा पर विदेश में काम", tag: { P: 2, E: 1 }, sub: { trade: 3 } } ] },

    { dim: 0, topic: "iti-new-tech", streams: ["Vocational / ITI"], role: "deepen",
      q: { en: "Your trade is changing — electric vehicles, solar, automation. What is your instinct?",
           hi: "आपका ट्रेड बदल रहा है — इलेक्ट्रिक वाहन, सौर ऊर्जा, ऑटोमेशन। आपकी सहज प्रतिक्रिया क्या है?" },
      opts: [
        { en: "Learn the new system first, before others do", hi: "दूसरों से पहले नई प्रणाली सीखेंगे", tag: { I: 2, E: 1 }, sub: { trade: 3, eng: 2, it: 1 } },
        { en: "Stay expert in what I already do best", hi: "जो सबसे अच्छा करते हैं उसी में विशेषज्ञ रहेंगे", tag: { O: 2, P: 1 }, sub: { trade: 3 } },
        { en: "Train others in it once I know it", hi: "सीखने के बाद दूसरों को सिखाएँगे", tag: { S: 2 }, sub: { teach: 3, trade: 2 } },
        { en: "Turn it into a business before the market fills", hi: "बाज़ार भरने से पहले उसे व्यवसाय बनाएँगे", tag: { E: 3 }, sub: { mgmt: 2, trade: 2 } } ] },

    /* ---------- counter-checks: does the declared stream fit? ---------- */
    { dim: 0, topic: "counter-pcb-clinical-tolerance", streams: PCB, role: "counter",
      q: { en: "A relative needs a dressing changed and there is nobody else. You:",
           hi: "किसी रिश्तेदार की पट्टी बदलनी है और कोई और नहीं है। आप:" },
      opts: [
        { en: "Do it steadily — it does not bother me", hi: "शांति से कर देंगे — मुझे परेशानी नहीं होती", tag: { S: 2, O: 1 }, sub: { med: 3, allied: 3 } },
        { en: "Do it, but I have to look away", hi: "कर देंगे, पर नज़र हटानी पड़ेगी", tag: { S: 1 }, sub: { allied: 1, bio: 1 } },
        { en: "Call someone trained instead", hi: "किसी प्रशिक्षित व्यक्ति को बुलाएँगे", tag: { O: 1 }, sub: { med: -2 } },
        { en: "I cannot — I would faint", hi: "मैं नहीं कर सकता/सकती — मुझे चक्कर आ जाएगा", tag: { A: 1 }, sub: { med: -3, allied: -2, biotech: 2 } } ] },

    { dim: 0, topic: "counter-pcm-abstract-tolerance", streams: PCM, role: "counter",
      q: { en: "Two hours of algebra with no visible use at the end. Honestly:",
           hi: "दो घंटे बीजगणित, जिसका अंत में कोई दिखता उपयोग नहीं। सच में:" },
      opts: [
        { en: "I enjoy it for its own sake", hi: "मुझे यह अपने आप में अच्छा लगता है", tag: { I: 3 }, sub: { math: 3, sci: 2, eng: 1 } },
        { en: "Fine, if I know where it will be used later", hi: "ठीक है, यदि पता हो कि आगे कहाँ काम आएगा", tag: { I: 1, P: 1 }, sub: { eng: 2, it: 2 } },
        { en: "I struggle unless I can see or build it", hi: "जब तक देख या बना न सकूँ, मुश्किल होती है", tag: { P: 2 }, sub: { trade: 2, design: 2, math: -1 } },
        { en: "I lose interest completely", hi: "मेरी रुचि पूरी तरह ख़त्म हो जाती है", tag: { A: 1 }, sub: { math: -3, eng: -2, arts: 2 } } ] },

    { dim: 0, topic: "counter-com-detail-tolerance", streams: COM_ALL, role: "counter",
      q: { en: "A ledger will not tally and it is 9 p.m. You:",
           hi: "एक बहीखाता मिल नहीं रहा और रात के 9 बज चुके हैं। आप:" },
      opts: [
        { en: "Stay until I find the error", hi: "जब तक ग़लती न मिले, बैठे रहेंगे", tag: { O: 3 }, sub: { com: 3 } },
        { en: "Write a check so it cannot happen again", hi: "ऐसी जाँच बनाएँगे कि यह दोबारा न हो", tag: { I: 2, O: 1 }, sub: { com: 2, it: 2 } },
        { en: "Hand it to someone better at detail", hi: "किसी अधिक बारीक़ व्यक्ति को दे देंगे", tag: { E: 2 }, sub: { mgmt: 2, com: -1 } },
        { en: "This kind of work is not for me", hi: "इस तरह का काम मेरे लिए नहीं है", tag: { A: 1 }, sub: { com: -3, arts: 2, design: 1 } } ] },

    { dim: 0, topic: "counter-arts-rigour", streams: ["Arts / Humanities"], role: "counter",
      q: { en: "An essay needs six sources read properly before you can write a line. You:",
           hi: "एक निबंध लिखने से पहले छह स्रोत ठीक से पढ़ने हैं। आप:" },
      opts: [
        { en: "Read all six and take notes", hi: "छहों पढ़ेंगे और नोट्स बनाएँगे", tag: { I: 2, O: 1 }, sub: { arts: 3, civil: 3 } },
        { en: "Read two and write from my own thinking", hi: "दो पढ़ेंगे और अपनी सोच से लिखेंगे", tag: { A: 2 }, sub: { arts: 2, design: 1 } },
        { en: "Prefer to interview people instead of reading", hi: "पढ़ने की जगह लोगों से बात करना पसंद करेंगे", tag: { S: 2, E: 1 }, sub: { socsci: 3, arts: 1 } },
        { en: "Long reading is where I lose the plot", hi: "लंबा पढ़ना मुझसे नहीं होता", tag: { P: 1 }, sub: { arts: -2, civil: -2, trade: 2 } } ] },

    { dim: 0, topic: "counter-iti-classroom", streams: ["Vocational / ITI"], role: "counter",
      q: { en: "To move from technician to supervisor you must sit two years of classroom study again. You:",
           hi: "तकनीशियन से सुपरवाइज़र बनने के लिए दो वर्ष फिर कक्षा में पढ़ना होगा। आप:" },
      opts: [
        { en: "Would do it — the jump is worth it", hi: "करेंगे — यह छलांग सार्थक है", tag: { I: 2, O: 1 }, sub: { eng: 3, trade: 1 } },
        { en: "Would do it part-time while earning", hi: "कमाते हुए अंशकालिक करेंगे", tag: { O: 2, P: 1 }, sub: { trade: 3, eng: 1 } },
        { en: "Would rather grow my own work instead", hi: "उसके बजाय अपना काम बढ़ाना पसंद करेंगे", tag: { E: 3 }, sub: { mgmt: 2, trade: 2 } },
        { en: "No — classrooms are what I left", hi: "नहीं — कक्षा ही तो मैंने छोड़ी है", tag: { P: 2 }, sub: { trade: 3, eng: -2 } } ] },

    /* ---------- served to everyone: modern-work orientation ---------- */
    { dim: 3, topic: "orient-ai-tools", streams: "*", role: "deepen",
      q: { en: "Most jobs now sit next to some kind of software or AI tool. What is your position on that?",
           hi: "अब अधिकांश नौकरियाँ किसी न किसी सॉफ़्टवेयर या एआई उपकरण के साथ चलती हैं। इस पर आपकी स्थिति क्या है?" },
      opts: [
        { en: "I want to be the one who builds and controls the tool", hi: "मैं वही बनना चाहता/चाहती हूँ जो उपकरण बनाए और नियंत्रित करे", tag: { desk: 2 }, sub: { it: 3, eng: 2 } },
        { en: "I want to use it well in a field I care about", hi: "जिस क्षेत्र की मुझे परवाह है, उसमें उसे अच्छे से उपयोग करना चाहता/चाहती हूँ", tag: { desk: 1, service: 1 }, sub: { med: 1, com: 1, teach: 1, agri: 1 } },
        { en: "I would rather do work a machine cannot do", hi: "मैं वह काम करना चाहूँगा/चाहूँगी जो मशीन नहीं कर सकती", tag: { field: 2, service: 1 }, sub: { med: 2, trade: 2, arts: 2, psych: 2 } },
        { en: "I have not thought about it yet", hi: "मैंने अभी तक इस पर नहीं सोचा", tag: { secure: 1 }, sub: {} } ] },

    { dim: 3, topic: "orient-mobility", streams: "*", role: "deepen",
      q: { en: "How far from home are you willing to go for the right course?",
           hi: "सही पाठ्यक्रम के लिए आप घर से कितनी दूर जाने को तैयार हैं?" },
      opts: [
        { en: "Anywhere, including abroad", hi: "कहीं भी, विदेश सहित", tag: { venture: 2 }, sub: {} },
        { en: "Anywhere in the country", hi: "देश में कहीं भी", tag: { venture: 1, desk: 1 }, sub: {} },
        { en: "Within my state", hi: "अपने राज्य के भीतर", tag: { local: 1, secure: 1 }, sub: {} },
        { en: "I need to stay near home", hi: "मुझे घर के पास ही रहना है", tag: { local: 2, secure: 1 }, sub: {} } ] },

    { dim: 2, topic: "pers-pressure-style", streams: "*", role: "deepen",
      q: { en: "Two weeks before a big exam, what does your day actually look like?",
           hi: "बड़ी परीक्षा से दो सप्ताह पहले, आपका दिन वास्तव में कैसा होता है?" },
      opts: [
        { en: "A written plan I mostly stick to", hi: "एक लिखी हुई योजना, जिस पर मैं अधिकतर टिकता/टिकती हूँ", tag: { detail: 2, calm: 1 } },
        { en: "Long bursts when the mood is right", hi: "मन बना तो लंबे-लंबे दौर", tag: { explore: 2, solo: 1 } },
        { en: "Studying with friends and testing each other", hi: "दोस्तों के साथ पढ़ना और एक-दूसरे को जाँचना", tag: { people: 2 } },
        { en: "Panic first, then a hard final week", hi: "पहले घबराहट, फिर आख़िरी हफ़्ता कड़ी मेहनत", tag: { explore: 1 } } ] }
  ];

  /* ================================================================
     4. DYNAMIC SELECTION
     Wraps DISHA_ASSESS.select. Same signature, same output shape,
     so the app does not know anything changed.
     ================================================================ */

  var A = window.DISHA_ASSESS || {};
  var origSelect = typeof A.select === "function" ? A.select : null;
  var origStreamBlock = typeof A.streamBlock === "function" ? A.streamBlock : null;

  function classBand(klass) {
    var t = String(klass || "");
    if (/1[12]/.test(t) || /Passed/i.test(t)) return "senior";
    if (/\b(9|10)\b/.test(t)) return "mid";
    return "junior";
  }

  /* how many items per dimension:
     dim0 interest · dim1 aptitude · dim2 personality · dim3 orientation · dim4 EQ */
  function planFor(band, p) {
    var hasStream = !!String(p.stream || "").trim() && band === "senior";
    if (band === "junior") return [14, 10, 7, 6, 7];
    if (band === "mid")    return [18, 16, 8, 7, 8];
    return hasStream ? [20, 24, 9, 8, 9] : [22, 24, 9, 8, 9];
  }

  /* which reasoning sub-skills a stream is actually tested on later.
     Used to weight, never to exclude — every student answers all four. */
  var APT_WEIGHT = {
    "Science (PCM)":          { num: 3, log: 3, spa: 2, verb: 1 },
    "Science (PCB)":          { num: 2, log: 3, verb: 2, spa: 1 },
    "Science (PCMB)":         { num: 3, log: 3, verb: 2, spa: 2 },
    "Commerce (with Maths)":  { num: 3, log: 3, verb: 2, spa: 1 },
    "Commerce (without Maths)": { num: 2, log: 3, verb: 3, spa: 1 },
    "Arts / Humanities":      { verb: 3, log: 3, num: 1, spa: 1 },
    "Vocational / ITI":       { spa: 3, num: 2, log: 2, verb: 1 },
    "":                       { num: 2, log: 2, verb: 2, spa: 2 }
  };

  function seedFrom(str) {
    var h = 2166136261, i;
    str = String(str || "disha");
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function topicOf(item, i) {
    if (item && item.topic) return item.topic;
    var t = (item && item.q && item.q.en) || String(i);
    return t.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 5).join("-");
  }

  /* Does this item belong in this student's paper at all? */
  function admits(item, p, band) {
    if (!item) return false;
    var st = String(p.stream || "").trim();
    if (item.streams && item.streams !== "*") {
      if (!st) return false;                     /* stream-specific, no stream declared */
      if (item.streams.indexOf(st) < 0) return false;
    }
    if (item.dim === 1 && item.level === "advanced" && band === "junior") return false;
    return true;
  }

  /* Higher scores are served first. */
  function priorityOf(item, p, band) {
    var s = 1;
    var st = String(p.stream || "").trim();
    if (item.streams && item.streams !== "*" && st) s += item.role === "counter" ? 4 : 3;
    if (item.dim === 1) {
      var w = APT_WEIGHT[st] || APT_WEIGHT[""];
      s += (w[item.apt] || 1) * 0.5;
      if (band === "senior" && item.level === "advanced") s += 2;
      if (band === "senior" && item.level === "core") s += 0.2;
      if (band !== "senior" && item.level === "core") s += 1.5;
    }
    return s;
  }

  function poolFor(bank, p, band) {
    var CONTENT = window.DISHA_CONTENT || { interest: [], extra: [] };
    var all = (bank || []).slice()
      .concat(CONTENT.interest || [], CONTENT.extra || [], APT, STREAM_ITEMS);
    return all.filter(function (it) { return admits(it, p, band); });
  }

  function pick(pool, plan, seedKey, opts) {
    opts = opts || {};
    var rand = rng(seedFrom(seedKey));
    var seen = opts.seen || {};
    var byDim = [[], [], [], [], []];
    pool.forEach(function (it, i) {
      if (it && byDim[it.dim]) byDim[it.dim].push({ it: it, i: i, topic: topicOf(it, i) });
    });

    function draw(rows, want, taken) {
      var picked = [];
      rows = rows.map(function (r) { return { r: r, k: rand() }; });
      rows.sort(function (a, b) {
        var pa = a.r.it.__pri - (seen[a.r.topic] ? 5 : 0);
        var pb = b.r.it.__pri - (seen[b.r.topic] ? 5 : 0);
        return (pb - pa) || (a.k - b.k);
      });
      rows.forEach(function (row) {
        if (picked.length >= want) return;
        if (taken[row.r.topic]) return;
        taken[row.r.topic] = 1;
        picked.push(row.r.it);
      });
      return picked;
    }

    var out = [];
    byDim.forEach(function (list, dim) {
      var want = plan[dim] || 0, taken = {};
      if (dim === 1 && opts.aptQuota) {
        var q = opts.aptQuota, got = [];
        ["num", "log", "verb", "spa"].forEach(function (skill) {
          got = got.concat(draw(list.filter(function (r) { return r.it.apt === skill; }), q[skill] || 0, taken));
        });
        /* a short sub-pool spills into the others rather than shrinking the block */
        if (got.length < want) got = got.concat(draw(list, want - got.length, taken));
        out = out.concat(got.slice(0, want));
      } else {
        out = out.concat(draw(list, want, taken));
      }
    });
    return out;
  }

  /* Weighting must not silence a skill: every entrance paper this
     report points at tests all four. Each skill gets a floor first,
     and only the remainder is distributed by the stream weighting. */
  function aptQuota(want, stream) {
    var w = APT_WEIGHT[stream] || APT_WEIGHT[""];
    var keys = ["num", "log", "verb", "spa"], q = {}, k, i;
    var floor = Math.max(2, Math.round(want * 0.15));
    var left = want - floor * keys.length;
    if (left < 0) { floor = Math.floor(want / keys.length); left = want - floor * keys.length; }
    var tot = 0;
    keys.forEach(function (x) { q[x] = floor; tot += (w[x] || 1); });
    keys.forEach(function (x) { var add = Math.floor(left * (w[x] || 1) / tot); q[x] += add; });
    var used = 0; keys.forEach(function (x) { used += q[x]; });
    var order = keys.slice().sort(function (a, b) { return (w[b] || 1) - (w[a] || 1); });
    for (i = 0; used < want; i++, used++) q[order[i % keys.length]] += 1;
    return q;
  }

  /* ---- what this student has already been asked -------------------
     A granted re-attempt is only worth granting if the paper is
     actually different, so topics served in earlier attempts are
     pushed to the back of the queue rather than drawn again.     */
  var SEEN_KEY = "disha.elite.seen";
  function seenAll() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch (e) { return {}; }
  }
  function seenBefore(id, attempt) {
    var rec = seenAll()[id] || {}, out = {}, k;
    for (k in rec) if (Number(k) < attempt) (rec[k] || []).forEach(function (t) { out[t] = 1; });
    return out;
  }
  function rememberServed(id, attempt, topics) {
    var all = seenAll();
    all[id] = all[id] || {};
    all[id][String(attempt)] = topics;
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(all)); } catch (e) {}
  }

  var lastServed = null;
  var lastPlan = null;

  function select(klass, bank, seedKey) {
    try {
      var p = profile(window.__dishaUser);
      var band = classBand(klass || p.klass);
      var pool = poolFor(bank, p, band);
      pool.forEach(function (it) { it.__pri = priorityOf(it, p, band); });
      var plan = planFor(band, p);
      /* the attempt number goes into the seed, so a granted re-attempt
         is a different paper — otherwise a retake serves the same
         questions in the same order and measures nothing new */
      var att = attempts.used(p.id);
      var seed = [seedKey || klass || "disha", "a" + att, p.stream || "-", band].join("::");
      var out = pick(pool, plan, seed, {
        seen: seenBefore(p.id, att),
        aptQuota: aptQuota(plan[1] || 0, p.stream || "")
      });
      if (out && out.length) {
        lastServed = out; lastPlan = plan;
        try {
          rememberServed(p.id, att, out.map(function (it, i) { return topicOf(it, i); }));
        } catch (e) {}
        return out;
      }
    } catch (e) {}
    if (origSelect) return origSelect(klass, bank, seedKey);
    return (bank || []).slice();
  }

  function served(fallback) {
    if (lastServed && lastServed.length) return lastServed;
    if (origSelect && A.served) return A.served(fallback);
    return fallback || null;
  }

  /* ================================================================
     5. ATTEMPTS AND THE ADMIN GRANT
     A paid student gets one attempt. An administrator can grant
     further attempts to a named student — for a genuine misfire, a
     school re-test, or a student who has changed stream since.
     Grants are stored on the account record, so they follow the
     student across devices when the cloud is on, and are mirrored
     locally so the check still works offline.
     ================================================================ */

  var ATT_KEY = "disha.elite.attempts";

  function attAll() {
    try { return JSON.parse(localStorage.getItem(ATT_KEY) || "{}"); } catch (e) { return {}; }
  }
  function attSave(all) {
    try { localStorage.setItem(ATT_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function attRow(id) {
    var r = attAll()[id];
    return { used: (r && r.used) || 0, granted: (r && r.granted) || 0,
             grantedBy: (r && r.grantedBy) || "", grantedAt: (r && r.grantedAt) || 0,
             last: (r && r.last) || 0 };
  }
  function attSet(id, patch) {
    var all = attAll();
    all[id] = Object.assign(attRow(id), patch || {});
    attSave(all);
    /* mirror onto the account so an admin on another device sees it */
    try {
      if (window.DISHA_DB && window.DISHA_DB.accounts && id && id !== "anon") {
        window.DISHA_DB.accounts.patch(id, {
          attemptsUsed: all[id].used,
          retakeGranted: all[id].granted,
          retakeGrantedBy: all[id].grantedBy,
          retakeGrantedAt: all[id].grantedAt
        });
      }
    } catch (e) {}
    return all[id];
  }

  /* An account may already carry counters set from another device. */
  function mergeFromAccount(acc) {
    if (!acc || !acc.id) return;
    var local = attRow(acc.id);
    var used = Math.max(local.used, acc.attemptsUsed || 0);
    var granted = Math.max(local.granted, acc.retakeGranted || 0);
    if (used !== local.used || granted !== local.granted) {
      var all = attAll();
      all[acc.id] = Object.assign(local, { used: used, granted: granted,
        grantedBy: acc.retakeGrantedBy || local.grantedBy,
        grantedAt: acc.retakeGrantedAt || local.grantedAt });
      attSave(all);
    }
  }

  var attempts = {
    used: function (id) { return attRow(id).used; },
    row: attRow,
    allowance: function (user) {
      if (user && user.role === "admin") return 99;
      return 1 + attRow((user && user.id) || "anon").granted;
    },
    canStart: function (user) {
      var id = (user && user.id) || "anon";
      if (!user || user.role === "admin") return { ok: true, used: 0, allowed: 99 };
      var r = attRow(id);
      var allowed = 1 + r.granted;
      return { ok: r.used < allowed, used: r.used, allowed: allowed,
               granted: r.granted, grantedBy: r.grantedBy };
    },
    record: function (user) {
      var id = (user && user.id) || "anon";
      if (user && user.role === "admin") return attRow(id);
      return attSet(id, { used: attRow(id).used + 1, last: Date.now() });
    },
    grant: function (id, n, by) {
      var r = attRow(id);
      return attSet(id, { granted: Math.max(0, r.granted + (n == null ? 1 : n)),
                          grantedBy: by || "administrator", grantedAt: Date.now() });
    },
    revoke: function (id) { return attSet(id, { granted: 0, grantedBy: "", grantedAt: 0 }); },
    reset: function (id, by) {
      return attSet(id, { used: 0, granted: 0, grantedBy: by || "administrator",
                          grantedAt: Date.now() });
    },
    merge: mergeFromAccount
  };

  /* ---- re-attempt codes -------------------------------------------
     A grant issued in the administrator's browser cannot reach the
     student's phone: the cloud "profiles" table has no attempt
     columns, and saveProfile can only write the signed-in user's own
     row. Until that schema is extended, the grant travels as a short
     code the administrator reads out, the same way promo codes
     already work here. The code is derived from the student's own
     mobile or email, so their device can verify it offline and no
     other student can use it.                                      */

  var CODE_SALT = "DISHA-RA-2026";

  function contactKey(user) {
    var c = String((user && (user.mobile || user.email)) || "").toLowerCase().trim();
    return c.replace(/[^a-z0-9@.]/g, "");
  }
  function codeFor(user, attemptIndex) {
    var base = contactKey(user) + "|" + attemptIndex + "|" + CODE_SALT;
    var h = 2166136261, i;
    for (i = 0; i < base.length; i++) { h ^= base.charCodeAt(i); h = (h * 16777619) >>> 0; }
    var h2 = 5381;
    for (i = base.length - 1; i >= 0; i--) { h2 = ((h2 * 33) ^ base.charCodeAt(i)) >>> 0; }
    var raw = (h.toString(36) + h2.toString(36)).toUpperCase().replace(/[^A-Z0-9]/g, "");
    return "RA-" + raw.slice(0, 4) + "-" + raw.slice(4, 8);
  }
  var SPENT_KEY = "disha.elite.spent";
  function spentAll() {
    try { return JSON.parse(localStorage.getItem(SPENT_KEY) || "{}"); } catch (e) { return {}; }
  }
  function markSpent(id, code) {
    var all = spentAll();
    all[id] = all[id] || [];
    if (all[id].indexOf(code) < 0) all[id].push(code);
    try { localStorage.setItem(SPENT_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function isSpent(id, code) {
    return (spentAll()[id] || []).indexOf(code) > -1;
  }

  function redeem(user, entered) {
    var id = (user && user.id) || "anon";
    var want = String(entered || "").toUpperCase().replace(/[\s\u2013\u2014]/g, "");
    if (!contactKey(user)) return { ok: false, reason: "no-contact" };
    /* One code, one sitting. A spent code is refused even though it
       still hashes correctly, so it cannot be passed around a class
       or re-used by the same student for a third attempt. */
    if (isSpent(id, want)) return { ok: false, reason: "already-used" };
    var used = attRow(id).used, i;
    /* accept the code for the sitting they are about to take, and
       tolerate an off-by-one if their local count lags the office's */
    for (i = Math.max(1, used); i <= used + 1; i++) {
      if (codeFor(user, i) === want) {
        markSpent(id, want);
        attempts.grant(id, 1, "re-attempt code");
        return { ok: true };
      }
    }
    return { ok: false, reason: "no-match" };
  }

  /* ================================================================
     5a. PRE-FLIGHT — confirm class, stream and maths track
     A stream picked in a hurry at sign-up decides which fields the
     engine will even consider, and a wrong one quietly removes real
     options. So the last screen before the paper is a confirmation
     the student can correct, rather than a value they can never see
     again.
     ================================================================ */

  var STREAM_OPTIONS = [
    "Science (PCM)", "Science (PCB)", "Science (PCMB)",
    "Commerce (with Maths)", "Commerce (without Maths)",
    "Arts / Humanities", "Vocational / ITI"
  ];
  var CLASS_OPTIONS = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Passed Class 12"];

  /* CBSE runs two senior-secondary mathematics courses. Core (041) is
     the course written for students heading to engineering, pure
     mathematics and the physical sciences; Applied (241) is written
     for commerce, economics and the social sciences. CBSE states
     plainly that one is not a substitute for the other, and the 2021
     UGC advisory asking universities to treat them at par was scoped
     to humanities and commerce — not to engineering, mathematics or
     the physical sciences. Recommending an actuarial or B.Stat route
     to a student on 241 without saying so is a two-year mistake. */
  var MATHS_OPTIONS = [
    { v: "core-041",    en: "Core Mathematics (041)",    hi: "कोर गणित (041)" },
    { v: "applied-241", en: "Applied Mathematics (241)", hi: "एप्लाइड गणित (241)" },
    { v: "other",       en: "Neither / my board does not split them", hi: "कोई नहीं / मेरा बोर्ड इन्हें अलग नहीं करता" }
  ];
  function mathsAsked(stream) {
    return stream === "Commerce (with Maths)" || stream === "Arts / Humanities";
  }
  /* The profiles table has no column for this, and saveProfile can
     only write the signed-in user's own row, so the maths track is
     kept with the other local profile overrides. It is asked on the
     same device that then sits the paper, so that is sufficient. */
  function mathsTrack(user) {
    var p = profile(user);
    if (p.mathsTrack) return p.mathsTrack;
    var st = String(p.stream || "");
    if (st.indexOf("Science (PCM") === 0 || st === "Science (PCMB)") return "core-041";
    if (st === "Commerce (without Maths)") return "none";
    return "";
  }

  function saveDetails(user, patch) {
    var id = (user && user.id) || "anon";
    setOverride(id, patch);
    try { if (window.__dishaUser) Object.assign(window.__dishaUser, patch); } catch (e) {}
    var jobs = [];
    /* mathsTrack is local-only; klass and stream are real columns */
    var cloudPatch = {};
    if (patch.klass != null) cloudPatch.klass = patch.klass;
    if (patch.stream != null) cloudPatch.stream = patch.stream;
    try {
      if (window.DISHA_DB && window.DISHA_DB.accounts && id !== "anon") {
        jobs.push(window.DISHA_DB.accounts.patch(id, cloudPatch));
      }
    } catch (e) {}
    try {
      if (Object.keys(cloudPatch).length &&
          window.DISHA_CLOUD && window.DISHA_CLOUD.enabled && window.DISHA_CLOUD.enabled() &&
          window.__dishaUser && window.__dishaUser.id === id) {
        jobs.push(window.DISHA_CLOUD.saveProfile(cloudPatch));
      }
    } catch (e) {}
    return Promise.all(jobs).catch(function () { return null; });
  }

  var preOverlay = null;

  function closePreflight() {
    if (preOverlay) { preOverlay.remove(); preOverlay = null; }
  }

  /* Resolves true to continue into the assessment, false to go back. */
  function preflight(user, lang) {
    return new Promise(function (resolve) {
      var p = profile(user);
      var senior = classBand(p.klass) === "senior";
      var sel = { klass: p.klass || "", stream: p.stream || "", mathsTrack: mathsTrack(user) };

      closePreflight();
      preOverlay = document.createElement("div");
      preOverlay.id = "disha-preflight";
      preOverlay.setAttribute("style",
        "position:fixed;inset:0;background:rgba(46,45,41,.6);z-index:2147483000;" +
        "display:flex;align-items:flex-start;justify-content:center;overflow:auto;" +
        "padding:" + (narrow() ? "0" : "24px") + ";-webkit-overflow-scrolling:touch");

      function opt(list, cur, valKey) {
        return list.map(function (o) {
          var v = valKey ? o[valKey] : o;
          var label = valKey ? L(lang, o.en, o.hi) : o;
          return '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(label) + "</option>";
        }).join("");
      }
      function field(id, label, inner, note) {
        return '<div style="margin-top:16px"><label for="' + id + '" style="display:block;font-size:12px;' +
          'font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:' + P.cardinal + '">' +
          esc(label) + "</label>" + inner +
          (note ? '<div style="font-size:12px;color:' + P.grey + ';margin-top:5px;line-height:1.5">' + note + "</div>" : "") +
          "</div>";
      }
      var selStyle = 'style="width:100%;box-sizing:border-box;margin-top:6px;padding:11px 10px;' +
        'font-size:16px;border:1px solid ' + P.hairline + ';border-radius:4px;background:#fff;color:' + P.ink + '"';

      preOverlay.innerHTML =
        '<div style="background:#fff;max-width:560px;width:100%;box-sizing:border-box;' +
        'border-radius:' + (narrow() ? "0" : "8px") + ';padding:' + (narrow() ? "18px 16px 40px" : "24px 26px") + ';' +
        'min-height:' + (narrow() ? "100%" : "auto") + ';font-family:\'Source Sans 3\',-apple-system,sans-serif;color:' + P.ink + '">' +
          '<h2 style="font-family:\'Source Serif 4\',Georgia,serif;font-size:21px;margin:0;color:' + P.cardinal + '">' +
            L(lang, "Before you start", "शुरू करने से पहले") + "</h2>" +
          '<p style="font-size:13.5px;color:' + P.grey + ';line-height:1.6;margin:8px 0 0">' +
            L(lang, "Check these are right. Your stream decides which questions you are asked and which fields the report can recommend, so a wrong entry here narrows your result.",
                    "जाँच लें कि ये सही हैं। आपकी स्ट्रीम तय करती है कि कौन-से प्रश्न पूछे जाएँगे और रिपोर्ट कौन-से क्षेत्र सुझा सकती है — ग़लत प्रविष्टि आपका परिणाम सीमित कर देती है।") + "</p>" +
          field("dpf-klass", L(lang, "Class", "कक्षा"),
                '<select id="dpf-klass" ' + selStyle + ">" + opt(CLASS_OPTIONS, sel.klass) + "</select>") +
          (senior
            ? field("dpf-stream", L(lang, "Stream", "स्ट्रीम"),
                '<select id="dpf-stream" ' + selStyle + '><option value="">' +
                esc(L(lang, "Not chosen yet", "अभी तय नहीं")) + "</option>" + opt(STREAM_OPTIONS, sel.stream) + "</select>")
            : '<div style="font-size:12.5px;color:' + P.grey + ';margin-top:14px;line-height:1.55">' +
              esc(L(lang, "At your class no stream is assumed — helping you choose one is what this assessment is for.",
                          "आपकी कक्षा में कोई स्ट्रीम मानी नहीं जाती — स्ट्रीम चुनने में मदद करना ही इस मूल्यांकन का उद्देश्य है।")) + "</div>") +
          '<div id="dpf-maths-wrap"></div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">' +
            '<button id="dpf-go" style="flex:1 1 auto;background:' + P.cardinal + ';color:#fff;border:none;' +
              'border-radius:4px;padding:13px 18px;font-weight:700;font-size:15px;cursor:pointer">' +
              esc(L(lang, "Confirm & start", "पुष्टि कर शुरू करें")) + "</button>" +
            '<button id="dpf-back" style="background:#fff;color:' + P.ink + ';border:1px solid ' + P.hairline + ';' +
              'border-radius:4px;padding:13px 18px;font-size:15px;cursor:pointer">' +
              esc(L(lang, "Back", "वापस")) + "</button>" +
          "</div></div>";

      document.body.appendChild(preOverlay);

      var kEl = preOverlay.querySelector("#dpf-klass");
      var sEl = preOverlay.querySelector("#dpf-stream");
      var wrap = preOverlay.querySelector("#dpf-maths-wrap");

      function renderMaths() {
        var st = sEl ? sEl.value : sel.stream;
        if (!mathsAsked(st)) { wrap.innerHTML = ""; return; }
        wrap.innerHTML = field("dpf-maths", L(lang, "Which Mathematics are you taking?", "आप कौन-सा गणित ले रहे हैं?"),
          '<select id="dpf-maths" ' + selStyle + '><option value="">' +
          esc(L(lang, "Please choose", "कृपया चुनें")) + "</option>" +
          opt(MATHS_OPTIONS, sel.mathsTrack, "v") + "</select>",
          esc(L(lang, "Core (041) and Applied (241) are different courses, and CBSE does not treat one as a substitute for the other. Applied is accepted for commerce and humanities degrees; engineering, BSc Mathematics and B.Stat routes generally require Core. Telling us which you take keeps the report honest.",
                      "कोर (041) और एप्लाइड (241) अलग पाठ्यक्रम हैं; CBSE एक को दूसरे का विकल्प नहीं मानता। एप्लाइड वाणिज्य एवं मानविकी की डिग्रियों के लिए स्वीकार्य है; इंजीनियरिंग, बीएससी गणित और बी.स्टैट के लिए सामान्यतः कोर आवश्यक है।")));
      }
      renderMaths();
      if (sEl) sEl.onchange = function () { sel.mathsTrack = ""; renderMaths(); };

      function finish(ok) {
        closePreflight();
        resolve(!!ok);
      }
      preOverlay.querySelector("#dpf-back").onclick = function () { finish(false); };
      preOverlay.querySelector("#dpf-go").onclick = function () {
        var mEl = preOverlay.querySelector("#dpf-maths");
        if (mEl && !mEl.value) {
          try { alert(L(lang, "Please choose which Mathematics you are taking.", "कृपया चुनें कि आप कौन-सा गणित ले रहे हैं।")); } catch (e) {}
          return;
        }
        var patch = { klass: kEl.value };
        if (sEl) patch.stream = sEl.value;
        if (mEl) patch.mathsTrack = mEl.value;
        else if (sEl && !mathsAsked(sEl.value)) patch.mathsTrack = "";
        saveDetails(user, patch).then(function () { finish(true); });
      };
    });
  }

  /* ---- the gate ---------------------------------------------------
     Every route into the quiz passes through DISHA_CONSENT_UI.gate.
     Wrapping it is the one place that catches "Start Assessment",
     "Retake Assessment" and the resume path together.              */
  function blockedMessage(lang, v) {
    return L(lang,
      "You have already completed your assessment.\n\nA re-attempt is released by your school or by DISHA. If they have given you a re-attempt code, enter it below. Leave it blank to go back.",
      "आप अपना मूल्यांकन पूरा कर चुके हैं।\n\nदोबारा प्रयास आपके विद्यालय या DISHA द्वारा खोला जाता है। यदि आपको दोबारा-प्रयास कोड मिला है, नीचे दर्ज करें। वापस जाने के लिए ख़ाली छोड़ें।");
  }

  function installGate() {
    var CU = window.DISHA_CONSENT_UI;
    if (!CU || typeof CU.gate !== "function" || CU.__eliteWrapped) return;
    var orig = CU.gate;
    CU.gate = function (user, uiLang) {
      var lang = uiLang === "hi" ? "hi" : "en";
      try {
        if (user && user.role === "student") {
          mergeFromAccount(user);
          var v = attempts.canStart(user);
          if (!v.ok) {
            var entered = null;
            try { entered = prompt(blockedMessage(lang, v)); } catch (e) {}
            var r = entered ? redeem(user, entered) : { ok: false, reason: "cancelled" };
            if (!r.ok) {
              if (entered) {
                try {
                  alert(L(lang, "That code does not match this account. Check it with your school and try again.",
                                "यह कोड इस खाते से मेल नहीं खाता। विद्यालय से जाँचकर दोबारा प्रयास करें।"));
                } catch (e2) {}
              }
              return Promise.resolve(false);
            }
          }
        }
      } catch (e) {}
      var pre = (user && user.role === "student")
        ? preflight(user, lang)
        : Promise.resolve(true);
      return pre.then(function (go) {
        if (!go) return false;
        return orig.call(CU, user, uiLang).then(function (ok) {
          if (ok) { try { attempts.record(user); } catch (e) {} }
          return ok;
        });
      });
    };
    CU.__eliteWrapped = true;
  }

  /* ---- admin console ---------------------------------------------
     A small, self-contained overlay. It reads the account list the
     app already keeps, and writes grants back to it.               */

  var P = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A", fog: "#F4F4F4",
            hairline: "#D5D5D0", gold: "#C9A227", sky: "#006CB8" };

  var adminOverlay = null;
  var adminQuery = "";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function closeAdmin() {
    if (adminOverlay) { adminOverlay.remove(); adminOverlay = null; }
    document.removeEventListener("keydown", onAdminKey);
  }
  function onAdminKey(e) { if (e.key === "Escape") closeAdmin(); }

  function narrow() {
    try { return window.innerWidth < 720; } catch (e) { return false; }
  }
  function adminStyles() {
    /* On a phone the console is full-bleed. The earlier centred box
       overflowed the viewport, so the names and the search field sat
       off-screen to the left and the page behind showed through. */
    return "position:fixed;inset:0;background:rgba(46,45,41,.55);z-index:2147483000;" +
           "display:flex;align-items:flex-start;justify-content:center;" +
           "padding:" + (narrow() ? "0" : "24px") + ";overflow:auto;-webkit-overflow-scrolling:touch";
  }

  /* Accounts live in two places: this browser's own store, and the
     cloud "profiles" table when Supabase is on. A student who signed
     up on their own phone exists only in the second one, so the
     console has to read both and merge — searching the local store
     alone is why a real student can come back "not found".        */
  var cloudOn = false;
  function roster() {
    var local = (window.DISHA_DB && window.DISHA_DB.accounts)
      ? window.DISHA_DB.accounts.list().catch(function () { return []; })
      : Promise.resolve([]);
    var remote = Promise.resolve([]);
    try {
      if (window.DISHA_CLOUD && window.DISHA_CLOUD.enabled && window.DISHA_CLOUD.enabled()) {
        cloudOn = true;
        remote = window.DISHA_CLOUD.listProfiles().catch(function () { return []; });
      }
    } catch (e) {}
    return Promise.all([local, remote]).then(function (r) {
      var seen = {}, out = [];
      function key(a) {
        return String(a.mobile || a.email || a.id || "").toLowerCase().replace(/[^a-z0-9@.]/g, "");
      }
      r[1].concat(r[0]).forEach(function (a) {
        if (!a) return;
        var k = key(a);
        if (!k) return;
        if (seen[k]) { Object.keys(a).forEach(function (f) { if (seen[k][f] == null) seen[k][f] = a[f]; }); return; }
        seen[k] = a; out.push(a);
      });
      return out;
    });
  }

  function openAdmin(user) {
    user = user || window.__dishaUser;
    if (!user || user.role !== "admin") {
      alert("Re-attempt control is available to administrators only.");
      return;
    }
    closeAdmin();
    adminOverlay = document.createElement("div");
    adminOverlay.id = "disha-retake-admin";
    adminOverlay.setAttribute("style", adminStyles());
    adminOverlay.innerHTML =
      '<div style="background:#fff;max-width:960px;width:100%;box-sizing:border-box;' +
      'border-radius:' + (narrow() ? "0" : "8px") + ';padding:' + (narrow() ? "16px 14px 40px" : "22px 24px") + ';' +
      'min-height:' + (narrow() ? "100%" : "auto") + ';' +
      'font-family:\'Source Sans 3\',-apple-system,sans-serif;color:' + P.ink + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
      '<div><h2 style="font-family:\'Source Serif 4\',Georgia,serif;margin:0;font-size:22px;color:' + P.cardinal + '">Assessment attempts</h2>' +
      '<div style="font-size:13px;color:' + P.grey + ';margin-top:4px">Every student gets one attempt. Release a re-attempt here — the student then gets a freshly drawn paper, not the same one.</div></div>' +
      '<button id="dra-close" style="background:none;border:none;font-size:28px;line-height:1;cursor:pointer;color:' + P.ink + '">&times;</button></div>' +
      '<input id="dra-q" placeholder="Search name, school, city, mobile or email" ' +
      'style="width:100%;box-sizing:border-box;margin-top:14px;padding:10px 12px;border:1px solid ' + P.hairline + ';border-radius:4px;font-size:16px">' +
      '<div id="dra-body" style="margin-top:14px"></div></div>';
    document.body.appendChild(adminOverlay);
    document.addEventListener("keydown", onAdminKey);
    adminOverlay.addEventListener("click", function (e) { if (e.target === adminOverlay) closeAdmin(); });
    adminOverlay.querySelector("#dra-close").onclick = closeAdmin;
    var q = adminOverlay.querySelector("#dra-q");
    q.value = adminQuery;
    q.oninput = function () { adminQuery = q.value; renderAdmin(); };
    renderAdmin();
  }

  function renderAdmin() {
    if (!adminOverlay) return;
    var body = adminOverlay.querySelector("#dra-body");
    body.innerHTML = '<div style="color:' + P.grey + ';font-size:14px">Loading accounts…</div>';
    roster().then(function (list) {
      var q = adminQuery.trim().toLowerCase();
      var rows = (list || []).filter(function (a) { return a && a.role !== "admin"; });
      rows.forEach(mergeFromAccount);
      if (q) {
        rows = rows.filter(function (a) {
          return ["name", "school", "city", "mobile", "email", "klass"].some(function (k) {
            return String(a[k] || "").toLowerCase().indexOf(q) > -1;
          });
        });
      }
      rows.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      if (!rows.length) {
        body.innerHTML = '<div style="color:' + P.grey + '">No student matches that search.</div>';
        return;
      }
      /* A five-column table cannot fit a phone. On a narrow screen
         each student becomes a stacked card instead, so the name and
         the buttons are both reachable without sideways scrolling. */
      function stateHtml(r) {
        var allowed = 1 + r.granted;
        return r.used >= allowed
          ? '<span style="color:' + P.cardinal + ';font-weight:700">' + r.used + " / " + allowed + " \u00b7 closed</span>"
          : '<span style="color:#166534;font-weight:700">' + r.used + " / " + allowed + " \u00b7 open</span>";
      }
      function buttons(a) {
        var w = narrow() ? "flex:1 1 46%;" : "";
        return '<button data-grant="' + esc(a.id) + '" style="' + w + 'background:' + P.cardinal +
            ';color:#fff;border:none;border-radius:4px;padding:9px 10px;font-weight:700;font-size:13px;cursor:pointer">+1 re-attempt</button>' +
          '<button data-code="' + esc(a.id) + '" style="' + w + 'background:' + P.gold +
            ';color:#2E2D29;border:none;border-radius:4px;padding:9px 10px;font-weight:700;font-size:13px;cursor:pointer">Get code</button>' +
          '<button data-revoke="' + esc(a.id) + '" style="' + w + 'background:#fff;color:' + P.ink +
            ';border:1px solid ' + P.hairline + ';border-radius:4px;padding:9px 10px;font-size:13px;cursor:pointer">Revoke</button>' +
          '<button data-edit="' + esc(a.id) + '" style="' + w + 'background:#fff;color:' + P.sky +
            ';border:1px solid ' + P.sky + ';border-radius:4px;padding:9px 10px;font-weight:700;font-size:13px;cursor:pointer">Edit stream</button>' +
          '<button data-reset="' + esc(a.id) + '" style="' + w + 'background:#fff;color:' + P.grey +
            ';border:1px solid ' + P.hairline + ';border-radius:4px;padding:9px 10px;font-size:13px;cursor:pointer">Reset</button>';
      }

      if (narrow()) {
        body.innerHTML = rows.map(function (a) {
          var r = attRow(a.id);
          return '<div style="border:1px solid ' + P.hairline + ';border-radius:6px;padding:12px;margin-bottom:10px">' +
            '<div style="font-weight:700;font-size:15px">' + esc(a.name || "\u2014") + '</div>' +
            '<div style="font-size:12.5px;color:' + P.grey + ';margin-top:2px">' +
              esc(a.mobile || a.email || "no contact on record") + '</div>' +
            '<div style="font-size:12.5px;color:' + P.grey + ';margin-top:2px">' +
              esc(a.klass || "\u2014") + ' \u00b7 ' + esc(a.stream || "stream not declared") + (profile(a).mathsTrack === 'core-041' ? ' \u00b7 Maths 041' : profile(a).mathsTrack === 'applied-241' ? ' \u00b7 Maths 241' : '') + '</div>' +
            '<div style="font-size:12.5px;color:' + P.grey + ';margin-top:2px">' +
              esc(a.school || "\u2014") + (a.city ? ", " + esc(a.city) : "") + '</div>' +
            '<div style="font-size:13px;margin-top:8px">' + stateHtml(r) +
              (r.grantedBy ? ' <span style="font-size:11px;color:' + P.grey + '">\u00b7 granted by ' + esc(r.grantedBy) + '</span>' : "") +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' + buttons(a) + '</div>' +
          '</div>';
        }).join("");
      } else {
        var head = '<tr style="text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:' +
          P.grey + '"><th style="padding:6px 8px">Student</th><th style="padding:6px 8px">Class \u00b7 Stream</th>' +
          '<th style="padding:6px 8px">School</th><th style="padding:6px 8px">Used / Allowed</th>' +
          '<th style="padding:6px 8px">Action</th></tr>';
        var trs = rows.map(function (a) {
          var r = attRow(a.id);
          return '<tr style="border-top:1px solid ' + P.hairline + '">' +
            '<td style="padding:8px">' + esc(a.name || "\u2014") +
              '<div style="font-size:11px;color:' + P.grey + '">' + esc(a.mobile || a.email || "") + '</div></td>' +
            '<td style="padding:8px;font-size:13px">' + esc(a.klass || "\u2014") +
              '<div style="font-size:11px;color:' + P.grey + '">' + esc(a.stream || "stream not declared") + '</div></td>' +
            '<td style="padding:8px;font-size:13px">' + esc(a.school || "\u2014") +
              '<div style="font-size:11px;color:' + P.grey + '">' + esc(a.city || "") + '</div></td>' +
            '<td style="padding:8px;font-size:13px">' + stateHtml(r) +
              (r.grantedBy ? '<div style="font-size:11px;color:' + P.grey + '">granted by ' + esc(r.grantedBy) + '</div>' : "") +
            '</td>' +
            '<td style="padding:8px;white-space:nowrap;display:flex;gap:5px">' + buttons(a) + '</td></tr>';
        }).join("");
        body.innerHTML = '<table style="width:100%;border-collapse:collapse">' + head + trs + '</table>';
      }

      body.innerHTML += '<div style="font-size:12px;color:' + P.grey + ';margin-top:12px;line-height:1.55">' +
        '<b>+1 re-attempt</b> opens the sitting on <i>this</i> device only. If the student took the assessment on their own phone, that is where their attempt is recorded \u2014 use <b>Get code</b> and send them the code instead. ' +
        'Reset clears both the used count and any grants; use it only when a sitting was abandoned or recorded in error.' +
        '<div style="margin-top:6px">Roster source: ' + (cloudOn ? 'cloud + this device' : 'this device only \u2014 cloud is off, so students who signed up elsewhere will not appear') + '.</div></div>';

      var who = (window.__dishaUser && window.__dishaUser.name) || "administrator";
      body.querySelectorAll("[data-grant]").forEach(function (b) {
        b.onclick = function () { attempts.grant(b.getAttribute("data-grant"), 1, who); renderAdmin(); };
      });
      body.querySelectorAll("[data-code]").forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-code");
          var who2 = rows.filter(function (a) { return a.id === id; })[0];
          if (!who2 || !contactKey(who2)) {
            alert("This account has no mobile or email on record, so a code cannot be issued. Use +1 re-attempt on the student's own device instead.");
            return;
          }
          var c = codeFor(who2, attRow(id).used + 1);
          try { navigator.clipboard && navigator.clipboard.writeText(c); } catch (e) {}
          prompt("Re-attempt code for " + (who2.name || "this student") +
                 "\n\nRead this out to them. They enter it when they tap Retake Assessment.", c);
        };
      });
      body.querySelectorAll("[data-edit]").forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-edit");
          var a = rows.filter(function (x) { return x.id === id; })[0];
          if (!a) return;
          var list = STREAM_OPTIONS.map(function (o, i) { return (i + 1) + ". " + o; }).join("\n");
          var ans = prompt("Stream for " + (a.name || "this student") +
            "\nCurrently: " + (a.stream || "not declared") +
            "\n\n" + list + "\n0. Clear it\n\nEnter a number:", "");
          if (ans === null) return;
          var n = parseInt(ans, 10);
          if (isNaN(n) || n < 0 || n > STREAM_OPTIONS.length) { alert("Not a valid choice."); return; }
          var stream = n === 0 ? "" : STREAM_OPTIONS[n - 1];
          var patch = { stream: stream };
          if (mathsAsked(stream)) {
            var m = prompt("Which Mathematics is " + (a.name || "this student") + " taking?\n\n" +
              "1. Core Mathematics (041)\n2. Applied Mathematics (241)\n3. Neither / board does not split them", "");
            patch.mathsTrack = { "1": "core-041", "2": "applied-241", "3": "other" }[String(m).trim()] || "";
          } else {
            patch.mathsTrack = "";
          }
          saveDetails(a, patch).then(function () {
            alert("Saved" + (cloudOn && window.__dishaUser && window.__dishaUser.id === id
              ? "." : ". This is stored on this device; ask the student to confirm it on their own phone before they start."));
            renderAdmin();
          });
        };
      });
      body.querySelectorAll("[data-revoke]").forEach(function (b) {
        b.onclick = function () { attempts.revoke(b.getAttribute("data-revoke")); renderAdmin(); };
      });
      body.querySelectorAll("[data-reset]").forEach(function (b) {
        b.onclick = function () {
          if (confirm("Reset this student's attempt record to zero?")) {
            attempts.reset(b.getAttribute("data-reset"), who); renderAdmin();
          }
        };
      });
    });
  }

  /* A small launcher, mounted only while an administrator is signed in. */
  function mountLauncher() {
    var u = window.__dishaUser;
    var btn = document.getElementById("disha-retake-launch");
    if (!u || u.role !== "admin") { if (btn) btn.remove(); return; }
    if (btn) return;
    btn = document.createElement("button");
    btn.id = "disha-retake-launch";
    btn.className = "noprint";
    btn.textContent = "↺ Attempts";
    btn.setAttribute("style",
      "position:fixed;left:16px;top:16px;z-index:9998;background:#fff;color:" + P.cardinal +
      ";border:2px solid " + P.cardinal + ";border-radius:24px;font-weight:700;font-size:13px;" +
      "padding:7px 14px;cursor:pointer;font-family:'Source Sans 3',sans-serif");
    btn.onclick = function () { openAdmin(window.__dishaUser); };
    document.body.appendChild(btn);
  }

  /* ================================================================
     6. THE ELITE REPORT
     Wraps DISHA_ASSESS.streamBlock. The existing "every path this
     result opens" block is kept and returned inside a wider report:
     a percentile read, a reasoning profile, the new-age
     interdisciplinary degrees this profile is built for, three
     signature moves, a 24-month roadmap, funding routed by school
     setting, and honest watch-outs.
     ================================================================ */

  /* ---- new-age, interdisciplinary programmes ----------------------
     n = programme · b = what it blends · r = entry route
     w = where it is offered (indicative — verify before applying) */
  var NEWAGE = {
    med: [
      { n: "MBBS + AI in Clinical Medicine electives", b: "medicine + machine learning",
        r: "NEET-UG, then an institutional AI-in-health elective or add-on certificate",
        w: "AIIMS, PGIMER, several state medical colleges" },
      { n: "B.Sc / M.Sc Health Informatics", b: "clinical care + data systems",
        r: "CUET-UG or institute test", w: "IIPH, Manipal, Amrita, central universities" },
      { n: "Integrated Public Health & Epidemiology (BSc → MPH)", b: "medicine + policy + statistics",
        r: "CUET-UG, then MPH entrance", w: "IIPH Gandhinagar/Hyderabad, TISS, JNU" },
      { n: "Genomics & Precision Medicine", b: "biology + computation",
        r: "CUET / IISER IAT / institute test", w: "IISERs, CDFD, Manipal, Amity" },
      { n: "B.Sc Medical Technology — imaging, robotic surgery support", b: "clinical work + engineering",
        r: "NEET or state paramedical CET", w: "AIIMS, CMC Vellore, SRM, Manipal" },
      { n: "Neuroscience & Cognitive Health", b: "medicine + psychology + AI",
        r: "CUET-UG / institute test", w: "NIMHANS-linked programmes, IIT Gandhinagar, Ashoka" }
    ],
    dental: [
      { n: "BDS + Digital Dentistry / CAD-CAM", b: "dentistry + 3D design and printing",
        r: "NEET-UG, then a digital-dentistry certification", w: "Leading dental colleges, Manipal, Saveetha" },
      { n: "B.Sc Dental Materials & Biomedical Engineering", b: "dentistry + materials science",
        r: "CUET / institute test", w: "Manipal, SRM, private deemed universities" },
      { n: "Maxillofacial Imaging & Forensic Odontology", b: "dentistry + forensics",
        r: "BDS, then PG diploma", w: "Government dental colleges, forensic institutes" }
    ],
    eng: [
      { needs: "041", n: "B.Tech Computer Science with AI & Machine Learning", b: "computing + statistics + domain design",
        r: "JEE Main / Advanced, state CET", w: "IITs, NITs, IIITs, state and private universities" },
      { needs: "041", n: "B.Tech Robotics & Mechatronics", b: "mechanical + electronics + software",
        r: "JEE / state CET", w: "IIT Madras, NITs, VIT, SRM, Manipal" },
      { needs: "041", n: "Electronics & VLSI / Semiconductor Engineering", b: "physics + chip design",
        r: "JEE / state CET; India Semiconductor Mission-linked programmes",
        w: "IITs, NITs, IIITs, designated semiconductor-skilling institutes" },
      { needs: "041", n: "Energy, Climate & Sustainable Systems Engineering", b: "engineering + climate science + policy",
        r: "JEE / CUET", w: "IIT Bombay, IIT Delhi, TERI SAS, NITs" },
      { needs: "041", n: "Bioengineering / Medical Devices", b: "engineering + biology",
        r: "JEE / institute test", w: "IIT Madras, IIT Hyderabad, IIIT, Manipal" },
      { needs: "041", n: "Quantum Technologies & Computing", b: "physics + computer science",
        r: "JEE / IISER IAT / IISc BS", w: "IISc, IITs, IISERs (National Quantum Mission institutes)" },
      { needs: "041", n: "B.Tech Smart Mobility / EV Systems", b: "automotive + power electronics + software",
        r: "JEE / state CET", w: "IITs, NITs, VIT, automotive-cluster institutes" }
    ],
    it: [
      { n: "B.S. Data Science & Applications (online degree)", b: "statistics + programming + domain work",
        r: "IIT Madras qualifier — open to any Class 12 stream",
        w: "IIT Madras, and similar online BSc programmes" },
      { n: "B.Tech / B.Sc Artificial Intelligence", b: "computing + mathematics + ethics",
        r: "JEE / CUET / institute test", w: "IIITs, IIT Hyderabad, NITs, private universities" },
      { n: "Cybersecurity & Digital Forensics", b: "computing + law + investigation",
        r: "JEE / CUET / institute test", w: "IIIT, NFSU Gandhinagar, Amrita, private universities" },
      { n: "Human-Computer Interaction / UX Engineering", b: "computing + psychology + design",
        r: "CUET / UCEED / institute test", w: "IIT Bombay IDC, IIIT Bangalore, Srishti Manipal" },
      { n: "FinTech & Financial Engineering", b: "computing + finance + regulation",
        r: "CUET / JEE / institute test", w: "IIT Kharagpur, IIM-linked programmes, Ashoka, NMIMS" },
      { n: "Computational Linguistics & Language Technology", b: "computing + linguistics",
        r: "CUET / institute test", w: "IIIT Hyderabad, JNU, University of Hyderabad" }
    ],
    sci: [
      { n: "Integrated BS-MS in Interdisciplinary Sciences", needs: "041", b: "physics + biology + computation",
        r: "IISER Aptitude Test (IAT), JEE channel, or KVPY-successor route",
        w: "IISERs, NISER, IISc" },
      { n: "B.Sc Computational Biology / Bioinformatics", needs: "041-pref", b: "life sciences + programming",
        r: "CUET-UG / institute test", w: "IIIT Hyderabad, IISERs, DU, Manipal" },
      { n: "Materials Science & Nanotechnology", needs: "041", b: "chemistry + physics + engineering",
        r: "CUET / JEE / IAT", w: "IISc, IITs, central universities" },
      { n: "Climate & Earth System Science", needs: "041", b: "physics + geography + data",
        r: "CUET-UG / IIT integrated programmes", w: "IIT Bhubaneswar, IISc, TERI SAS, IITM Pune links" },
      { n: "Astronomy & Space Technology", needs: "041", b: "physics + engineering",
        r: "IAT / JEE / CUET", w: "IISERs, IIST Thiruvananthapuram, IUCAA-linked programmes" },
      { n: "Statistics & Data Science (B.Stat / B.Math)", needs: "041", b: "mathematics + inference",
        r: "ISI Admission Test, CMI entrance", w: "ISI Kolkata/Bengaluru, CMI Chennai" }
    ],
    com: [
      { n: "B.Sc / BBA Business Analytics", needs: "041-pref", b: "commerce + statistics + software",
        r: "CUET / IPMAT / institute test", w: "IIM Indore & Rohtak (IPM), NMIMS, Christ, Symbiosis" },
      { n: "Actuarial Science", needs: "041-pref", b: "mathematics + insurance + risk",
        r: "IAI entrance (ACET) alongside a BSc/B.Com", w: "Institute of Actuaries of India, Amity, Christ" },
      { n: "B.Sc Financial Technology (FinTech)", b: "finance + coding + regulation",
        r: "CUET / institute test", w: "Central universities, NMIMS, Symbiosis, private universities" },
      { n: "Economics with Data Science", needs: "041-pref", b: "economics + econometrics + programming",
        r: "CUET-UG, ISI/CMI entrance for the quantitative track",
        w: "ISI, Ashoka, Azim Premji, DU, Madras School of Economics" },
      { n: "ESG & Sustainable Finance", b: "finance + climate + compliance",
        r: "CUET / institute test, or a post-B.Com certification",
        w: "TERI SAS, Symbiosis, IIM executive programmes" },
      { n: "Supply Chain & Logistics Analytics", b: "operations + data + trade",
        r: "CUET / NITIE-successor (IIM Mumbai) route", w: "IIM Mumbai, IIFT, Amity, Christ" },
      { n: "CA / CMA with a data-analytics specialisation", b: "accounting + analytics",
        r: "CA Foundation or CMA Foundation after Class 12", w: "ICAI, ICMAI (nationwide)" }
    ],
    socsci: [
      { n: "B.Sc Cognitive Science", b: "psychology + neuroscience + AI",
        r: "CUET-UG / institute test", w: "IIT Gandhinagar, Ashoka, University of Allahabad, CBCS centres" },
      { n: "Behavioural Economics & Public Policy", b: "psychology + economics + policy",
        r: "CUET / institute test", w: "Ashoka, Azim Premji, TISS, Krea" },
      { n: "Clinical Psychology with digital mental health", b: "psychology + technology + public health",
        r: "CUET-UG, then RCI-recognised M.Phil / PsyD route",
        w: "NIMHANS, Christ, TISS, central universities" },
      { n: "UX Research / Design Research", b: "psychology + design + data",
        r: "CUET / UCEED / portfolio route", w: "IIT Bombay IDC, Srishti Manipal, NID" },
      { n: "Development Studies & Social Data", b: "sociology + statistics + fieldwork",
        r: "CUET / TISS entrance", w: "TISS, Azim Premji, IIT Madras HSS, Ambedkar University" }
    ],
    teach: [
      { n: "B.Sc B.Ed / B.A B.Ed (4-year integrated, NEP-aligned)", b: "subject depth + pedagogy",
        r: "NCET (National Common Entrance Test)", w: "RIEs, central universities, IITs offering ITEP" },
      { n: "Learning Sciences & Educational Technology", b: "teaching + cognitive science + product design",
        r: "CUET / institute test", w: "TISS, IIT Bombay (ET), Azim Premji University" },
      { n: "Special Education with Assistive Technology", b: "pedagogy + disability studies + devices",
        r: "RCI-approved B.Ed Spl.Ed", w: "RCI-recognised institutes nationwide" },
      { n: "STEM Curriculum Design / EdTech content", b: "subject mastery + media production",
        r: "Any degree + a portfolio", w: "EdTech firms, NCERT-linked projects, state SCERTs" }
    ],
    civil: [
      { n: "Integrated BA-LLB with Technology Law", b: "law + data protection + cyber",
        r: "CLAT / AILET / state CET", w: "NLUs, NALSAR, NLSIU, Jindal" },
      { n: "Public Policy (BA / integrated MPP)", b: "economics + governance + data",
        r: "CUET / institute test", w: "Ashoka, Jindal, TISS, IIM public-policy programmes" },
      { n: "International Relations & Security Studies", b: "politics + strategy + languages",
        r: "CUET / institute test", w: "JNU, Jindal, Symbiosis, Christ" },
      { n: "Forensic Science & Criminology", b: "science + investigation + law",
        r: "CUET / NFSU entrance", w: "National Forensic Sciences University, LNJN NICFS" },
      { n: "UPSC preparation with a data-literate optional", b: "governance + statistics/geography",
        r: "Any degree, then UPSC CSE", w: "Nationwide" }
    ],
    def: [
      { n: "NDA → B.Tech at an Armed Forces academy", b: "military training + engineering",
        r: "NDA written + SSB", w: "NDA Khadakwasla, then IMA / INA / AFA" },
      { n: "Cyber & Electronic Warfare (defence-linked)", b: "computing + security + strategy",
        r: "CDS / TES entry, or B.Tech then defence services", w: "MILIT, DIAT Pune, IIITs" },
      { n: "Aerospace & Drone Systems", b: "aeronautics + autonomy",
        r: "JEE / NDA (air wing) / DGCA-approved RPTO", w: "IIST, IITs, DGCA-certified drone academies" },
      { n: "Military Nursing & Combat Medical Support", b: "clinical care + service",
        r: "NEET-UG + MNS test", w: "Armed Forces Medical Services institutions" }
    ],
    agri: [
      { n: "B.Tech / B.Sc Precision Agriculture & AgriTech", b: "agronomy + sensors + drones + data",
        r: "ICAR AIEEA / state CET", w: "ICAR universities, PJTSAU, TNAU, GBPUAT" },
      { n: "Food Technology & Nutraceuticals", b: "food science + biotech + business",
        r: "ICAR AIEEA / state CET", w: "NIFTEM, CFTRI-linked programmes, state agri universities" },
      { n: "Agri-Business Management & Rural Analytics", b: "farming systems + finance + markets",
        r: "ICAR / CUET, then IIM Ahmedabad FABM or IRMA", w: "IIM Ahmedabad (FABM), IRMA, NIAM" },
      { n: "Climate-Smart Agriculture & Soil Health", b: "agronomy + climate science",
        r: "ICAR AIEEA", w: "ICAR institutes, state agricultural universities" },
      { n: "Veterinary Science with One Health", b: "animal medicine + public health",
        r: "NEET-UG", w: "Veterinary colleges under VCI" }
    ],
    creative: [
      { n: "B.Des Interaction / UX Design", b: "design + psychology + code",
        r: "UCEED / NID DAT / NIFT", w: "IIT Bombay IDC, NID, IIIT Bangalore, Srishti Manipal" },
      { n: "Immersive Media — AR / VR / Virtual Production", b: "design + 3D engineering + storytelling",
        r: "Institute test / portfolio", w: "NID, MIT-ID Pune, Whistling Woods, private studios" },
      { n: "Design + Artificial Intelligence (generative media)", b: "visual craft + AI tooling",
        r: "UCEED / portfolio route", w: "NID, IIT design schools, Srishti Manipal" },
      { n: "Game Design & Interactive Narrative", b: "art + programming + systems thinking",
        r: "Institute test / portfolio", w: "IIT Bombay IDC, DSK, Backstage Pass, private academies" },
      { n: "Sustainable & Systems Design", b: "design + materials + circular economy",
        r: "NID DAT / UCEED", w: "NID, Srishti Manipal, Anant National University" },
      { n: "Data Journalism & Visual Storytelling", b: "reporting + statistics + design",
        r: "CUET / IIMC entrance", w: "IIMC, ACJ Chennai, Jamia, Symbiosis" }
    ],
    fashion: [
      { n: "B.Des Fashion with Sustainable Textiles", b: "design + materials + circularity",
        r: "NIFT / NID DAT", w: "NIFT campuses, NID, Pearl Academy" },
      { n: "Fashion Technology & Supply Chain Analytics", b: "apparel production + data",
        r: "NIFT (B.F.Tech)", w: "NIFT campuses" },
      { n: "Digital Fashion & Virtual Try-On", b: "fashion + 3D + software",
        r: "Portfolio / institute test", w: "NIFT, Pearl Academy, private studios" }
    ],
    arts: [
      { n: "Liberal Arts with a quantitative minor", b: "humanities + data literacy",
        r: "CUET / institute test (Ashoka Aptitude Test, Krea SPARK)",
        w: "Ashoka, Krea, FLAME, Azim Premji, Symbiosis" },
      { n: "Digital Humanities", b: "literature/history + computing + archives",
        r: "CUET-UG", w: "Jadavpur, JNU, University of Hyderabad, IIT HSS departments" },
      { n: "Media & Communication with Data Journalism", b: "writing + statistics + verification",
        r: "CUET / IIMC entrance", w: "IIMC, Jamia, ACJ, Symbiosis" },
      { n: "Linguistics & Language Technology", b: "language + computation",
        r: "CUET-UG", w: "JNU, University of Hyderabad, IIIT Hyderabad" },
      { n: "Psychology + Economics double major", b: "behaviour + markets",
        r: "CUET / institute test", w: "Ashoka, Christ, Jindal, central universities" },
      { n: "Museum, Heritage & Cultural Management", b: "history + curation + tourism economics",
        r: "CUET / institute test", w: "NMI Delhi, Jamia, Ambedkar University" }
    ],
    trade: [
      { n: "Industry 4.0 Technician — IoT, PLC, automation", b: "trade skill + digital control",
        r: "ITI, then an NSDC / Sector Skill Council upgrade",
        w: "Advanced ITIs, IIT-linked skill centres, Tata STRIVE" },
      { n: "EV Service & Battery Technology", b: "auto trade + power electronics",
        r: "ITI / short-term ASDC certification", w: "Automotive Skills Development Council centres" },
      { n: "Solar & Renewable Energy Technician", b: "electrical trade + energy systems",
        r: "Suryamitra / SCGJ certification", w: "Skill Council for Green Jobs, NISE Gurugram" },
      { n: "Drone Pilot & Maintenance (DGCA certified)", b: "field work + avionics + surveying",
        r: "DGCA-approved RPTO course", w: "DGCA-certified remote pilot training organisations" },
      { n: "CNC, Additive Manufacturing & 3D Printing", b: "machining + digital design",
        r: "ITI / polytechnic, then a CNC-CAM certification",
        w: "CIPET, MSME tool rooms, advanced ITIs" },
      { n: "Diploma → lateral-entry B.Tech while employed", b: "trade experience + degree",
        r: "State polytechnic test, then lateral entry",
        w: "State polytechnics and engineering colleges" }
    ]
  };
  NEWAGE.allied = NEWAGE.med;
  NEWAGE.bio = NEWAGE.sci;

  /* ---- indicative percentile bands --------------------------------
     A dimension score is a percentage of the maximum available on
     that dimension, not a rank. Turning it into a band is a
     presentation choice, and it is labelled as indicative wherever
     it is shown. The same-setting band adjusts for the fact that a
     district-town student has had less exposure to test formats,
     so that a strong profile there is not flattened by a metro
     comparison it never trained for.                              */
  var SETTING_LIFT = { metro: 0, "semi-urban": 4, district: 8, unknown: 3 };

  function bandFor(pct) {
    if (pct >= 85) return { label: "Top 10%", hi: "शीर्ष 10%" };
    if (pct >= 75) return { label: "Top 25%", hi: "शीर्ष 25%" };
    if (pct >= 60) return { label: "Above average", hi: "औसत से ऊपर" };
    if (pct >= 45) return { label: "Around average", hi: "औसत के आसपास" };
    return { label: "Developing", hi: "विकासशील" };
  }

  function aptRead(aptPct, lang, band) {
    var keys = [
      { k: "num", en: "Numerical", hi: "संख्यात्मक" },
      { k: "log", en: "Logical", hi: "तार्किक" },
      { k: "verb", en: "Verbal", hi: "भाषिक" },
      { k: "spa", en: "Spatial", hi: "स्थानिक" }
    ];
    var rows = keys.map(function (r) {
      return { label: L(lang, r.en, r.hi), pct: Math.round((aptPct && aptPct[r.k]) || 0), k: r.k };
    });
    var sorted = rows.slice().sort(function (a, b) { return b.pct - a.pct; });
    return { rows: rows, best: sorted[0], worst: sorted[sorted.length - 1] };
  }

  /* three moves that are specific to this profile, not generic advice */
  function signatureMoves(trackId, p, apt, lang) {
    var m = [];
    var setting = p.setting;
    var senior = classBand(p.klass) === "senior";

    var byTrack = {
      eng: ["Enter one build competition a year — Smart India Hackathon, Atal Tinkering Marathon or a state science fair. A working prototype outranks a certificate.",
            "Keep a repository or a photo log of everything you build. Engineering admissions abroad and internships in India both ask to see it."],
      it:  ["Ship one small thing publicly every quarter — a site, a bot, a dataset. Six public artefacts by Class 12 is a portfolio.",
            "Learn one language properly (Python) rather than four badly, then add SQL."],
      med: ["Ask to shadow at a hospital, PHC or clinic for a week during a holiday. Almost every institution says yes if a parent writes.",
            "Start NEET Biology now as a reading habit, not as coaching — the syllabus rewards recall built over years."],
      sci: ["Try for a summer research exposure — IISER/IISc open days, NIUS at HBCSE, or a nearby university lab.",
            "Enter the olympiad chain (NSEP/NSEC/NSEB) once. Even a first-round attempt teaches the level."],
      com: ["Run something small with real money — a stall, a resale account, a book of household accounts. Then write down what it taught you.",
            "Start CA/CMA Foundation reading in Class 11 if that is the path; the early start is the whole advantage."],
      civil: ["Read one national newspaper daily and keep a monthly one-page note. Three years of that is most of the general studies foundation.",
              "Choose your graduation subject for its UPSC optional value as well as your interest."],
      creative: ["Build a portfolio of twenty pieces before Class 12. Design schools admit on portfolio, not on marks.",
                 "Take the UCEED/NID sample papers early — they test observation, not drawing skill."],
      arts:  ["Write in public — a blog, a school magazine column, a local paper. Published writing is the credential here.",
              "Pick up a second language seriously; it doubles the options in media, translation and foreign service."],
      trade: ["Get on a registered apprenticeship (NAPS) — it pays a stipend and counts as experience.",
              "Add one digital certificate to your trade (CNC, EV, solar, drone). The trade plus the certificate is what changes the pay."],
      agri:  ["Spend one full season on a working farm or FPO, not a school visit. Note yields, costs and what failed.",
              "Look at ICAR AIEEA early — the syllabus differs from the general Class 12 board pattern."],
      teach: ["Teach a younger group weekly — a neighbourhood group, a school peer class. Two years of that is real evidence.",
              "Watch for NCET; the 4-year integrated B.Ed route is now the shortest way into teaching."],
      socsci:["Volunteer with one organisation for a year rather than five for a month each.",
              "Learn basic statistics early — it separates a psychology graduate who can do research from one who cannot."],
      def:   ["Build the physical standard now — the SSB does not accept late preparation.",
              "Sit the NDA written once as a trial even before you are eligible to join, to learn the paper."],
      dental:["Shadow a dental practice and watch a full day, including the admin side.",
              "NEET is the same gate as MBBS — plan the score, not just the seat."],
      fashion:["Build a portfolio and a sketchbook now — NIFT and NID look at process, not finished polish.",
               "Learn one digital tool (CLO3D, Illustrator) alongside hand skill."]
    };
    (byTrack[trackId] || byTrack.eng).forEach(function (t) { m.push(t); });

    if (setting === "district" || setting === "semi-urban") {
      m.push("Register for the state's own scholarship and CET portals in Class 11, not Class 12 — most district-quota and fee-waiver windows close before the exam season.");
    } else {
      m.push("Use the metro advantage deliberately: one internship, one lab or studio visit, and one mentor conversation every term.");
    }
    if (senior) {
      m.push("Book the entrance registrations for your shortlist the week they open. Missed registration windows end more plans than low marks do.");
    } else {
      m.push("Keep your Class 11 subject choice one step wider than your current favourite. Narrowing is easy later; widening is not.");
    }
    if (apt && apt.worst && apt.worst.pct < 55) {
      m.push("Give " + apt.worst.label.toLowerCase() + " reasoning twenty minutes a day for three months. It is the one score here that most limits which entrance tests are realistic, and it is the one that moves fastest with practice.");
    }
    return m.slice(0, 5);
  }

  function roadmap(band, lang) {
    if (band === "junior") return [
      L(lang, "This term: treat every subject as a trial. Note which class you never want to miss.",
              "इस सत्र: हर विषय को आज़माइश मानें। ध्यान दें कौन-सी कक्षा आप कभी नहीं छोड़ना चाहते।"),
      L(lang, "Next 6 months: pick two activities outside class and stay with both — a club, a workshop, a sport.",
              "अगले 6 महीने: कक्षा के बाहर दो गतिविधियाँ चुनें और दोनों में टिके रहें।"),
      L(lang, "Class 9–10: build the reading and arithmetic base. Every stream later assumes it.",
              "कक्षा 9–10: पढ़ने और अंकगणित की नींव बनाएँ। आगे हर स्ट्रीम इसे मानकर चलती है।"),
      L(lang, "Before Class 11: sit this assessment again once your interests have settled.",
              "कक्षा 11 से पहले: रुचियाँ स्थिर होने पर यह मूल्यांकन दोबारा दें।")
    ];
    if (band === "mid") return [
      L(lang, "Now to the board exam: protect Mathematics and Science marks — they decide which streams remain available.",
              "अब से बोर्ड परीक्षा तक: गणित और विज्ञान के अंक बचाएँ — वही तय करते हैं कौन-सी स्ट्रीम खुली रहेगी।"),
      L(lang, "Next 3 months: talk to one person actually working in each of your top two fields.",
              "अगले 3 महीने: अपने शीर्ष दो क्षेत्रों में काम कर रहे एक-एक व्यक्ति से बात करें।"),
      L(lang, "At results: choose the stream on this report, not on what friends choose.",
              "परिणाम पर: यह रिपोर्ट देखकर स्ट्रीम चुनें, दोस्तों की देखी-देखी नहीं।"),
      L(lang, "Class 11, term 1: start the entrance-exam syllabus alongside school. Starting late is the single most common regret.",
              "कक्षा 11, पहला सत्र: स्कूल के साथ प्रवेश परीक्षा का पाठ्यक्रम शुरू करें। देर से शुरू करना सबसे आम पछतावा है।")
    ];
    return [
      L(lang, "Months 1–3: fix a shortlist of six programmes — two ambitious, three realistic, one certain.",
              "महीने 1–3: छह कार्यक्रमों की सूची तय करें — दो महत्वाकांक्षी, तीन यथार्थवादी, एक निश्चित।"),
      L(lang, "Months 4–6: register for every entrance on that shortlist and put the dates in one place.",
              "महीने 4–6: सूची की हर प्रवेश परीक्षा के लिए पंजीकरण करें और सभी तिथियाँ एक जगह रखें।"),
      L(lang, "Months 7–12: full mock papers under time. Score trends matter more than any single test.",
              "महीने 7–12: समय के साथ पूरे मॉक पेपर। किसी एक परीक्षा से अधिक अंकों की प्रवृत्ति मायने रखती है।"),
      L(lang, "Months 13–18: applications, scholarships and documents. Start the paperwork a month before each deadline.",
              "महीने 13–18: आवेदन, छात्रवृत्तियाँ और दस्तावेज़। हर समय-सीमा से एक महीने पहले काग़ज़ी काम शुरू करें।"),
      L(lang, "Months 19–24: counselling rounds, and a written second option you have already accepted in your mind.",
              "महीने 19–24: काउंसलिंग दौर, और एक लिखित दूसरा विकल्प जिसे आप मन से स्वीकार कर चुके हों।")
    ];
  }

  function fundingLines(p, lang) {
    var out = [];
    if (p.setting === "district" || p.setting === "semi-urban") {
      out.push(L(lang, "National Scholarship Portal (NSP) — the single window for most central scholarships; the window usually opens mid-year and closes before results.",
                       "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) — अधिकांश केंद्रीय छात्रवृत्तियों की एक ही खिड़की; आमतौर पर मध्य वर्ष में खुलती है और परिणाम से पहले बंद।"));
      out.push(L(lang, "Your state's post-matric scholarship and fee-reimbursement scheme — apply through the state portal, separately from NSP.",
                       "आपके राज्य की पोस्ट-मैट्रिक छात्रवृत्ति और शुल्क प्रतिपूर्ति योजना — NSP से अलग, राज्य पोर्टल से आवेदन करें।"));
      out.push(L(lang, "State domicile and rural quotas in professional colleges — these often matter more than the national rank.",
                       "व्यावसायिक कॉलेजों में राज्य निवास और ग्रामीण कोटा — ये अक्सर राष्ट्रीय रैंक से अधिक मायने रखते हैं।"));
      out.push(L(lang, "Hostel and residential support: Eklavya Model Residential Schools, KGBV, state hostels — worth asking about before ruling out a distant college.",
                       "छात्रावास सहायता: एकलव्य आदर्श आवासीय विद्यालय, KGBV, राज्य छात्रावास — दूर के कॉलेज को ख़ारिज करने से पहले पूछें।"));
    } else {
      out.push(L(lang, "Institutional merit and need-based aid — Ashoka, Krea, Azim Premji, IITs and several private universities fund a large share of admitted students.",
                       "संस्थागत मेधा एवं आवश्यकता-आधारित सहायता — कई निजी विश्वविद्यालय और IIT भर्ती छात्रों के बड़े हिस्से को सहायता देते हैं।"));
      out.push(L(lang, "Education loans under the Vidya Lakshmi portal, and the central interest subsidy for eligible families.",
                       "विद्या लक्ष्मी पोर्टल पर शिक्षा ऋण, और पात्र परिवारों हेतु केंद्रीय ब्याज सब्सिडी।"));
    }
    out.push(L(lang, "INSPIRE-SHE for science degrees, and Prime Minister's Research Fellowship later for a research career.",
                     "विज्ञान डिग्री हेतु INSPIRE-SHE, और आगे शोध करियर हेतु प्रधानमंत्री शोध फ़ेलोशिप।"));
    return out;
  }

  /* what changes because of the kind of school the student attends */
  function schoolContext(p, lang) {
    var b = p.boardId, out = [];
    if (b === "nios" || p.learner === "open") {
      out.push(L(lang, "Open-school candidates are eligible for CUET, JEE, NEET and most state CETs. Confirm the subject combination on your certificate matches each exam's eligibility clause before you register — that is the only place open schooling is ever an obstacle.",
                       "मुक्त विद्यालय के अभ्यर्थी CUET, JEE, NEET और अधिकांश राज्य CET के लिए पात्र हैं। पंजीकरण से पहले जाँचें कि आपके प्रमाणपत्र का विषय संयोजन हर परीक्षा की पात्रता शर्त से मेल खाता है।"));
    }
    if (b === "iti" || p.learner === "vocational") {
      out.push(L(lang, "From an ITI or polytechnic the strongest routes are the registered apprenticeship (NAPS), lateral entry into the second year of a diploma or B.Tech, and JEE Main Paper for B.Tech where you hold the required subjects. Each of these keeps you earning while you upgrade.",
                       "ITI या पॉलिटेक्निक से सबसे मज़बूत रास्ते हैं — पंजीकृत अपरेंटिसशिप (NAPS), डिप्लोमा/बी.टेक के दूसरे वर्ष में लेटरल प्रवेश, और आवश्यक विषय होने पर JEE Main। हर रास्ता कमाते हुए आगे बढ़ने देता है।"));
    }
    if (b === "ib" || b === "cambridge" || b === "intl" || p.learner === "international") {
      out.push(L(lang, "An IB or Cambridge profile carries two routes at once: Indian entrances (CUET/JEE/NEET, with an equivalence certificate from AIU) and overseas applications on predicted grades plus SAT or UCAT. Decide which is primary by Class 11 — the preparation calendars collide.",
                       "IB या कैम्ब्रिज प्रोफ़ाइल दो रास्ते साथ रखती है: भारतीय प्रवेश परीक्षाएँ (AIU समकक्षता प्रमाणपत्र सहित) और अनुमानित ग्रेड + SAT/UCAT पर विदेशी आवेदन। कक्षा 11 तक तय करें कौन-सा प्रमुख है — दोनों के कैलेंडर टकराते हैं।"));
    }
    if (b === "kv" || b === "jnv" || b === "sainik") {
      out.push(L(lang, "Your school system carries its own advantages — residential coaching support, national-level competitions and, for Sainik and Navodaya students, established defence and central-service pipelines. Use the alumni network deliberately.",
                       "आपकी विद्यालय प्रणाली के अपने लाभ हैं — आवासीय कोचिंग सहायता, राष्ट्रीय प्रतियोगिताएँ, और सैनिक/नवोदय विद्यार्थियों हेतु रक्षा व केंद्रीय सेवाओं के स्थापित मार्ग। पूर्व-छात्र नेटवर्क का सुनियोजित उपयोग करें।"));
    }
    if (b === "govt") {
      out.push(L(lang, "A state-board government school is a full route to every entrance on this report. Two things need active attention: the NCERT texts used by national entrances, which may differ from your board's books, and the state scholarship portal, which is separate from the national one.",
                       "राज्य बोर्ड का सरकारी विद्यालय इस रिपोर्ट की हर प्रवेश परीक्षा तक पूरा रास्ता है। दो बातों पर ध्यान दें: राष्ट्रीय परीक्षाओं में प्रयुक्त NCERT पुस्तकें, जो आपके बोर्ड से भिन्न हो सकती हैं; और राज्य छात्रवृत्ति पोर्टल, जो राष्ट्रीय से अलग है।"));
    }
    if (b === "madrasa" || b === "gurukul") {
      out.push(L(lang, "Check that your certificate is recognised by the relevant state board or AIU for the entrances you plan to sit. Where a bridge or equivalence certificate is required, apply for it a full year before the exam — the process is routine but slow.",
                       "जाँचें कि जिन परीक्षाओं में बैठना है, उनके लिए आपका प्रमाणपत्र संबंधित राज्य बोर्ड या AIU द्वारा मान्य है। समकक्षता प्रमाणपत्र आवश्यक हो तो परीक्षा से पूरा एक वर्ष पहले आवेदन करें।"));
    }
    if (p.learner === "repeater") {
      out.push(L(lang, "You have finished Class 12, so this report is a calibration, not a discovery. Treat the shortlist as a decision to be made in this admission cycle, and check the upper age limit on every entrance you list.",
                       "आप कक्षा 12 पूरी कर चुके हैं, इसलिए यह रिपोर्ट अंशांकन है, खोज नहीं। सूची को इसी प्रवेश चक्र का निर्णय मानें, और हर परीक्षा की अधिकतम आयु सीमा जाँचें।"));
    }
    if (!out.length) {
      out.push(L(lang, "Every entrance in this report is open to your school and board. What decides the outcome is the preparation calendar, not the school's name.",
                       "इस रिपोर्ट की हर प्रवेश परीक्षा आपके विद्यालय और बोर्ड के लिए खुली है। परिणाम विद्यालय के नाम से नहीं, तैयारी के कैलेंडर से तय होता है।"));
    }
    return out;
  }

  function watchOuts(result, p, apt, lang) {
    var out = [];
    var t = result.tracks || [];
    if (result.confidence === "close" || (result.separation != null && result.separation < 6)) {
      out.push(L(lang,
        "Your top two fields are close together. Read both sections before deciding — this result narrows the choice, it does not make it for you.",
        "आपके शीर्ष दो क्षेत्र बहुत क़रीब हैं। निर्णय से पहले दोनों खंड पढ़ें — यह परिणाम विकल्प सीमित करता है, आपके लिए चुनता नहीं।"));
    }
    if (result.blocked && result.blocked.length) {
      var names = result.blocked.slice(0, 3).map(function (b) {
        return (b.track && b.track.name && (lang === "hi" ? (b.track.name.hi || b.track.name.en) : b.track.name.en)) || "";
      }).filter(Boolean).join(", ");
      if (names) out.push(L(lang,
        "Fields left out because of your declared subjects: " + names + ". They are not ruled out for life — a subject change or a bridging route can reopen them, but not without cost.",
        "आपके घोषित विषयों के कारण छोड़े गए क्षेत्र: " + names + "। ये जीवन भर के लिए बंद नहीं हैं — विषय परिवर्तन या ब्रिजिंग मार्ग इन्हें खोल सकता है, पर बिना क़ीमत के नहीं।"));
    }
    if (apt && apt.best && apt.worst && (apt.best.pct - apt.worst.pct) >= 30) {
      out.push(L(lang,
        "Your reasoning profile is uneven: " + apt.best.label.toLowerCase() + " is well ahead of " + apt.worst.label.toLowerCase() +
        ". Entrance tests are scored on the total, so the weaker one costs you more marks than the stronger one earns.",
        "आपकी तर्क-क्षमता असमान है: " + apt.best.label + " , " + apt.worst.label + " से काफ़ी आगे है। प्रवेश परीक्षाएँ कुल अंक पर चलती हैं, इसलिए कमज़ोर हिस्सा जितना घटाता है, मज़बूत उतना जोड़ नहीं पाता।"));
    }
    var ds = result.dimScores || {};
    if ((ds.aptitude || 0) < 50 && (ds.interest || 0) >= 70) {
      out.push(L(lang,
        "Interest is running ahead of measured reasoning today. That is a common and workable position at your stage — but it means the entrance test, not the choice of field, is the thing to work on this year.",
        "आज रुचि, मापी गई तर्क-क्षमता से आगे है। आपकी अवस्था में यह सामान्य और सुधार-योग्य है — पर इसका अर्थ है कि इस वर्ष क्षेत्र का चुनाव नहीं, प्रवेश परीक्षा ही काम करने की चीज़ है।"));
    }
    if (t.length && t[0].pct != null && t[0].pct < 60) {
      out.push(L(lang,
        "No field scored strongly. That usually means the answers were spread evenly rather than that nothing fits — a re-attempt after a term of exposure is likely to sharpen this considerably.",
        "किसी भी क्षेत्र का स्कोर मज़बूत नहीं रहा। आमतौर पर इसका अर्थ है कि उत्तर समान रूप से बँटे थे, न कि कुछ भी उपयुक्त नहीं — एक सत्र के अनुभव के बाद दोबारा प्रयास इसे स्पष्ट कर देगा।"));
    }
    out.push(L(lang,
      "All figures in this report are indicative and derived from your answers today. They are a starting point for a conversation with your family and teachers, not a verdict on what you can become.",
      "इस रिपोर्ट के सभी आँकड़े सांकेतिक हैं और आज के आपके उत्तरों से निकले हैं। ये परिवार और शिक्षकों से बातचीत की शुरुआत हैं, आप क्या बन सकते हैं इसका फ़ैसला नहीं।"));
    return out;
  }

  /* What the student's mathematics course actually permits.
     Sourced from the CBSE FAQ on Applied Mathematics (241) and the
     UGC advisory of September 2021, which asked universities to treat
     241 at par with 041 for humanities and commerce admissions —
     explicitly not for engineering, mathematics or physical sciences.
     The advisory is guidance to universities, not a binding rule, so
     the report says "verify" rather than "you are eligible".        */
  function mathsNote(track, top, lang) {
    if (track === "core-041") {
      return { tone: "ok", lines: [ L(lang,
        "You are on Core Mathematics (041). Nothing in this report is closed to you on subject grounds — 041 is the course that keeps engineering, BSc Mathematics, Statistics and the quantitative finance routes open alongside every commerce degree.",
        "आप कोर गणित (041) पर हैं। विषय के आधार पर इस रिपोर्ट में कुछ भी बंद नहीं है — 041 वही पाठ्यक्रम है जो हर वाणिज्य डिग्री के साथ-साथ इंजीनियरिंग, बीएससी गणित, सांख्यिकी और मात्रात्मक वित्त के रास्ते खुले रखता है।") ] };
    }
    if (track !== "applied-241") return null;
    var lines = [ L(lang,
      "You are on Applied Mathematics (241). For B.Com, BBA, most Economics programmes and the professional routes (CA, CS, CMA) this is a fully accepted subject — the UGC advised universities in 2021 to treat it at par with Mathematics when calculating aggregate marks for commerce and humanities admissions.",
      "आप एप्लाइड गणित (241) पर हैं। बी.कॉम, बीबीए, अधिकांश अर्थशास्त्र कार्यक्रमों और व्यावसायिक मार्गों (CA, CS, CMA) के लिए यह पूर्णतः स्वीकृत विषय है — UGC ने 2021 में विश्वविद्यालयों को सलाह दी थी कि वाणिज्य एवं मानविकी प्रवेश में कुल अंक गणना हेतु इसे गणित के समकक्ष माना जाए।") ];
    lines.push(L(lang,
      "Three things that advisory does not cover, and that you should plan around: it was scoped to humanities and commerce, not to engineering, mathematics or the physical sciences; it is guidance to universities and not a binding rule, so individual colleges still publish their own criteria; and CBSE states that 041 and 241 are different courses and one is not a substitute for the other, so you cannot switch between them later.",
      "उस सलाह में तीन बातें शामिल नहीं हैं: यह मानविकी और वाणिज्य तक सीमित थी, इंजीनियरिंग/गणित/भौतिक विज्ञान तक नहीं; यह विश्वविद्यालयों हेतु सलाह है, बाध्यकारी नियम नहीं — कॉलेज अपनी शर्तें रखते हैं; और CBSE के अनुसार 041 व 241 अलग पाठ्यक्रम हैं, एक दूसरे का विकल्प नहीं, इसलिए बाद में बदला नहीं जा सकता।"));
    var blocked = (NEWAGE[top.id] || []).filter(function (c) { return c.needs === "041"; });
    if (blocked.length) {
      lines.push(L(lang,
        "In your strongest field this matters directly. These routes generally require Core Mathematics: " +
        blocked.map(function (c) { return c.n; }).join("; ") + ".",
        "आपके सबसे मज़बूत क्षेत्र में यह सीधे मायने रखता है। इन मार्गों के लिए सामान्यतः कोर गणित आवश्यक है: " +
        blocked.map(function (c) { return c.n; }).join("; ") + "।"));
    }
    lines.push(L(lang,
      "If any of those is where you actually want to go, the time to move to Core Mathematics is now, in Class 11 — not after the board exam, when it cannot be done. Confirm the requirement on the institution's own admission page before you decide either way.",
      "यदि आप वास्तव में उन्हीं में से किसी की ओर जाना चाहते हैं, तो कोर गणित पर जाने का समय अभी है — कक्षा 11 में, बोर्ड परीक्षा के बाद नहीं, तब यह संभव नहीं होगा। निर्णय से पहले संस्थान के अपने प्रवेश पृष्ठ पर शर्त की पुष्टि करें।"));
    return { tone: "warn", lines: lines };
  }

  /* ---- rendering -------------------------------------------------- */
  function reactH(R) {
    if (typeof R === "function") return R;
    if (R && typeof R.createElement === "function") return R.createElement.bind(R);
    return null;
  }

  function head(h, text) {
    return h("div", { className: "sans", style: { fontSize: 12, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: ".08em", color: P.cardinal,
      marginTop: 20, marginBottom: 6 } }, text);
  }
  function para(h, text, key) {
    return h("p", { key: key, className: "sans", style: { fontSize: 13.5, color: P.ink,
      lineHeight: 1.65, marginTop: 6 } }, text);
  }

  function barRow(h, label, pct, key) {
    return h("div", { key: key, style: { marginTop: 8, breakInside: "avoid" } },
      h("div", { className: "sans", style: { display: "flex", justifyContent: "space-between",
        fontSize: 12.5, color: P.ink, fontWeight: 600 } },
        h("span", null, label), h("span", null, pct + "%")),
      h("div", { style: { height: 7, background: P.fog, marginTop: 3 } },
        h("div", { style: { height: 7, width: Math.max(2, Math.min(100, pct)) + "%",
          background: pct >= 70 ? P.cardinal : pct >= 50 ? P.gold : P.hairline } })));
  }

  function courseRows(h, list, lang) {
    return list.map(function (c, i) {
      return h("div", { key: c.n, style: { border: "1px solid " + P.hairline,
          borderLeft: "4px solid " + (i === 0 ? P.gold : P.hairline),
          padding: "10px 14px", marginTop: 8, background: "#fff", breakInside: "avoid" } },
        h("div", { className: "serif", style: { fontSize: 15.5, fontWeight: 700, color: P.ink } }, c.n),
        h("div", { className: "sans", style: { fontSize: 12.5, color: P.grey, marginTop: 4, lineHeight: 1.6 } },
          L(lang, "Blends: ", "संयोजन: ") + c.b + "  ·  " +
          L(lang, "Route: ", "मार्ग: ") + c.r),
        h("div", { className: "sans", style: { fontSize: 12, color: P.grey, marginTop: 2 } },
          L(lang, "Offered at (indicative): ", "कहाँ उपलब्ध (सांकेतिक): ") + c.w),
        c.needs === "041"
          ? h("div", { className: "sans", style: { fontSize: 12, fontWeight: 700, color: P.cardinal, marginTop: 4 } },
              L(lang, "Requires Core Mathematics (041)", "कोर गणित (041) आवश्यक"))
          : c.needs === "041-pref"
            ? h("div", { className: "sans", style: { fontSize: 12, color: P.cardinal, marginTop: 4 } },
                L(lang, "Core Mathematics (041) preferred — check the institution",
                        "कोर गणित (041) वांछित — संस्थान से जाँचें"))
            : null);
    });
  }

  function eliteStreamBlock(R, opts) {
    var h = reactH(R);
    opts = opts || {};
    var lang = opts.lang === "hi" ? "hi" : "en";
    var result = opts.result;
    var base = null;
    try { base = origStreamBlock ? origStreamBlock(R, opts) : null; } catch (e) { base = null; }
    if (!h || !result || !result.tracks || !result.tracks.length) return base;

    var p = profile(window.__dishaUser);
    var band = classBand(p.klass || opts.klass);
    var top = result.tracks[0];
    var alt = result.tracks[1] || null;
    var ds = result.dimScores || {};
    var apt = aptRead(result.aptPct, lang, band);
    var lift = SETTING_LIFT[p.setting] != null ? SETTING_LIFT[p.setting] : 3;

    var dims = [
      { k: "interest",    en: "Interest",     hi: "रुचि" },
      { k: "aptitude",    en: "Aptitude",     hi: "योग्यता" },
      { k: "personality", en: "Personality",  hi: "व्यक्तित्व" },
      { k: "orientation", en: "Aspiration",   hi: "आकांक्षा" },
      { k: "eq",          en: "Learning & EQ",hi: "अधिगम एवं भावनात्मक बुद्धि" }
    ];

    var courses = NEWAGE[top.id] || NEWAGE.eng;
    var altCourses = alt ? (NEWAGE[alt.id] || []) : [];

    var sections = [];

    /* ---- banner ---- */
    sections.push(h("div", { key: "elite-head", style: { borderTop: "3px solid " + P.cardinal,
        borderBottom: "1px solid " + P.hairline, padding: "14px 0", marginTop: 8 } },
      h("div", { className: "sans", style: { fontSize: 11, fontWeight: 700, letterSpacing: ".16em",
        textTransform: "uppercase", color: P.gold } },
        L(lang, "DISHA Elite Assessment", "DISHA एलीट मूल्यांकन")),
      h("h2", { className: "serif", style: { fontSize: 23, margin: "6px 0 0", color: P.ink } },
        L(lang, "Profile, fit and the routes built for it", "प्रोफ़ाइल, अनुकूलता और उसके लिए बने रास्ते")),
      h("div", { className: "sans", style: { fontSize: 12.5, color: P.grey, marginTop: 6, lineHeight: 1.6 } },
        [p.klass || "", p.boardLabel, p.stream || L(lang, "stream not declared", "स्ट्रीम घोषित नहीं"),
         p.city || ""].filter(Boolean).join("  ·  "))));

    /* ---- 5-D profile and bands ---- */
    sections.push(head(h, L(lang, "Your 5-D profile", "आपकी 5-D प्रोफ़ाइल")));
    sections.push(h("div", { key: "elite-dims" }, dims.map(function (d) {
      var pct = Math.round(ds[d.k] || 0);
      return barRow(h, L(lang, d.en, d.hi) + " · " + L(lang, bandFor(pct).label, bandFor(pct).hi), pct, d.k);
    })));
    var overall = Math.round((dims.reduce(function (a, d) { return a + (ds[d.k] || 0); }, 0)) / dims.length);
    sections.push(para(h, L(lang,
      "Read across the whole cohort, this profile sits in the " + bandFor(overall).label.toLowerCase() +
      " band. Compared with students in a similar school setting, it reads closer to " +
      bandFor(Math.min(99, overall + lift)).label.toLowerCase() +
      ". Both readings are indicative — they are derived from your answers today, not from a national ranked sample.",
      "पूरे समूह की तुलना में यह प्रोफ़ाइल “" + bandFor(overall).hi + "” श्रेणी में है। समान विद्यालय-परिवेश के विद्यार्थियों की तुलना में यह “" +
      bandFor(Math.min(99, overall + lift)).hi + "” के अधिक निकट पढ़ी जाती है। दोनों आकलन सांकेतिक हैं।"), "elite-band"));

    /* ---- reasoning profile ---- */
    sections.push(head(h, L(lang, "Reasoning profile — the entrance-test view",
                                  "तर्क-क्षमता प्रोफ़ाइल — प्रवेश परीक्षा की दृष्टि")));
    sections.push(h("div", { key: "elite-apt" }, apt.rows.map(function (r) {
      return barRow(h, r.label, r.pct, "apt-" + r.k);
    })));
    sections.push(para(h, L(lang,
      "Your strongest reasoning is " + apt.best.label.toLowerCase() + " and your weakest is " +
      apt.worst.label.toLowerCase() + ". This block was drawn at " +
      (band === "senior" ? "CUET-UG General Test and SAT difficulty"
                         : "foundation difficulty for your class") +
      ", so it is a fair early indicator of how those papers will feel — not a predicted score.",
      "आपकी सबसे मज़बूत तर्क-क्षमता " + apt.best.label + " और सबसे कमज़ोर " + apt.worst.label + " है। यह खंड " +
      (band === "senior" ? "CUET-UG सामान्य परीक्षा और SAT स्तर" : "आपकी कक्षा के आधारभूत स्तर") +
      " पर तैयार किया गया है, इसलिए यह उन पेपरों के अनुभव का प्रारंभिक संकेत है — अनुमानित स्कोर नहीं।"), "elite-apt-note"));

    /* ---- recommendation ---- */
    sections.push(head(h, L(lang, "Recommendation", "अनुशंसा")));
    sections.push(para(h, L(lang,
      "Primary field: " + top.name.en + (top.pct != null ? " (" + top.pct + "% fit)" : "") + ". " +
      (top.fit && top.fit.en ? top.fit.en : ""),
      "प्रमुख क्षेत्र: " + (top.name.hi || top.name.en) + (top.pct != null ? " (" + top.pct + "% अनुकूलता)" : "") + ". " +
      (top.fit && top.fit.hi ? top.fit.hi : "")), "elite-primary"));
    if (alt) {
      sections.push(para(h, L(lang,
        "Alternate field: " + alt.name.en + (alt.pct != null ? " (" + alt.pct + "% fit)" : "") +
        ". Prefer this one if the entrance route to your primary field does not open on the first attempt, or if the length of study there does not suit your family's plans.",
        "वैकल्पिक क्षेत्र: " + (alt.name.hi || alt.name.en) + (alt.pct != null ? " (" + alt.pct + "% अनुकूलता)" : "") +
        "। यदि प्रमुख क्षेत्र का प्रवेश-मार्ग पहले प्रयास में न खुले, या वहाँ की पढ़ाई की अवधि परिवार की योजना से मेल न खाए, तो इसे चुनें।"), "elite-alt"));
    }

    /* ---- mathematics track ---- */
    var mt = mathsNote(mathsTrack(window.__dishaUser), top, lang);
    if (mt) {
      sections.push(head(h, L(lang, "Your mathematics course, and what it permits",
                                    "आपका गणित पाठ्यक्रम और वह क्या अनुमति देता है")));
      mt.lines.forEach(function (t, i) { sections.push(para(h, t, "mt" + i)); });
    }

    /* ---- the existing full path list ---- */
    if (base) sections.push(h("div", { key: "elite-base" }, base));

    /* ---- new-age interdisciplinary courses ---- */
    sections.push(head(h, L(lang, "New-age interdisciplinary programmes for this profile",
                                  "इस प्रोफ़ाइल के लिए नए दौर के अंतर-विषयक कार्यक्रम")));
    sections.push(para(h, L(lang,
      "The degrees below did not exist in their present form when most parents chose theirs. Each one sits between two older subjects, and that is exactly where the hiring is moving. Institutions are indicative — verify the current intake, fee and eligibility on the institution's own site before you plan around any of them.",
      "नीचे दी गई डिग्रियाँ अपने वर्तमान रूप में तब मौजूद नहीं थीं जब अधिकांश अभिभावकों ने अपनी चुनी थी। हर एक दो पुराने विषयों के बीच है, और नियुक्तियाँ ठीक उसी ओर बढ़ रही हैं। संस्थान सांकेतिक हैं — योजना बनाने से पहले संस्थान की अपनी वेबसाइट पर वर्तमान सीट, शुल्क और पात्रता जाँचें।"), "elite-newage-note"));
    sections.push(h("div", { key: "elite-newage" }, courseRows(h, courses, lang)));
    if (alt && altCourses.length) {
      sections.push(para(h, L(lang,
        "If you take the alternate field instead, the equivalent new-age routes there are:",
        "यदि आप वैकल्पिक क्षेत्र चुनते हैं, तो वहाँ के समकक्ष नए दौर के मार्ग हैं:"), "elite-alt-newage-note"));
      sections.push(h("div", { key: "elite-alt-newage" }, courseRows(h, altCourses.slice(0, 3), lang)));
    }

    /* ---- signature moves ---- */
    sections.push(head(h, L(lang, "Five moves that would change this profile most",
                                  "पाँच क़दम जो इस प्रोफ़ाइल को सबसे अधिक बदलेंगे")));
    sections.push(h("ol", { key: "elite-moves", className: "sans",
        style: { fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20, marginTop: 4, color: P.ink } },
      signatureMoves(top.id, p, apt, lang).map(function (m, i) {
        return h("li", { key: "mv" + i, style: { marginBottom: 4 } }, m);
      })));

    /* ---- 24-month roadmap ---- */
    sections.push(head(h, L(lang, "Your next 24 months", "आपके अगले 24 महीने")));
    sections.push(h("ol", { key: "elite-road", className: "sans",
        style: { fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20, marginTop: 4, color: P.ink } },
      roadmap(band, lang).map(function (m, i) {
        return h("li", { key: "rd" + i, style: { marginBottom: 4 } }, m);
      })));

    /* ---- school context ---- */
    sections.push(head(h, L(lang, "What your school and board mean for this plan",
                                  "आपके विद्यालय और बोर्ड का इस योजना पर क्या असर है")));
    schoolContext(p, lang).forEach(function (t, i) { sections.push(para(h, t, "sc" + i)); });

    /* ---- funding ---- */
    sections.push(head(h, L(lang, "Paying for it", "इसका ख़र्च कैसे उठाएँ")));
    sections.push(h("ul", { key: "elite-fund", className: "sans",
        style: { fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20, marginTop: 4, color: P.ink } },
      fundingLines(p, lang).map(function (m, i) { return h("li", { key: "fd" + i }, m); })));

    /* ---- watch-outs ---- */
    sections.push(head(h, L(lang, "Watch-outs — read these before deciding",
                                  "सावधानियाँ — निर्णय से पहले पढ़ें")));
    sections.push(h("ul", { key: "elite-watch", className: "sans",
        style: { fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20, marginTop: 4, color: P.grey } },
      watchOuts(result, p, apt, lang).map(function (m, i) { return h("li", { key: "wo" + i }, m); })));

    return h("div", { key: "disha-elite-report", className: "dp-elite", style: { marginTop: 26 } }, sections);
  }

  /* ================================================================
     7. INSTALL
     ================================================================ */
  function install() {
    if (!window.DISHA_ASSESS) return;
    A = window.DISHA_ASSESS;
    if (!A.__elite) {
      origSelect = typeof A.select === "function" ? A.select : origSelect;
      origStreamBlock = typeof A.streamBlock === "function" ? A.streamBlock : origStreamBlock;
      A.select = select;
      A.served = served;
      A.streamBlock = eliteStreamBlock;
      A.elite = { profile: profile, attempts: attempts, admin: openAdmin, newAge: NEWAGE };
      A.__elite = true;
    }
    installGate();
    mountLauncher();
  }

  install();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  }
  setInterval(function () { try { install(); } catch (e) {} }, 2000);

  /* ?attempts=1 opens the console straight away for a signed-in admin */
  try {
    if (/[?&]attempts=1/.test(location.search)) {
      setTimeout(function () { openAdmin(window.__dishaUser); }, 1200);
    }
  } catch (e) {}

  return {
    profile: profile, setProfile: setOverride,
    aptitudeBank: APT, streamBank: STREAM_ITEMS,
    select: select, served: served, report: eliteStreamBlock,
    attempts: attempts, admin: openAdmin, newAge: NEWAGE,
    codes: { for: codeFor, redeem: redeem, contact: contactKey },
    preflight: preflight, saveDetails: saveDetails,
    maths: { track: mathsTrack, note: mathsNote, options: MATHS_OPTIONS, asked: mathsAsked },
    streams: STREAM_OPTIONS,
    plan: function () { return lastPlan; }
  };
})();
