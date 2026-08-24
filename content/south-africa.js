/* ============================================================
   DISHA Career Lab — country content pack
   South Africa
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
window.DISHA_PACKS["South Africa"] = {

  /* --- meta ---
     Flag, native-language names, and the word used for a region
     ("state", "province", "emirate"). */
  "meta": {
    "hi": "दक्षिण अफ़्रीका",
    "flag": "🇿🇦",
    "region": "province",
    "regionHi": "प्रांत",
    "adjEn": "South African",
    "native": {"code":"af","label":"Afrikaans","name":"Suid-Afrika","ready":false}
  },

  /* --- pricing ---
     Locally competitive, tax-inclusive price points — NOT currency
     conversions of each other. full = list price, promo = promo-code price.
     cmp / mkt / cap drive the "what others charge" comparison chart. */
  "pricing": {
    "sym": "R ",
    "loc": "en",
    "full": 849,
    "promo": 169,
    "usdRate": 18.5,
    "vat": "incl. 15% VAT",
    "cmp": [
      [1000,2500],
      [800,2000],
      [2500,10000]
    ],
    "cap": 10000,
    "mkt": [800,10000],
    "typical": 2500,
    "save": 1650,
    "inrRate": 4.8
  },

  /* --- about ---
     Vision and mission shown on the About screen, per language. */
  "about": {
    "mission": {
      "en": "Give every learner in South Africa a scientific understanding of their strengths and a clear, funded path to a career that fits — regardless of township, income, language, or technology. We help every student identify their interests, choose the right core stream, and follow a clear roadmap to achieve their goals.",
      "hi": "दक्षिण अफ़्रीका के हर विद्यार्थी को अपनी ताक़त की वैज्ञानिक समझ और एक स्पष्ट, वित्त-पोषित करियर रास्ता देना — टाउनशिप, आय, भाषा या तकनीक की परवाह किए बिना। हम हर विद्यार्थी को अपनी रुचियाँ पहचानने, सही कोर स्ट्रीम चुनने और लक्ष्य तक पहुँचने का स्पष्ट रोडमैप बनाने में मदद करते हैं।"
    },
    "vision": {
      "en": "A South Africa where a learner's future is decided by talent and interest, not by postcode or income — where opportunity is visible from every township, farm and city.",
      "hi": "एक ऐसा दक्षिण अफ़्रीका जहाँ विद्यार्थी का भविष्य उसकी प्रतिभा और रुचि से तय हो, पोस्टकोड या आय से नहीं — जहाँ अवसर हर टाउनशिप, खेत और शहर से दिखे।"
    }
  },

  /* --- dataSource ---
     Attribution line shown under the Top Colleges table. */
  "dataSource": "DHET South Africa & institution websites (indicative)",

  /* --- map ---
     The country outline (SVG path), the city dots and labels, and the
     Top-10 institutions table. Coordinates are in the viewBox space of "vb". */
  "map": {
    "vb": "0 0 520 360",
    "outline": "M360.6,27.2L367,26L372.2,26.9L378.4,29.6L384.2,30.5L389.5,29.7L393.9,29.6L397.3,29.9L399.9,30.9L401.8,32.3L402,33.5L403.1,37.5L404.7,42.5L405.7,47.2L407.1,53.6L407.1,57.2L407.4,58.6L408.6,60.3L410.1,63.3L410.7,64.9L411.2,66.2L412.8,68.6L414.1,72.2L415.2,76.9L416.1,79.2L416.4,80.4L416.8,82.4L416.8,86.7L416.8,91.7L416.8,97.4L416.9,102L416.7,104.3L416.8,110.9L415.4,114.4L415.5,117.1L416,118.9L414.4,119.5L409.4,116.7L404.6,113.7L402.9,113.9L400.1,116.1L397.6,119.4L396.4,122.3L394.5,125.2L391.5,130L391.2,131L391.1,134.9L391.3,138.6L393.2,139.2L394.3,142.2L397,147L401.6,150.1L405.8,151.5L411.6,151.8L416.2,151.8L415.9,148.5L416.4,143.3L417,139.8L418.9,140L421.4,140.2L424.6,140.9L427.3,140.8L429.7,140.8L433.7,140.6L436.1,140.6L435.3,146.3L432.2,155.1L431.2,159.1L428.6,173.5L425.2,180.8L423.3,183.8L417.7,189.1L416.2,190.2L414.8,190.9L412.4,191.5L402.9,202.2L399.4,207.4L396.2,215L393.1,219.1L388.5,228L384.4,234.8L380.5,241L373.7,249.6L370.7,252.1L368.6,253.2L363.2,258.2L355.5,266.2L349.8,273.3L341.1,281.3L336,284.9L328.4,291.8L326.3,292.8L317.8,299.3L311.7,303.2L301.7,307.7L297.8,309L288.4,307.8L284.4,308.4L281.1,311.2L280.8,315.1L279.4,315.7L277.4,315.6L270.8,313.9L267.2,314.2L265.2,316.3L263.5,319L258.5,319.1L249.7,316.4L239.3,314.7L236.9,314.5L231.9,316.5L230.1,316.8L222.8,316.4L218.7,315.1L214.7,315.1L211.8,316.2L208.2,316.5L198.4,323.9L193.3,323.9L189,324.8L186.8,324.8L182.7,323.8L181.3,323.8L178.9,324.3L176.6,325.6L171.4,326.1L169.4,327.3L160.5,334L158.5,333.7L156.8,333.3L152.3,333.2L147,329.6L145,329.9L145.6,328.8L145.7,326.9L144.6,325.5L141.9,325L140.8,323.4L137.6,323.3L136.5,323.6L135,323.7L134.9,322.1L135,321.1L134.9,319.4L134.5,317.5L133.3,316.9L132.4,316.6L130.2,316.7L128.7,317L127.1,318.9L127.1,323.3L126,322.1L124.7,319.4L124.3,316.7L124.8,313.4L127.2,312.1L127,309.9L126.5,308L123.8,303L122.8,300.8L120.6,299.2L118.8,295.5L117,294.2L116.3,291.6L114.6,289.5L114,286.3L114.9,284.4L116.5,283.4L118,285L119.9,284.4L122.6,282L124.2,278.4L124.3,272.7L123.9,269.1L121.7,259.8L120.7,257.7L115.9,251.1L110.3,242.2L103.2,228.2L99.8,219.8L94.7,202.9L90.2,193.3L84.6,184.3L84.8,182.6L87.8,180.5L89.1,180L89.9,180.2L91.3,178.3L91.4,177L91.7,175.1L92.4,174L93.1,171.8L94.4,170.3L97,169.4L99,170.7L99.8,171.9L100.2,173.5L101.1,174.3L102.4,174.2L103.5,175.2L104.1,177.3L103.9,178.8L103.1,179.7L103.2,180.9L104.3,182.3L104.7,183.8L105.4,185.7L109,186.7L110.8,187.4L113.8,187.6L116.7,188.4L119.4,189.9L123.9,190.3L130.1,189.5L135.1,189.8L139.2,191.3L142.1,191.5L143.9,190.6L144.7,189.3L144.5,187.6L145.3,186.5L147.3,186.1L148.9,184.8L150.2,182.6L153,181L157.4,179.6L159.7,179.6L159.7,176.2L159.7,165.4L159.7,154.6L159.7,143.7L159.7,132.9L159.7,122L159.7,111.2L159.7,100.4L159.7,90.1L160.7,90.8L167.5,96.3L169.3,99.1L170.2,101L173.1,107.5L175.2,113.4L177,117.9L177.2,119.9L177.4,121.9L177.7,122.9L177.5,123.9L176.2,126.3L175,128.2L173.5,130.7L173.3,134.1L173.8,138L174.7,140L175.9,140.6L178.7,139.6L180.5,139.9L183,140.7L191.2,140.2L192.2,140.5L195.3,140.7L196.4,140.4L197.3,139.6L198.4,137.2L199.3,136.5L201.1,136.1L203.2,135.4L204.9,134L207.6,129.4L213,125.2L214.7,124.3L215.7,123.2L216.6,121.6L218.5,116.4L220,112.1L220.4,110.1L221.7,106.7L223.3,104.6L224.8,103.5L227.5,102.6L230,102.1L232.6,102.7L235.5,104L238.7,106.1L242,108.8L243.5,110.2L245.1,110.8L248,111L249.9,111L252.8,113.6L254.3,113.8L257.7,114.6L261.8,115.5L264.4,115.4L267.2,113.9L269.2,113.9L271.7,114L274.6,113.6L276.7,113L278.3,111.7L279.7,110.3L281.3,106.2L282.2,102.9L283.7,99.1L285.4,94L286.1,90.4L286.7,89.4L289.2,88.3L291.4,87.5L297.1,86.2L298.3,85.4L299.3,83.7L301.8,80.8L304.9,78.4L306.5,77.1L309.4,65.4L309.7,64L311.8,60.9L313.1,59.6L314,59.6L315.1,58.7L316.7,57.2L318.5,56.2L320.7,55.8L322.1,54.7L322.7,53L323.8,52.1L325.4,52.2L326.2,51.6L326.5,50.5L327.4,49.4L329.1,48.6L329.9,47.7L330,46.5L332,43.7L336,39.4L339.6,36.9L343.1,36.4L346.3,35.5L349.4,34.2L351.7,32.1L353.2,29.3L355.6,27.6L360.6,27.2ZM347.2,219.9L350.7,218.3L352.3,217.4L353.5,216.6L354.9,215.4L355.5,212.6L355.9,210.1L357,208.9L358.2,208.1L359.2,206.8L360.3,203.8L361.1,200.8L361.3,199.6L360.8,198.3L360,197L359.3,195.2L358.4,195L356.6,193.9L354.1,191.9L351.8,190.1L349.8,187.6L348.9,187.2L346.9,185.4L346,184.4L345.4,183.2L343.9,183.2L341.5,183.7L336.4,185.7L333.3,187.7L330.6,189.9L327.8,190.8L325.8,191.6L324.2,194.1L322.6,196.6L321.3,198.8L320.5,199.8L319.1,201.8L317.7,204.1L316.3,205.7L314.4,206.5L312.1,207.6L311.2,208.3L311.1,209.2L312,211.4L312.8,213.5L314.1,216L315.1,217.8L316.7,220L317.6,221.3L317.5,223.4L318.3,225.1L319.2,225.6L320.5,226.3L321.8,227.4L322.6,228.8L324.3,230.6L326.2,232L329.3,232.6L331.8,233L332.6,232.8L333.5,231.6L334.2,230.2L334.4,228.4L335.2,227.4L338.2,222.7L339.8,221L340.8,220.9L342.1,220.5L343.8,220.4L345,220.5L347.2,219.9Z",
    "states": null,
    "hubs": [
      ["Cape Town",140,266],
      ["Stellenbosch",156,260],
      ["Johannesburg",330,142],
      ["Pretoria",336,124],
      ["Durban",400,222],
      ["Makhanda",300,274],
      ["Potchefstroom",298,152],
      ["Bellville",146,262],
      ["Bloemfontein",290,204],
      ["Pietermaritzburg",386,208]
    ],
    "dots": [
      [140,266],
      [156,260],
      [330,142],
      [336,124],
      [400,222],
      [300,274],
      [298,152],
      [146,262],
      [290,204],
      [386,208]
    ],
    "cols": [
      ["University of Cape Town (UCT)","Cape Town","https://www.uct.ac.za","APS / NBT (high)","Highly selective"],
      ["University of the Witwatersrand (Wits)","Johannesburg","https://www.wits.ac.za","APS (high)","Highly selective"],
      ["Stellenbosch University","Stellenbosch","https://www.sun.ac.za","APS (high)","Highly selective"],
      ["University of Pretoria","Pretoria","https://www.up.ac.za","APS","Selective"],
      ["University of KwaZulu-Natal","Durban","https://www.ukzn.ac.za","APS","Selective"],
      ["University of Johannesburg","Johannesburg","https://www.uj.ac.za","APS","Selective"],
      ["Rhodes University","Makhanda","https://www.ru.ac.za","APS","Selective"],
      ["University of the Western Cape","Bellville, Cape Town","https://www.uwc.ac.za","APS","Selective"],
      ["North-West University","Potchefstroom","https://www.nwu.ac.za","APS","Open / selective"],
      ["UNISA (distance)","Pretoria","https://www.unisa.ac.za","Matric / open","Open"]
    ],
    "colHeads": ["Min APS / entry","Selectivity"],
    "name_en": "South Africa",
    "name_hi": "दक्षिण अफ़्रीका"
  },

  /* --- cutoffs ---
     Ten-year indicative closing-mark series per stream. lowerIsBetter
     is true where a RANK is the cut-off and false where a SCORE is. */
  "cutoffs": [
    {
      "id": "eng",
      "inst": "UCT · Engineering (EBE)",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [40,40,41,41,42,43,43,44,44,45]
    },
    {
      "id": "med",
      "inst": "Wits · MBBCh",
      "unit": {"en":"Composite index % cut-off","hi":"कंपोज़िट इंडेक्स % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [88,88.5,89,89.5,90,91,91.5,92,92.5,93]
    },
    {
      "id": "def",
      "inst": "SA Military Academy · Saldanha",
      "unit": {"en":"Matric average % cut-off","hi":"मैट्रिक औसत % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [60,60,61,62,62,63,64,65,65,66]
    },
    {
      "id": "teach",
      "inst": "University of Pretoria · B.Ed",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [26,26,27,27,28,28,29,29,30,30]
    },
    {
      "id": "com",
      "inst": "UCT · BCom",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [37,38,38,39,39,40,40,41,41,42]
    },
    {
      "id": "agri",
      "inst": "Stellenbosch · BScAgric",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [30,30,31,31,32,33,33,34,34,35]
    },
    {
      "id": "trade",
      "inst": "TVET Colleges · N4 Engineering",
      "unit": {"en":"Matric % cut-off","hi":"मैट्रिक % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": true,
      "series": [50,50,51,51,52,52,53,54,54,55]
    },
    {
      "id": "civil",
      "inst": "Wits · BA Politics",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [33,33,34,34,35,35,36,36,37,37]
    },
    {
      "id": "sci",
      "inst": "UCT · BSc",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [38,38,39,39,40,41,41,42,42,43]
    },
    {
      "id": "it",
      "inst": "Wits · BSc Computer Science",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [39,39,40,40,41,42,42,43,43,44]
    },
    {
      "id": "creative",
      "inst": "UJ FADA · Design",
      "unit": {"en":"Min APS + portfolio (of 48)","hi":"न्यूनतम APS + पोर्टफोलियो"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [24,24,25,25,26,26,27,27,28,28]
    },
    {
      "id": "arts",
      "inst": "Rhodes · BA",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [30,30,31,31,32,32,33,33,34,34]
    },
    {
      "id": "dental",
      "inst": "UWC · BChD (Tygerberg)",
      "unit": {"en":"Composite % cut-off","hi":"कंपोज़िट % कट-ऑफ़"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 100,
      "integer": false,
      "series": [85,85.5,86,86.5,87,88,88.5,89,89.5,90]
    },
    {
      "id": "fashion",
      "inst": "STADIO School of Fashion",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [22,22,23,23,24,24,25,25,26,26]
    },
    {
      "id": "socsci",
      "inst": "UCT · BSocSci Psychology",
      "unit": {"en":"Min APS (of 48)","hi":"न्यूनतम APS (48 में)"},
      "lowerIsBetter": false,
      "min": 0,
      "max": 48,
      "integer": true,
      "series": [35,35,36,36,37,38,38,39,39,40]
    }
  ],

  /* --- colleges ---
     Stream-wise college lists for the Top Colleges page.
     official:false makes the site label the list "indicative". */
  "colleges": {
    "eng": {
      "src": "Indicative · Engineering (South Africa)",
      "official": false,
      "list": [
        ["UCT · Engineering & the Built Environment","Cape Town"],
        ["Wits · Engineering","Johannesburg"],
        ["Stellenbosch · Engineering","Stellenbosch"],
        ["University of Pretoria · EBIT","Pretoria"],
        ["UKZN · Engineering","Durban"],
        ["UJ · Engineering & the Built Environment","Johannesburg"],
        ["North-West University · Engineering","Potchefstroom"],
        ["Tshwane University of Technology","Pretoria"]
      ]
    },
    "med": {
      "src": "Indicative · Medicine (South Africa)",
      "official": false,
      "list": [
        ["UCT · MBChB","Cape Town"],
        ["Wits · MBBCh","Johannesburg"],
        ["Stellenbosch · MBChB (Tygerberg)","Cape Town"],
        ["University of Pretoria · MBChB","Pretoria"],
        ["UKZN · Nelson R Mandela School of Medicine","Durban"],
        ["University of the Free State · MBChB","Bloemfontein"],
        ["Sefako Makgatho Health Sciences Univ.","Pretoria"]
      ]
    },
    "def": {
      "src": "Indicative · Defence (South Africa)",
      "official": false,
      "list": [
        ["SA Military Academy (Stellenbosch Univ.)","Saldanha"],
        ["SA Naval College","Gordon's Bay"],
        ["SA Air Force Gymnasium","Pretoria"],
        ["SANDF Officer Formation Units","National"]
      ]
    },
    "teach": {
      "src": "Indicative · Teaching (South Africa)",
      "official": false,
      "list": [
        ["University of Pretoria · Education","Pretoria"],
        ["North-West University · Education","Potchefstroom"],
        ["Stellenbosch · Education","Stellenbosch"],
        ["UJ · Education","Johannesburg"],
        ["UKZN · Edgewood Campus","Pinetown"],
        ["UNISA · Education (distance)","Pretoria"]
      ]
    },
    "com": {
      "src": "Indicative · Commerce (South Africa)",
      "official": false,
      "list": [
        ["UCT · Commerce","Cape Town"],
        ["Stellenbosch · Economic & Mgmt Sciences","Stellenbosch"],
        ["Wits · Commerce, Law & Management","Johannesburg"],
        ["University of Pretoria · EMS","Pretoria"],
        ["UJ · Business & Economics","Johannesburg"],
        ["Rhodes · Commerce","Makhanda"]
      ]
    },
    "agri": {
      "src": "Indicative · Agriculture (South Africa)",
      "official": false,
      "list": [
        ["Stellenbosch · AgriSciences","Stellenbosch"],
        ["University of Pretoria · Agric. Sciences","Pretoria"],
        ["University of the Free State · Agriculture","Bloemfontein"],
        ["UKZN · Agriculture","Pietermaritzburg"],
        ["Elsenburg Agricultural Training Institute","Stellenbosch"]
      ]
    },
    "trade": {
      "src": "Indicative · TVET & Applied (South Africa)",
      "official": false,
      "list": [
        ["False Bay TVET College","Cape Town"],
        ["Ekurhuleni East TVET College","Gauteng"],
        ["Cape Peninsula University of Technology","Cape Town"],
        ["Durban University of Technology","Durban"],
        ["Public TVET Colleges (50 nationwide)","National"]
      ]
    },
    "civil": {
      "src": "Indicative · Politics & Public Admin (South Africa)",
      "official": false,
      "list": [
        ["UCT · Politics / PPE","Cape Town"],
        ["Wits · Political Studies","Johannesburg"],
        ["Stellenbosch · Political Science","Stellenbosch"],
        ["Rhodes · Politics","Makhanda"],
        ["University of Pretoria · Humanities","Pretoria"]
      ]
    },
    "sci": {
      "src": "Indicative · Science (South Africa)",
      "official": false,
      "list": [
        ["UCT · Science","Cape Town"],
        ["Wits · Science","Johannesburg"],
        ["Stellenbosch · Science","Stellenbosch"],
        ["University of Pretoria · Natural Sciences","Pretoria"],
        ["UKZN · Science","Durban"],
        ["Rhodes · Science","Makhanda"]
      ]
    },
    "it": {
      "src": "Indicative · IT & Computing (South Africa)",
      "official": false,
      "list": [
        ["UCT · Computer Science","Cape Town"],
        ["Wits · Computer Science","Johannesburg"],
        ["Stellenbosch · Computer Science","Stellenbosch"],
        ["University of Pretoria · Computer Science","Pretoria"],
        ["UJ · Academy of Computer Science","Johannesburg"],
        ["Rhodes · Computer Science","Makhanda"]
      ]
    },
    "creative": {
      "src": "Indicative · Design & Fine Art (South Africa)",
      "official": false,
      "list": [
        ["Michaelis School of Fine Art (UCT)","Cape Town"],
        ["Wits School of Arts","Johannesburg"],
        ["UJ · FADA (Art, Design & Architecture)","Johannesburg"],
        ["Stellenbosch · Visual Arts","Stellenbosch"],
        ["Rhodes · Fine Art","Makhanda"]
      ]
    },
    "arts": {
      "src": "Indicative · Arts & Humanities (South Africa)",
      "official": false,
      "list": [
        ["UCT · Humanities","Cape Town"],
        ["Rhodes · Humanities","Makhanda"],
        ["Stellenbosch · Arts & Social Sciences","Stellenbosch"],
        ["Wits · Humanities","Johannesburg"],
        ["University of Pretoria · Humanities","Pretoria"]
      ]
    },
    "dental": {
      "src": "Indicative · Dental (South Africa)",
      "official": false,
      "list": [
        ["UWC · Dentistry (Tygerberg)","Cape Town"],
        ["Wits · Oral Health Sciences","Johannesburg"],
        ["University of Pretoria · Dentistry","Pretoria"],
        ["Sefako Makgatho · Oral Health","Pretoria"]
      ]
    },
    "fashion": {
      "src": "Indicative · Fashion (South Africa)",
      "official": false,
      "list": [
        ["STADIO School of Fashion (LISOF)","Johannesburg"],
        ["Design Academy of Fashion","Cape Town"],
        ["CPUT · Fashion Design","Cape Town"],
        ["DUT · Fashion & Textiles","Durban"],
        ["TUT · Fashion Design","Pretoria"]
      ]
    },
    "socsci": {
      "src": "Indicative · Social Sciences & Psychology (South Africa)",
      "official": false,
      "list": [
        ["UCT · Psychology","Cape Town"],
        ["Stellenbosch · Psychology","Stellenbosch"],
        ["Wits · Psychology","Johannesburg"],
        ["Rhodes · Psychology","Makhanda"],
        ["University of Pretoria · Psychology","Pretoria"],
        ["UNISA · Psychology (distance)","Pretoria"]
      ]
    }
  },

  /* --- schools ---
     School-system figures by region, plus the headline facts, the
     public/private split, and the source note printed beneath them. */
  "schools": {
    "byRegion": [
      {"state":"KwaZulu-Natal","total":5850,"single":920},
      {"state":"Eastern Cape","total":5300,"single":1600},
      {"state":"Limpopo","total":3850,"single":540},
      {"state":"Gauteng","total":2900,"single":60},
      {"state":"Mpumalanga","total":1720,"single":210},
      {"state":"Western Cape","total":1700,"single":90},
      {"state":"North West","total":1440,"single":230},
      {"state":"Free State","total":1000,"single":330},
      {"state":"Northern Cape","total":560,"single":140}
    ],
    "facts": {"total":"~24,800","students":"~13.5M","teachers":"~460K","govtPct":"~92%","singleTeacher":"~4,100"},
    "typeSplit": [
      {"name":"Public","value":92},
      {"name":"Independent (private)","value":8}
    ],
    "source": "Source: Department of Basic Education (School Realities / EMIS), South Africa. Province totals and small-school counts are rounded, indicative figures for orientation — verify exact figures on official dashboards."
  }
};
