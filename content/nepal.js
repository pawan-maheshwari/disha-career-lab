/* ============================================================
   DISHA Career Lab — country content pack
   Nepal
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
window.DISHA_PACKS["Nepal"] = {

  /* --- meta ---
     Flag, native-language names, and the word used for a region
     ("state", "province", "emirate"). */
  "meta": {
    "hi": "नेपाल",
    "flag": "🇳🇵",
    "region": "province",
    "regionHi": "प्रदेश",
    "adjEn": "Nepali",
    "native": {"code":"ne","label":"नेपाली","name":"नेपाल","ready":false}
  },

  /* --- pricing ---
     Locally competitive, tax-inclusive price points — NOT currency
     conversions of each other. full = list price, promo = promo-code price.
     cmp / mkt / cap drive the "what others charge" comparison chart. */
  "pricing": {
    "sym": "NPR ",
    "loc": "en-IN",
    "full": 1499,
    "promo": 299,
    "usdRate": 140,
    "vat": "incl. 13% VAT",
    "cmp": [
      [2500,8000],
      [2000,6000],
      [6000,25000]
    ],
    "cap": 25000,
    "mkt": [2500,25000],
    "typical": 6000,
    "save": 4500,
    "inrRate": 0.625
  },

  /* --- about ---
     Vision and mission shown on the About screen, per language. */
  "about": {
    "mission": {
      "en": "Give every school student in Nepal a scientific understanding of their strengths and a clear, affordable path to a career that fits — from the Terai to the mountains, regardless of money, language, or technology. We help every student identify their interests, choose the right core stream, and follow a clear roadmap to achieve their goals.",
      "hi": "नेपाल के हर स्कूल विद्यार्थी को अपनी ताक़त की वैज्ञानिक समझ और एक स्पष्ट, किफ़ायती करियर रास्ता देना — तराई से पहाड़ तक, पैसे, भाषा या तकनीक की परवाह किए बिना। हम हर विद्यार्थी को अपनी रुचियाँ पहचानने, सही कोर स्ट्रीम चुनने और लक्ष्य तक पहुँचने का स्पष्ट रोडमैप बनाने में मदद करते हैं।"
    },
    "vision": {
      "en": "A Nepal where a child's career is shaped by interests and aptitude, not by district or family income — where opportunity is visible from every village and valley.",
      "hi": "एक ऐसा नेपाल जहाँ बच्चे का करियर उसकी रुचि और योग्यता से तय हो, ज़िले या परिवार की आय से नहीं — जहाँ अवसर हर गाँव और घाटी से दिखे।"
    }
  },

  /* --- dataSource ---
     Attribution line shown under the Top Colleges table. */
  "dataSource": "University Grants Commission Nepal & institution websites (indicative)",

  /* --- map ---
     The country outline (SVG path), the city dots and labels, and the
     Top-10 institutions table. Coordinates are in the viewBox space of "vb". */
  "map": {
    "vb": "0 0 520 360",
    "outline": "M490.9,213L493.2,214.8L493.6,217.7L493.2,221L490.7,227.9L488.6,232.9L485.9,243.3L483.6,261.3L484.2,264.5L491.1,274.8L493.6,282.7L494,288.2L491.1,297.3L487.8,307.5L486.1,309.8L484.2,310.6L475.9,307.1L470.1,307.5L463.5,309.6L456.4,309.1L450.8,308L443.5,312.1L436.5,309.8L432.1,307.3L429,300.1L427.7,299.2L413.2,306.7L409.7,307.2L400.5,303.2L393,299.2L390.3,298.1L383.1,296.5L376.6,295.6L369.6,293L360.8,296.3L357.3,296L354,293.7L352.3,288.9L351.9,284.4L348.8,281.3L344.2,280.6L337.8,283.4L328.4,287.1L325.3,286.4L322.6,285.4L321.6,284.4L320.1,280.2L318.7,279.2L316.6,279L312.7,278L307.9,274.9L293.3,267.4L291.5,264.1L291.5,256.7L290.8,253.7L289,250.5L281.5,247.3L267,242L259.1,237.8L255.1,239.8L247.8,241.6L243.9,245.3L239.1,244.1L227.9,240.2L221.9,239.5L218.1,240.9L217.3,243.2L212.7,245.8L208.4,243.8L199.9,240.9L192.2,239.4L180.8,236L179.5,231L177.4,225.9L174.7,225.1L164.3,226L155,220.5L144.8,213.4L140.5,211.1L137.8,210.2L135.3,211.1L132.4,212.8L129.9,213.2L124.5,210.2L117.4,205.8L108.7,200.5L98.7,193L94.5,188.8L92.7,185.6L90.4,182.5L81.7,177.6L74.6,173.7L66.3,169.1L64.8,168.2L61.7,165.4L57,161.9L52.8,160.9L51.5,162.8L50.7,164.9L47.2,164.4L41.8,160.8L36,157.1L31.6,153.6L27,150.1L26,147.4L27.9,139.4L30.6,132.3L32.9,130.8L36.4,126.2L37.8,118.1L37.6,111.1L41.4,101.4L46.1,91.1L54.7,79.9L58.4,76.3L62.6,73.8L70.2,65.6L71.9,64.2L75.4,62.1L78.8,61.6L81.3,62.6L84,66.8L87.1,70.9L90.8,70.7L95.4,67.3L104.7,51.2L117.8,47.9L130.1,49.6L140.9,51.9L144.2,57.3L146.3,63L147.5,65.8L151,69.1L166.4,77.2L175.4,84.5L187.6,94.2L197,98.4L205.1,98.7L209.6,102.6L216.5,110.1L222.5,118.9L229.8,126.9L234.8,126.6L241.6,124L250.1,120.6L255.1,122.3L259.7,124.6L261.1,128.7L263.8,136.5L267,144.7L271.7,147.6L277.6,151.8L280.7,155.2L291.3,161.2L292.9,163.7L295,165.4L297.7,166.6L299.8,167.8L303.1,168.2L315.6,164.5L318.7,165L320.8,165.7L320.8,167L318.5,172.7L316.6,180.1L318.5,183.8L323.7,185.4L335.1,186.4L350.7,186.4L355.2,190L360,195.6L364.6,205.2L366.5,209.3L369,210.4L372.9,208.8L373.5,204.8L373.7,199L377.1,197L379.3,198.6L381.8,203.1L388.1,207.2L392.8,209.1L397.2,208.5L399.1,206.9L401.1,198.9L404.7,197.8L409,198.3L410.7,199.9L412.6,203.1L417.8,204.6L423.2,206.6L428.2,209.1L435,215.1L443.7,216.2L453.7,216.1L458.9,216.2L462.8,216.7L466.4,216.2L476.6,212L480.7,211.6L485.9,212.2L490.9,213Z",
    "states": null,
    "hubs": [
      ["Cape Town",126.2,312.9],
      ["Stellenbosch",135.6,313.2],
      ["Johannesburg",332.5,124.8],
      ["Pretoria",335.5,113.8],
      ["Durban",396.1,214],
      ["Makhanda",299.9,298],
      ["Potchefstroom",312.1,137.2],
      ["Bellville",130.7,312.4],
      ["Bloemfontein",293.1,195.9],
      ["Pietermaritzburg",382.4,207.6]
    ],
    "dots": [
      [126.2,312.9],
      [135.6,313.2],
      [332.5,124.8],
      [335.5,113.8],
      [396.1,214],
      [299.9,298],
      [312.1,137.2],
      [130.7,312.4],
      [293.1,195.9],
      [382.4,207.6]
    ],
    "cols": [
      ["Tribhuvan University (TU)","Kirtipur, Kathmandu","https://tu.edu.np","TU entrance / merit","Selective"],
      ["IOE Pulchowk Campus","Lalitpur","https://pcampus.edu.np","IOE entrance rank","Highly selective"],
      ["Institute of Medicine (IOM), Maharajgunj","Kathmandu","https://iom.tu.edu.np","MECEE-BL rank","Highly selective"],
      ["Kathmandu University (KU)","Dhulikhel","https://ku.edu.np","KUCAT / CBT","Selective"],
      ["B.P. Koirala Institute of Health Sciences","Dharan","https://bpkihs.edu","MECEE-BL rank","Highly selective"],
      ["Patan Academy of Health Sciences","Lalitpur","https://pahs.edu.np","MECEE-BL rank","Highly selective"],
      ["Pokhara University","Pokhara","https://pu.edu.np","PU entrance","Selective"],
      ["Agriculture & Forestry University","Rampur, Chitwan","https://afu.edu.np","AFU entrance","Selective"],
      ["Purbanchal University","Biratnagar","https://purbuniv.edu.np","PU entrance","Open / selective"],
      ["Nepal Open University","Lalitpur","https://nou.edu.np","Open admission","Open"]
    ],
    "colHeads": ["Entrance","Selectivity"],
    "name_en": "Nepal",
    "name_hi": "नेपाल"
  },

  /* --- cutoffs ---
     Ten-year indicative closing-mark series per stream. lowerIsBetter
     is true where a RANK is the cut-off and false where a SCORE is. */
  "cutoffs": [
    {
      "id": "eng",
      "inst": "IOE Pulchowk · Computer Engg",
      "unit": {"en":"IOE entrance closing rank (regular)","hi":"IOE प्रवेश क्लोज़िंग रैंक"},
      "lowerIsBetter": true,
      "min": 1,
      "integer": true,
      "series": [120,115,110,105,100,96,92,88,85,82]
    },
    {
      "id": "med",
      "inst": "IOM Maharajgunj · MBBS",
      "unit": {"en":"MECEE-BL closing rank (open)","hi":"MECEE-BL क्लोज़िंग रैंक"},
      "lowerIsBetter": true,
      "min": 1,
      "integer": true,
      "series": [95,92,90,88,85,82,80,78,76,74]
    },
    {
      "id": "def",
      "inst": "Nepali Army · Officer Cadet",
      "unit": {"en":"Written cut-off (of 100)","hi":"लिखित कट-ऑफ़ (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [52,54,55,56,58,59,60,61,62,63]
    },
    {
      "id": "teach",
      "inst": "TU Faculty of Education · B.Ed",
      "unit": {"en":"Entrance score (of 100)","hi":"प्रवेश स्कोर (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [42,43,44,45,46,47,48,49,50,51]
    },
    {
      "id": "com",
      "inst": "TU FoM · BBA (CMAT)",
      "unit": {"en":"CMAT cut-off (of 100)","hi":"CMAT कट-ऑफ़ (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [58,59,60,61,62,63,64,65,66,67]
    },
    {
      "id": "agri",
      "inst": "AFU Rampur · B.Sc Agriculture",
      "unit": {"en":"Entrance closing rank","hi":"प्रवेश क्लोज़िंग रैंक"},
      "lowerIsBetter": true,
      "min": 1,
      "integer": true,
      "series": [420,410,400,390,380,370,360,350,345,340]
    },
    {
      "id": "trade",
      "inst": "CTEVT Diploma · Engineering",
      "unit": {"en":"Entrance cut-off (of 100)","hi":"प्रवेश कट-ऑफ़ (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [38,39,40,41,42,43,44,45,46,47]
    },
    {
      "id": "civil",
      "inst": "TU · BA Political Science",
      "unit": {"en":"Merit % (Class 12)","hi":"मेरिट % (कक्षा 12)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [62,63,64,64.5,65,66,67,68,68.5,69]
    },
    {
      "id": "sci",
      "inst": "Amrit Campus · B.Sc Physics",
      "unit": {"en":"Merit % (Class 12)","hi":"मेरिट % (कक्षा 12)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [70,71,72,72.5,73,74,75,76,76.5,77]
    },
    {
      "id": "it",
      "inst": "KU · B.Sc Computer Science",
      "unit": {"en":"KUCAT cut-off (of 100)","hi":"KUCAT कट-ऑफ़ (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [55,56,58,59,60,62,63,64,65,66]
    },
    {
      "id": "creative",
      "inst": "KU School of Arts · Design",
      "unit": {"en":"Portfolio + test (of 100)","hi":"पोर्टफोलियो + टेस्ट (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [50,51,52,53,54,55,56,57,58,59]
    },
    {
      "id": "arts",
      "inst": "Tri-Chandra Campus · BA English",
      "unit": {"en":"Merit % (Class 12)","hi":"मेरिट % (कक्षा 12)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [58,59,60,61,62,63,64,65,65.5,66]
    },
    {
      "id": "dental",
      "inst": "BPKIHS · BDS",
      "unit": {"en":"MECEE-BL closing rank","hi":"MECEE-BL क्लोज़िंग रैंक"},
      "lowerIsBetter": true,
      "min": 1,
      "integer": true,
      "series": [260,255,250,245,240,235,230,226,222,218]
    },
    {
      "id": "fashion",
      "inst": "Namuna College · Fashion Tech",
      "unit": {"en":"Entrance (of 100)","hi":"प्रवेश (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [45,46,47,48,49,50,51,52,53,54]
    },
    {
      "id": "socsci",
      "inst": "TU · BA Psychology",
      "unit": {"en":"Merit % (Class 12)","hi":"मेरिट % (कक्षा 12)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [60,61,62,63,64,65,66,67,67.5,68]
    }
  ],

  /* --- colleges ---
     Stream-wise college lists for the Top Colleges page.
     official:false makes the site label the list "indicative". */
  "colleges": {
    "eng": {
      "src": "Indicative · Engineering (Nepal)",
      "official": false,
      "list": [
        ["IOE Pulchowk Campus","Lalitpur"],
        ["IOE Thapathali Campus","Kathmandu"],
        ["Kathmandu University School of Engineering","Dhulikhel"],
        ["IOE Paschimanchal Campus","Pokhara"],
        ["IOE Purwanchal Campus","Dharan"],
        ["Pokhara University Faculty of Sci. & Tech.","Pokhara"],
        ["Khwopa College of Engineering","Bhaktapur"],
        ["Nepal Engineering College","Changunarayan"]
      ]
    },
    "med": {
      "src": "Indicative · Medicine (Nepal)",
      "official": false,
      "list": [
        ["Institute of Medicine (IOM), Maharajgunj","Kathmandu"],
        ["B.P. Koirala Institute of Health Sciences","Dharan"],
        ["Patan Academy of Health Sciences","Lalitpur"],
        ["KU School of Medical Sciences","Dhulikhel"],
        ["NAMS · Bir Hospital","Kathmandu"],
        ["Nepalese Army Inst. of Health Sciences","Kathmandu"]
      ]
    },
    "def": {
      "src": "Indicative · Defence (Nepal)",
      "official": false,
      "list": [
        ["Nepali Army Officer Cadet School","Kathmandu"],
        ["Military Academy, Kharipati","Bhaktapur"],
        ["Nepal Police Academy","Kathmandu"],
        ["APF Command & Staff College","Kathmandu"]
      ]
    },
    "teach": {
      "src": "Indicative · Teaching (Nepal)",
      "official": false,
      "list": [
        ["TU Faculty of Education","Kirtipur"],
        ["Mahendra Ratna Campus","Kathmandu"],
        ["KU School of Education","Lalitpur"],
        ["Sanothimi Campus","Bhaktapur"]
      ]
    },
    "com": {
      "src": "Indicative · Commerce & Management (Nepal)",
      "official": false,
      "list": [
        ["TU Faculty of Management","Kirtipur"],
        ["Shanker Dev Campus","Kathmandu"],
        ["KU School of Management","Lalitpur"],
        ["Ace Institute of Management","Kathmandu"],
        ["Apex College","Kathmandu"]
      ]
    },
    "agri": {
      "src": "Indicative · Agriculture (Nepal)",
      "official": false,
      "list": [
        ["Agriculture & Forestry University","Rampur, Chitwan"],
        ["TU IAAS Paklihawa Campus","Rupandehi"],
        ["Far Western University · Agriculture","Tikapur"],
        ["Purbanchal University · CNRM","Biratnagar"]
      ]
    },
    "trade": {
      "src": "Indicative · Vocational / CTEVT (Nepal)",
      "official": false,
      "list": [
        ["CTEVT Balaju School of Engg. & Tech.","Kathmandu"],
        ["CTEVT Thapathali Polytechnic","Kathmandu"],
        ["Banepa Polytechnic Institute","Banepa"],
        ["Jiri Technical School","Dolakha"]
      ]
    },
    "civil": {
      "src": "Indicative · Political Science & Civil Service (Nepal)",
      "official": false,
      "list": [
        ["TU Central Dept. of Political Science","Kirtipur"],
        ["Nepal Law Campus","Kathmandu"],
        ["Ratna Rajyalaxmi Campus","Kathmandu"],
        ["Padma Kanya Multiple Campus","Kathmandu"]
      ]
    },
    "sci": {
      "src": "Indicative · Pure Science (Nepal)",
      "official": false,
      "list": [
        ["Amrit Science Campus","Kathmandu"],
        ["TU Central Dept. of Physics","Kirtipur"],
        ["St. Xavier's College","Kathmandu"],
        ["KU School of Science","Dhulikhel"],
        ["Patan Multiple Campus","Lalitpur"]
      ]
    },
    "it": {
      "src": "Indicative · IT & Computing (Nepal)",
      "official": false,
      "list": [
        ["KU Dept. of Computer Science","Dhulikhel"],
        ["IOE Pulchowk · Computer Engg.","Lalitpur"],
        ["Islington College","Kathmandu"],
        ["Deerwalk Institute of Technology","Kathmandu"],
        ["Kathmandu College of Technology","Kathmandu"]
      ]
    },
    "creative": {
      "src": "Indicative · Design & Fine Arts (Nepal)",
      "official": false,
      "list": [
        ["KU School of Arts · Art & Design","Lalitpur"],
        ["Sirjana College of Fine Arts","Kathmandu"],
        ["Lalitkala Campus","Kathmandu"],
        ["KU Dept. of Music","Lalitpur"]
      ]
    },
    "arts": {
      "src": "Indicative · Arts & Humanities (Nepal)",
      "official": false,
      "list": [
        ["TU Central Dept. of English","Kirtipur"],
        ["Tri-Chandra Multiple Campus","Kathmandu"],
        ["Padma Kanya Multiple Campus","Kathmandu"],
        ["St. Xavier's College","Kathmandu"]
      ]
    },
    "dental": {
      "src": "Indicative · Dental (Nepal)",
      "official": false,
      "list": [
        ["BPKIHS College of Dental Surgery","Dharan"],
        ["People's Dental College","Kathmandu"],
        ["Kantipur Dental College","Kathmandu"],
        ["M.B. Kedia Dental College","Birgunj"]
      ]
    },
    "fashion": {
      "src": "Indicative · Fashion (Nepal)",
      "official": false,
      "list": [
        ["Namuna College of Fashion Technology","Kathmandu"],
        ["IEC College of Art & Fashion","Kathmandu"]
      ]
    },
    "socsci": {
      "src": "Indicative · Social Sciences & Psychology (Nepal)",
      "official": false,
      "list": [
        ["TU Central Dept. of Psychology","Kirtipur"],
        ["Tri-Chandra Campus · Psychology","Kathmandu"],
        ["KU School of Arts","Lalitpur"],
        ["Padma Kanya Multiple Campus","Kathmandu"]
      ]
    }
  },

  /* --- schools ---
     School-system figures by region, plus the headline facts, the
     public/private split, and the source note printed beneath them. */
  "schools": {
    "byRegion": [
      {"state":"Bagmati","total":6600,"single":140},
      {"state":"Koshi","total":6300,"single":210},
      {"state":"Lumbini","total":5800,"single":190},
      {"state":"Madhesh","total":4600,"single":160},
      {"state":"Gandaki","total":4300,"single":180},
      {"state":"Sudurpashchim","total":3900,"single":230},
      {"state":"Karnali","total":3600,"single":260}
    ],
    "facts": {"total":"~35,100","students":"~7.0M","teachers":"~280K","govtPct":"~78%","singleTeacher":"~1,370"},
    "typeSplit": [
      {"name":"Community (public)","value":78},
      {"name":"Institutional (private)","value":20},
      {"name":"Other","value":2}
    ],
    "source": "Source: Ministry of Education, Science & Technology (Flash / EMIS reports), Nepal. Province totals and single-teacher counts are rounded, indicative figures for orientation — verify exact district-level data on official dashboards."
  }
};
