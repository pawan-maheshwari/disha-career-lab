/* ============================================================
   DISHA Career Lab — country content pack
   UAE
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
window.DISHA_PACKS["UAE"] = {

  /* --- meta ---
     Flag, native-language names, and the word used for a region
     ("state", "province", "emirate"). */
  "meta": {
    "hi": "यूएई",
    "flag": "🇦🇪",
    "region": "emirate",
    "regionHi": "अमीरात",
    "adjEn": "UAE",
    "native": {"code":"ar","label":"العربية","name":"الإمارات","rtl":true,"ready":false}
  },

  /* --- pricing ---
     Locally competitive, tax-inclusive price points — NOT currency
     conversions of each other. full = list price, promo = promo-code price.
     cmp / mkt / cap drive the "what others charge" comparison chart. */
  "pricing": {
    "sym": "AED ",
    "loc": "en",
    "full": 649,
    "promo": 129,
    "usdRate": 3.67,
    "vat": "incl. 5% VAT",
    "cmp": [
      [800,1500],
      [600,1200],
      [1500,3500]
    ],
    "cap": 3500,
    "mkt": [600,3500],
    "typical": 1500,
    "save": 850,
    "inrRate": 24
  },

  /* --- about ---
     Vision and mission shown on the About screen, per language. */
  "about": {
    "mission": {
      "en": "Give every school student in the UAE — Emirati and expatriate alike — a scientific understanding of their strengths and a clear path to a career that fits, across every emirate and curriculum. We help every student identify their interests, choose the right core stream, and follow a clear roadmap to achieve their goals.",
      "hi": "यूएई के हर स्कूल विद्यार्थी को — अमीराती हों या प्रवासी — अपनी ताक़त की वैज्ञानिक समझ और एक स्पष्ट करियर रास्ता देना, हर अमीरात और पाठ्यक्रम में। हम हर विद्यार्थी को अपनी रुचियाँ पहचानने, सही कोर स्ट्रीम चुनने और लक्ष्य तक पहुँचने का स्पष्ट रोडमैप बनाने में मदद करते हैं।"
    },
    "vision": {
      "en": "A UAE where every student discovers their strengths early and chooses a future by interest and aptitude — turning the nation's vision of a knowledge economy into personal opportunity.",
      "hi": "एक ऐसा यूएई जहाँ हर विद्यार्थी अपनी ताक़त जल्दी पहचाने और रुचि व योग्यता से भविष्य चुने — ज्ञान-अर्थव्यवस्था के राष्ट्रीय विज़न को व्यक्तिगत अवसर में बदलते हुए।"
    }
  },

  /* --- dataSource ---
     Attribution line shown under the Top Colleges table. */
  "dataSource": "UAE Ministry of Education / CAA & institution websites (indicative)",

  /* --- map ---
     The country outline (SVG path), the city dots and labels, and the
     Top-10 institutions table. Coordinates are in the viewBox space of "vb". */
  "map": {
    "vb": "0 0 520 360",
    "outline": "M448.8,63.4L454.1,70.5L454.7,119.8L456.2,123.2L453.2,123.9L450,127.6L446.2,133.3L441.2,136.3L437.1,139.7L433,143.9L429.8,144.8L425.1,139.5L422.2,134.1L422.8,132.9L425.1,132.5L426,129.8L424.5,125.6L421.6,124.2L417.8,124L414,125.7L410.2,129.4L407.8,133.2L407.5,140.9L408.7,149.8L408.4,153.9L406.4,159.2L405.8,167L407.2,173L408.4,176.6L408.7,179.5L404.9,189.2L408.1,190.9L418.7,191.6L421.9,198L423.9,202.5L423.4,205.1L415.7,207.1L406.7,209.3L399.9,208.7L387.6,211.5L381.2,216L383.2,218.9L385.3,220.9L386.4,227L384.4,235.4L381.2,243.6L376.8,253.8L371.8,265.5L365,283.1L359.5,297.1L358.9,307L358.9,313.5L358.3,326.6L352.7,333.7L351.6,334L345.1,333.1L343.1,332.8L336.9,332L327.2,330.7L314.9,329L300,327L283.6,324.8L266.3,322.5L248.1,320L230,317.6L212.4,315.2L196,313.1L181.3,311L168.7,309.5L159.4,308.1L153.2,307.3L150.9,307L144.1,306.1L140.3,301.3L135.9,295.4L131.5,289.6L127.1,283.8L122.4,277.9L118,272L113.6,266.2L109,260.3L104.6,254.4L100.2,248.5L95.8,242.8L91.1,236.9L86.7,231L82.3,225.3L77.6,219.4L73.2,213.5L68.8,207.6L65.9,203.7L64.1,199.4L63.8,187.8L63.8,185.3L66.8,180.6L68.2,183.9L71.7,188.4L77.3,187.3L79.9,188.1L82,204L86.1,209.8L91.4,212.1L108.7,213.3L119.2,211.2L140.6,200.8L151.7,196.9L182.5,197.7L207.1,202L245.5,204.5L253.1,203.9L273.6,195.5L286.5,188.1L294.1,185.9L299.1,178.8L302.3,169.5L305.3,163.4L309.1,160.5L312.6,155.3L315.2,146.8L322.6,138.4L351,117.8L367.7,100.3L369.1,94.7L378.5,86.2L385.6,77L419.8,50.5L426.6,39.6L430.7,27.4L431,26.5L433.9,26L438,27.9L438.6,37L437.1,45.7L436.8,54.8L436.2,59.8L439.5,63.8L444.7,65.5L447.1,65.4L448.8,63.4ZM447.4,100.4L448,96.6L447.1,94.5L443.6,94.2L442.1,97.6L441.5,102.5L444.2,102.8L447.4,100.4ZM207.4,187.8L201.3,188.2L196,184.8L207.4,180.3L210.6,178.3L213.9,174.1L216.5,177.7L213.6,183.3L211.5,185.7L207.4,187.8ZM149.1,185L147.6,185.6L146.5,180.8L146.5,179.4L150.3,177.1L152.3,181.1L149.1,185ZM255.8,194.9L255.8,198L247.5,197.1L245.5,198.6L238.5,197.8L232,195.7L236.4,191.9L248.1,187.6L253.1,191.6L255.8,194.9ZM299.7,171.2L298.8,173L296.5,172.9L290.9,171.2L288.9,168.7L292.7,165.7L294.1,165.6L296.5,168.7L299.7,171.2Z",
    "states": null,
    "hubs": [
      ["Abu Dhabi",292.6,170.6],
      ["Al Ain",403.3,192],
      ["Dubai",365.1,103.6],
      ["Sharjah",377.3,90.2],
      ["Ajman",379.7,85.7],
      ["Ras Al Khaimah",419.6,50.9],
      ["Fujairah",451.4,109.8],
      ["Umm Al Quwain",387.9,71.4],
      ["Khalifa City",310.5,173.3],
      ["Academic City (Dubai)",377.3,109.8]
    ],
    "dots": [
      [292.6,170.6],
      [403.3,192],
      [365.1,103.6],
      [377.3,90.2],
      [379.7,85.7],
      [419.6,50.9],
      [451.4,109.8],
      [387.9,71.4],
      [310.5,173.3],
      [377.3,109.8]
    ],
    "cols": [
      ["Khalifa University","Abu Dhabi","https://www.ku.ac.ae","EmSAT (high)","Highly selective"],
      ["United Arab Emirates University (UAEU)","Al Ain","https://www.uaeu.ac.ae","EmSAT","Selective"],
      ["American University of Sharjah (AUS)","Sharjah","https://www.aus.edu","EmSAT / SAT / IELTS","Selective"],
      ["Zayed University","Dubai / Abu Dhabi","https://www.zu.ac.ae","EmSAT","Selective"],
      ["NYU Abu Dhabi","Abu Dhabi","https://nyuad.nyu.edu","Holistic (SAT optional)","Highly selective"],
      ["University of Sharjah","Sharjah","https://www.sharjah.ac.ae","EmSAT / high-school %","Selective"],
      ["Abu Dhabi University","Abu Dhabi","https://www.adu.ac.ae","EmSAT / IELTS","Open / selective"],
      ["Ajman University","Ajman","https://www.ajman.ac.ae","High-school %","Open / selective"],
      ["Heriot-Watt University Dubai","Dubai","https://www.hw.ac.uk/dubai","High-school % / IELTS","Selective"],
      ["Higher Colleges of Technology (HCT)","Multi-emirate","https://hct.ac.ae","EmSAT","Open"]
    ],
    "colHeads": ["Entry basis","Selectivity"],
    "name_en": "United Arab Emirates",
    "name_hi": "संयुक्त अरब अमीरात"
  },

  /* --- cutoffs ---
     Ten-year indicative closing-mark series per stream. lowerIsBetter
     is true where a RANK is the cut-off and false where a SCORE is. */
  "cutoffs": [
    {
      "id": "eng",
      "inst": "Khalifa University · Engineering",
      "unit": {"en":"EmSAT Math cut-off (of 2000)","hi":"EmSAT गणित कट-ऑफ़ (2000 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 2000,
      "integer": true,
      "series": [1100,1125,1150,1175,1200,1225,1250,1275,1300,1325]
    },
    {
      "id": "med",
      "inst": "UAEU CMHS · MBBS",
      "unit": {"en":"High-school average % cut-off","hi":"हाई-स्कूल औसत % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [92,92.5,93,93.5,94,94.5,95,95,95.5,96]
    },
    {
      "id": "def",
      "inst": "Zayed II Military College",
      "unit": {"en":"Admission composite (of 100)","hi":"प्रवेश कंपोज़िट (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [68,69,70,71,72,73,74,75,76,77]
    },
    {
      "id": "teach",
      "inst": "ECAE Abu Dhabi · B.Ed",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [74,74.5,75,75.5,76,77,77.5,78,79,80]
    },
    {
      "id": "com",
      "inst": "UAEU · BBA",
      "unit": {"en":"EmSAT English cut-off (of 2000)","hi":"EmSAT अंग्रेज़ी कट-ऑफ़ (2000 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 2000,
      "integer": true,
      "series": [1075,1100,1125,1150,1175,1200,1210,1225,1240,1250]
    },
    {
      "id": "agri",
      "inst": "UAEU · Agriculture & Food",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [70,70.5,71,72,72.5,73,74,74.5,75,76]
    },
    {
      "id": "trade",
      "inst": "HCT · Applied Diploma",
      "unit": {"en":"EmSAT English cut-off (of 2000)","hi":"EmSAT अंग्रेज़ी कट-ऑफ़ (2000 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 2000,
      "integer": true,
      "series": [925,950,975,1000,1010,1025,1040,1050,1065,1075]
    },
    {
      "id": "civil",
      "inst": "UAEU · College of Law",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [80,80.5,81,82,83,84,85,85.5,86,87]
    },
    {
      "id": "sci",
      "inst": "UAEU · B.Sc (Science)",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [78,78.5,79,79.5,80,81,82,82.5,83,84]
    },
    {
      "id": "it",
      "inst": "Khalifa University · CS",
      "unit": {"en":"EmSAT Math cut-off (of 2000)","hi":"EmSAT गणित कट-ऑफ़ (2000 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 2000,
      "integer": true,
      "series": [1150,1175,1200,1225,1250,1275,1300,1325,1350,1375]
    },
    {
      "id": "creative",
      "inst": "Zayed University · Design",
      "unit": {"en":"Portfolio + % composite (of 100)","hi":"पोर्टफोलियो + % कंपोज़िट"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [70,70,71,72,73,74,75,75,76,77]
    },
    {
      "id": "arts",
      "inst": "AUS · BA (Arts)",
      "unit": {"en":"Composite % (school + English)","hi":"कंपोज़िट % (स्कूल + अंग्रेज़ी)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [75,75.5,76,77,77.5,78,79,79.5,80,81]
    },
    {
      "id": "dental",
      "inst": "University of Sharjah · BDS",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [90,90.5,91,91.5,92,93,93.5,94,94.5,95]
    },
    {
      "id": "fashion",
      "inst": "ESMOD Dubai · Fashion Design",
      "unit": {"en":"Portfolio composite (of 100)","hi":"पोर्टफोलियो कंपोज़िट (100 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [65,65,66,67,68,69,70,70,71,72]
    },
    {
      "id": "socsci",
      "inst": "Zayed University · Psychology",
      "unit": {"en":"High-school % cut-off","hi":"हाई-स्कूल % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [74,74.5,75,75.5,76,77,77.5,78,79,80]
    }
  ],

  /* --- colleges ---
     Stream-wise college lists for the Top Colleges page.
     official:false makes the site label the list "indicative". */
  "colleges": {
    "eng": {
      "src": "Indicative · Engineering (UAE)",
      "official": false,
      "list": [
        ["Khalifa University","Abu Dhabi"],
        ["UAEU College of Engineering","Al Ain"],
        ["American University of Sharjah","Sharjah"],
        ["University of Sharjah","Sharjah"],
        ["Abu Dhabi University","Abu Dhabi"],
        ["RIT Dubai","Dubai"],
        ["Heriot-Watt University Dubai","Dubai"],
        ["Ajman University","Ajman"]
      ]
    },
    "med": {
      "src": "Indicative · Medicine (UAE)",
      "official": false,
      "list": [
        ["UAEU College of Medicine (CMHS)","Al Ain"],
        ["Khalifa University · Medicine","Abu Dhabi"],
        ["MBRU College of Medicine","Dubai"],
        ["University of Sharjah · Medicine","Sharjah"],
        ["Gulf Medical University","Ajman"],
        ["RAK Medical & Health Sciences Univ.","Ras Al Khaimah"]
      ]
    },
    "def": {
      "src": "Indicative · Defence (UAE)",
      "official": false,
      "list": [
        ["Zayed II Military College","Al Ain"],
        ["Khalifa bin Zayed Air College","Al Ain"],
        ["Rashid bin Saeed Al Maktoum Naval College","Abu Dhabi"],
        ["Police Colleges (Abu Dhabi / Dubai / Sharjah)","Multi-emirate"]
      ]
    },
    "teach": {
      "src": "Indicative · Teaching (UAE)",
      "official": false,
      "list": [
        ["Emirates College for Advanced Education","Abu Dhabi"],
        ["UAEU College of Education","Al Ain"],
        ["Zayed University · Education","Dubai"],
        ["Al Qasimia University","Sharjah"]
      ]
    },
    "com": {
      "src": "Indicative · Business (UAE)",
      "official": false,
      "list": [
        ["UAEU College of Business & Economics","Al Ain"],
        ["AUS School of Business","Sharjah"],
        ["Zayed University · Business","Dubai"],
        ["University of Dubai","Dubai"],
        ["Abu Dhabi School of Management","Abu Dhabi"],
        ["Canadian University Dubai","Dubai"]
      ]
    },
    "agri": {
      "src": "Indicative · Agriculture & Food (UAE)",
      "official": false,
      "list": [
        ["UAEU · Agriculture & Veterinary Medicine","Al Ain"],
        ["Higher Colleges of Technology · Applied","Multi-emirate"]
      ]
    },
    "trade": {
      "src": "Indicative · Vocational (UAE)",
      "official": false,
      "list": [
        ["Higher Colleges of Technology","Multi-emirate"],
        ["ADVETI","Abu Dhabi"],
        ["Fatima College of Health Sciences","Abu Dhabi"],
        ["National Institute for Vocational Education","Dubai"]
      ]
    },
    "civil": {
      "src": "Indicative · Law & Public Policy (UAE)",
      "official": false,
      "list": [
        ["UAEU College of Law","Al Ain"],
        ["University of Sharjah · Law","Sharjah"],
        ["Zayed University · Humanities & Social Sci.","Dubai"],
        ["AUS International Studies","Sharjah"]
      ]
    },
    "sci": {
      "src": "Indicative · Science (UAE)",
      "official": false,
      "list": [
        ["UAEU College of Science","Al Ain"],
        ["Khalifa University · Science","Abu Dhabi"],
        ["NYU Abu Dhabi","Abu Dhabi"],
        ["AUS College of Arts & Sciences","Sharjah"],
        ["University of Sharjah · Sciences","Sharjah"]
      ]
    },
    "it": {
      "src": "Indicative · IT & Computing (UAE)",
      "official": false,
      "list": [
        ["Khalifa University · Computer Science","Abu Dhabi"],
        ["UAEU College of IT","Al Ain"],
        ["University of Wollongong in Dubai","Dubai"],
        ["BITS Pilani Dubai Campus","Dubai"],
        ["Heriot-Watt University Dubai","Dubai"],
        ["Amity University Dubai","Dubai"]
      ]
    },
    "creative": {
      "src": "Indicative · Design & Arts (UAE)",
      "official": false,
      "list": [
        ["AUS College of Architecture, Art & Design","Sharjah"],
        ["Zayed University · Arts & Creative Enterprises","Dubai"],
        ["Dubai Institute of Design & Innovation (DIDI)","Dubai"],
        ["American University in Dubai · Visual Comm.","Dubai"]
      ]
    },
    "arts": {
      "src": "Indicative · Arts & Humanities (UAE)",
      "official": false,
      "list": [
        ["NYU Abu Dhabi","Abu Dhabi"],
        ["AUS · English & International Studies","Sharjah"],
        ["Zayed University","Dubai"],
        ["American University in Dubai","Dubai"]
      ]
    },
    "dental": {
      "src": "Indicative · Dental (UAE)",
      "official": false,
      "list": [
        ["University of Sharjah · Dental Medicine","Sharjah"],
        ["Ajman University · Dentistry","Ajman"],
        ["RAK College of Dental Sciences","Ras Al Khaimah"],
        ["Gulf Medical University","Ajman"]
      ]
    },
    "fashion": {
      "src": "Indicative · Fashion (UAE)",
      "official": false,
      "list": [
        ["ESMOD Dubai","Dubai"],
        ["DIDI","Dubai"],
        ["Amity University Dubai · Fashion Design","Dubai"],
        ["INSD Dubai","Dubai"]
      ]
    },
    "socsci": {
      "src": "Indicative · Social Sciences & Psychology (UAE)",
      "official": false,
      "list": [
        ["UAEU · Humanities & Social Sciences","Al Ain"],
        ["Zayed University · Psychology","Dubai"],
        ["AUS · Psychology / International Studies","Sharjah"],
        ["Heriot-Watt University Dubai · Psychology","Dubai"],
        ["Canadian University Dubai · Psychology","Dubai"]
      ]
    }
  },

  /* --- schools ---
     School-system figures by region, plus the headline facts, the
     public/private split, and the source note printed beneath them. */
  "schools": {
    "byRegion": [
      {"state":"Abu Dhabi","total":450,"single":0},
      {"state":"Dubai","total":320,"single":0},
      {"state":"Sharjah","total":230,"single":0},
      {"state":"Ras Al Khaimah","total":100,"single":0},
      {"state":"Ajman","total":60,"single":0},
      {"state":"Fujairah","total":60,"single":0},
      {"state":"Umm Al Quwain","total":25,"single":0}
    ],
    "facts": {"total":"~1,250","students":"~1.15M","teachers":"~75K","govtPct":"~45%","singleTeacher":"—"},
    "typeSplit": [
      {"name":"Public (MoE / charter)","value":45},
      {"name":"Private / international","value":50},
      {"name":"Other","value":5}
    ],
    "source": "Source: UAE Ministry of Education, ADEK and KHDA open data. Emirate totals are rounded, indicative figures for orientation — verify exact figures on official dashboards."
  }
};
