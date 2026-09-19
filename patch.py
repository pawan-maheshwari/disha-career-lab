"""Apply the webinar + footer + coming-soon edits to index.html.

Every edit asserts on an exact, unique anchor. If an anchor is missing or
ambiguous the script stops instead of writing a half-patched file.
"""
import io, sys

SRC = "index.html"
OUT = "index_patched.html"
MODULE = "webinar-module.js"
DIMS = "dimensions-module.js"
EB = "earlybird-module.js"

s = io.open(SRC, encoding="utf-8").read()
orig_len = len(s)


def once(hay, needle, label):
    n = hay.count(needle)
    if n != 1:
        sys.exit("ANCHOR %s found %d times (need exactly 1)" % (label, n))


# --------------------------------------------------------------- 1. nav menu entries
nav_anchor = (
    '{en:"Top News",hi:"\\u092E\\u0941\\u0916\\u094D\\u092F \\u0938\\u092E\\u093E\\u091A\\u093E\\u0930",'
    'fn:()=>window.DISHA_TOPNEWS.open(e)},'
)
once(s, nav_anchor, "nav-topnews")
nav_add = (
    '{en:"Career Webinar",hi:"\u0915\u0930\u093F\u092F\u0930 \u0935\u0947\u092C\u093F\u0928\u093E\u0930",'
    'fn:()=>window.DISHA_WEBINAR.open(e,"career")},'
    '{en:"AI Workshop",hi:"AI \u0915\u093E\u0930\u094D\u092F\u0936\u093E\u0932\u093E",'
    'fn:()=>window.DISHA_WEBINAR.open(e,"ai")},'
    # Join Us keeps a home in the menu now that its floating bubble is gone.
    '{en:"Join Us",hi:"\u0939\u092e\u0938\u0947 \u091c\u0941\u0921\u093c\u0947\u0902",'
    'fn:()=>{window.DJ&&window.DJ.open()}},'
)
s = s.replace(nav_anchor, nav_anchor + nav_add)

# --------------------------------------------------------------- 2. declutter the header
# The header carried Attempts, Browse Colleges, Top News, two webinar pills,
# a language toggle and a hamburger — seven controls around one decision.
# Top News moves into the menu (where it already has an entry) and the
# webinars move to a single line of text below the hero.
pill_start = (
    'l.default.createElement("button",{className:"showm sans",'
    'onClick:()=>window.DISHA_TOPNEWS.open(e)'
)
pill_end = (
    '}},e==="en"?"\\u25C6 Top News":"\\u25C6 \\u092E\\u0941\\u0916\\u094D\\u092F '
    '\\u0938\\u092E\\u093E\\u091A\\u093E\\u0930"),'
)
once(s, pill_start, "topnews-pill-start")
once(s, pill_end, "topnews-pill-end")
a = s.find(pill_start)
b = s.find(pill_end) + len(pill_end)
if b <= a:
    sys.exit("topnews pill bounds inverted")
s = s[:a] + s[b:]

# One line of plain text links, placed just above the news strip: what is on
# this week, without three more buttons competing with Start My Assessment.
strip_anchor = 'l.default.createElement("div",{id:"disha-news-strip"'
once(s, strip_anchor, "news-strip")


def whatson_link(label_en, label_hi, call):
    return (
        'l.default.createElement("span",{className:"clink",onClick:()=>%s,'
        'style:{color:p.cardinal,fontWeight:700,cursor:"pointer"}},'
        'e==="en"?"%s":"%s")' % (call, label_en, label_hi)
    )


whatson = (
    'l.default.createElement("div",{className:"sans noprint",'
    'style:{marginTop:16,fontSize:13.5,color:p.grey,display:"flex",flexWrap:"wrap",'
    'gap:"6px 14px",alignItems:"center"}},'
    'l.default.createElement("span",{style:{fontWeight:700,color:p.ink}},'
    'e==="en"?"This week:":"\u0907\u0938 \u0938\u092A\u094D\u0924\u093E\u0939:"),'
    + whatson_link(
        "Career webinar \u00b7 Sat 5 PM \u00b7 \u20b999",
        "\u0915\u0930\u093F\u092F\u0930 \u0935\u0947\u092c\u093f\u0928\u093e\u0930 \u00b7 \u0936\u0928\u093f 5 PM \u00b7 \u20b999",
        'window.DISHA_WEBINAR.open(e,"career")')
    + ","
    + whatson_link(
        "AI workshop \u00b7 Sun 11 AM \u00b7 \u20b9299",
        "AI \u0915\u093e\u0930\u094d\u092f\u0936\u093e\u0932\u093e \u00b7 \u0930\u0935\u093f 11 AM \u00b7 \u20b9299",
        'window.DISHA_WEBINAR.open(e,"ai")')
    + ","
    + whatson_link("Top News",
                   "\u092e\u0941\u0916\u094d\u092f \u0938\u092e\u093e\u091a\u093e\u0930",
                   "window.DISHA_TOPNEWS.open(e)")
    + "),"
)
s = s.replace(strip_anchor, whatson + strip_anchor, 1)

# --------------------------------------------------------------- 2b. quieten the page
# The maroon ticker repeated the price already stated in the hero, and the
# Join Us bubble sat on top of the primary call to action. Both go; Join Us
# keeps its place in the menu, so nothing becomes unreachable.
ticker_anchor = ('{style:{background:p.cardinal,color:"#fff",overflow:"hidden",'
                 'whiteSpace:"nowrap"},className:"sans noprint"}')
once(s, ticker_anchor, "price-ticker")
s = s.replace(ticker_anchor, ticker_anchor.replace(
    '{style:{background:p.cardinal,',
    '{style:{display:"none",background:p.cardinal,'), 1)

# --------------------------------------------------------------- 2c. early-bird banner
# It takes the slot the price ticker used to occupy — one static line rather
# than a moving one, and it deletes itself once the deadline passes.
eb_anchor = ticker_anchor.replace(
    '{style:{background:p.cardinal,', '{style:{display:"none",background:p.cardinal,')
eb_mount = (
    'l.default.createElement("div",{className:"noprint",'
    'ref:Eb=>{Eb&&window.DISHA_EARLYBIRD&&window.DISHA_EARLYBIRD.mount(Eb,e)}}),'
)
# Insert immediately before the (now hidden) ticker element.
tick_el = "l.default.createElement(\"div\"," + eb_anchor
once(s, tick_el, "ticker-element")
s = s.replace(tick_el, eb_mount + tick_el, 1)

# --------------------------------------------------------------- 2d. injected CSS
extra_css = (
    '\n<style id="disha-declutter">\n'
    "/* The Join Us bubble overlapped Start My Assessment on a phone; it now\n"
    "   lives in the menu instead. Ask Dhruv stays as the one floating action. */\n"
    "#dj-fab{display:none !important}\n"
    "</style>\n"
)

# --------------------------------------------------------------- 3. footer credit
foot_anchor = (
    'e==="en"?"Conceived & built by":"\\u0928\\u093F\\u0930\\u094D\\u092E\\u093E\\u0924\\u093E"," ",'
    'l.default.createElement("strong",{style:{color:p.ink}},"Pawan Maheshwari")'
)
once(s, foot_anchor, "footer-credit")
foot_new = (
    'e==="en"?"Conceived and developed under":'
    '"\\u0938\\u0902\\u0915\\u0932\\u094D\\u092A\\u093F\\u0924 \\u0935 \\u0935\\u093F\\u0915\\u0938\\u093F\\u0924"," ",'
    'l.default.createElement("strong",{style:{color:p.ink}},"PlanetAI LLP")'
)
s = s.replace(foot_anchor, foot_new)

# --------------------------------------------------------------- 4. hide the coming-soon block
cs_anchor = (
    'l.default.createElement("div",{style:{marginTop:34}},'
    'l.default.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}},'
    'l.default.createElement("span",{className:"sans",style:{background:"#C9A227"'
)
once(s, cs_anchor, "coming-soon")
cs_new = cs_anchor.replace(
    'l.default.createElement("div",{style:{marginTop:34}}',
    'l.default.createElement("div",{style:{marginTop:34,display:"none"}}',
    1,
)
s = s.replace(cs_anchor, cs_new)

# --------------------------------------------------------------- 5. the 5-D explainer
grid_anchor = (
    'l.default.createElement("div",{style:{display:"grid",'
    'gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginTop:36}},'
    'ne.dim.map((z,ee)=>l.default.createElement("div",{key:ee,style:{border:`1px solid ${p.hairline}`,'
    'borderTop:`4px solid ${p.cardinal}`,padding:"14px 12px",background:"#fff"}},'
    'l.default.createElement("div",{className:"serif",style:{fontSize:22,fontWeight:700,color:p.cardinal}},ee+1),'
    'l.default.createElement("div",{className:"sans",style:{fontWeight:700,fontSize:14,marginTop:4}},z))))'
)
once(s, grid_anchor, "dimension-grid")
grid_new = (
    'l.default.createElement("div",{id:"disha-dimensions",style:{marginTop:36},'
    'ref:Dz=>{Dz&&window.DISHA_DIMENSIONS&&window.DISHA_DIMENSIONS.mount(Dz,e,ne.dim)}})'
)
s = s.replace(grid_anchor, grid_new)

# --------------------------------------------------------------- 7. price cutover
# Early-bird pricing ends 30 Sep 2026 (IST). From 1 Oct the table below takes
# over — one switch, read by every screen, so a price can never change in the
# hero and miss the payment page. India lands on an exact Rs 2,499 inclusive,
# which needs the rounding step dropped to 1 (999 + 18% rounded up to 50 is
# what produced Rs 1,200).
price_anchor = "  function P() { return PRICING[home()]; }"
once(s, price_anchor, "price-fn")
cutover = """  /* ---------------- Early-bird cutover ------------------------------------
     Until 30 Sep 2026 (IST) the launch prices above apply. From 1 Oct the
     values below replace them. `save` is recomputed with each price so the
     comparison panel never claims a saving the new price does not deliver. */
  (function () {
    var CUTOVER = Date.parse("2026-10-01T00:00:00+05:30");
    if (isNaN(CUTOVER) || Date.now() < CUTOVER) return;
    var NEXT = {
      /* 2117.80 + 18% = 2499.00 exactly, with roundGrossTo dropped to 1. */
      "India":        { full: 2117.80, roundGrossTo: 1, save: 1500 },
      "Nepal":        { full: 2999, save: 2600 },
      "UAE":          { full: 999,  save: 450 },
      "South Africa": { full: 1499, save: 775 }
    };
    Object.keys(NEXT).forEach(function (k) {
      if (!PRICING[k]) return;
      Object.keys(NEXT[k]).forEach(function (f) { PRICING[k][f] = NEXT[k][f]; });
    });
  })();

"""
s = s.replace(price_anchor, cutover + price_anchor, 1)

# --------------------------------------------------------------- 8. comparison copy
# The panel argued on price alone ("saves a family about Rs 3,000"), which
# both weakens at the new price and says nothing about what DISHA does
# differently. It now leads with the difference and keeps price as support.
cmp_start = 'e==="en"?"Choosing DISHA over a typical "'
cmp_end = '\\u092C\\u0930\\u093E\\u092C\\u0930\\u0964")'
a = s.find(cmp_start)
b = s.find(cmp_end, a)
if a < 0 or b < 0:
    sys.exit("ANCHOR comparison-line not found")
b += len(cmp_end) - 1  # keep the trailing ")"
cmp_new = (
    'e==="en"?"Other platforms stop at a personality type. DISHA ends with real colleges '
    'drawn from government data, the entrance benchmarks to aim at, and a term-by-term plan '
    '\\u2014 at "+window.DISHA_GLOBAL.price()+", against a typical "'
    '+window.DISHA_GLOBAL.typicalOther()+" platform.":'
    '"\\u0905\\u0928\\u094D\\u092F \\u092A\\u094D\\u0932\\u0947\\u091F\\u092B\\u093C\\u0949\\u0930\\u094D\\u092E '
    '\\u0935\\u094D\\u092F\\u0915\\u094D\\u0924\\u093F\\u0924\\u094D\\u0935 \\u092A\\u094D\\u0930\\u0915\\u093E\\u0930 '
    '\\u092A\\u0930 \\u0930\\u0941\\u0915 \\u091C\\u093E\\u0924\\u0947 \\u0939\\u0948\\u0902\\u0964 DISHA '
    '\\u0938\\u0930\\u0915\\u093E\\u0930\\u0940 \\u0921\\u0947\\u091F\\u093E \\u0938\\u0947 \\u0935\\u093E\\u0938\\u094D\\u0924\\u0935\\u093F\\u0915 '
    '\\u0915\\u0949\\u0932\\u0947\\u091C, \\u0932\\u0915\\u094D\\u0937\\u094D\\u092F \\u092C\\u0928\\u093E\\u0928\\u0947 '
    '\\u092F\\u094B\\u0917\\u094D\\u092F \\u092A\\u094D\\u0930\\u0935\\u0947\\u0936 \\u092E\\u093E\\u0928\\u0915 '
    '\\u0914\\u0930 \\u0938\\u0924\\u094D\\u0930-\\u0926\\u0930-\\u0938\\u0924\\u094D\\u0930 \\u092F\\u094B\\u091C\\u0928\\u093E '
    '\\u0924\\u0915 \\u0932\\u0947 \\u091C\\u093E\\u0924\\u093E \\u0939\\u0948 \\u2014 "'
    '+window.DISHA_GLOBAL.price(true)+"\\u092E\\u0947\\u0902\\u0964")'
)
s = s[:a] + cmp_new + s[b + 1:]
module = io.open(MODULE, encoding="utf-8").read()
dims = io.open(DIMS, encoding="utf-8").read()
eb = io.open(EB, encoding="utf-8").read()
tail = "</body>"
idx = s.rfind(tail)
if idx < 0:
    sys.exit("no </body> found")
block = (
    extra_css +
    '\n<script id="disha-webinar-module">\n' + module + "\n</script>\n"
    '<script id="disha-dimensions-module">\n' + dims + "\n</script>\n"
    '<script id="disha-earlybird-module">\n' + eb + "\n</script>\n"
)
s = s[:idx] + block + s[idx:]

io.open(OUT, "w", encoding="utf-8").write(s)
print("OK  %d -> %d bytes (+%d)" % (orig_len, len(s), len(s) - orig_len))
