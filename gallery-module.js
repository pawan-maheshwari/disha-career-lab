/* ===========================================================================
   DISHA — GALLERY  (window.DISHA_GALLERY)

   Lives on the About page, under Mission / Vision. Loaded as its own file so
   index.html carries none of the image weight: the pictures sit in
   assets/gallery/ and are only fetched when someone opens the gallery
   (the six preview thumbnails load lazily as the section scrolls into view).

   Opening it shows all 18 campaign pieces as one continuous, looping film
   strip. Hover or press pause to stop it, drag or swipe to scrub, tap a
   picture to see it full size with previous / next.

   To add or reorder pictures: drop the file in assets/gallery/ and edit
   ITEMS below (w/h are the pixel size, used to lay the strip out before the
   images arrive, so it never jumps).
   =========================================================================== */
window.DISHA_GALLERY = (function () {
  "use strict";

  var BASE = "assets/gallery/";
  var ITEMS = [
    { f: "disha-01.webp", w: 903,  h: 1600, en: "Your stream is chosen. That is not the destination." },
    { f: "disha-02.webp", w: 1168, h: 784,  en: "Lost: this student's actual direction." },
    { f: "disha-03.webp", w: 1168, h: 784,  en: "Hold — 5-D scan required." },
    { f: "disha-04.webp", w: 1168, h: 784,  en: "Tied the same. Walking different lives." },
    { f: "disha-05.webp", w: 1168, h: 784,  en: "Marks are not a map." },
    { f: "disha-06.webp", w: 1168, h: 784,  en: "Pressure breaks the tool. A 5-D profile does not." },
    { f: "disha-07.webp", w: 1168, h: 784,  en: "Everyone in my class took Science. That is not data." },
    { f: "disha-08.webp", w: 1168, h: 784,  en: "The seat is reserved. The future is not." },
    { f: "disha-09.webp", w: 1168, h: 784,  en: "This wrote the marks. It cannot write the path." },
    { f: "disha-10.webp", w: 1600, h: 874,  en: "A 5-D profile sees who they actually are." },
    { f: "disha-11.webp", w: 1392, h: 1424, en: "Career guidance for every student." },
    { f: "disha-12.webp", w: 1600, h: 903,  en: "Wrong crowd, or your path." },
    { f: "disha-13.webp", w: 1408, h: 1408, en: "Good guidance asks what actually fits you." },
    { f: "disha-14.webp", w: 1264, h: 1568, en: "A student with only marks is just a score." },
    { f: "disha-15.webp", w: 1009, h: 1600, en: "How students choose a path." },
    { f: "disha-16.webp", w: 1280, h: 1536, en: "Discover your strengths. Then choose." },
    { f: "disha-17.webp", w: 1600, h: 604,  en: "We do the 5-D science. You do the choosing." },
    { f: "disha-18.webp", w: 1042, h: 1600, en: "Career path: guesswork, peer pressure, or a 5-D map." }
  ];

  var P = { cardinal: "#8C1515", ink: "#2E2D29", grey: "#53565A", fog: "#F4F4F4",
            hairline: "#D5D5D0", gold: "#C9A227" };
  var SPEED = 60;          /* px per second while the strip runs */
  var GAP = 18;            /* px between pictures */
  var lang = "en";

  function T(en, hi) { return lang === "hi" ? hi : en; }
  function src(i) { return BASE + ITEMS[i].f; }
  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  /* ------------------------------------------------------------- styles */
  var styled = false;
  function css() {
    if (styled) return; styled = true;
    var s = document.createElement("style");
    s.id = "disha-gallery-css";
    s.textContent = [
      ".dgal-sec{margin-top:48px}",
      ".dgal-sec h2{font-size:28px;font-weight:700}",
      ".dgal-bar{width:60px;height:4px;background:" + P.cardinal + ";margin:12px 0 4px}",
      ".dgal-lede{color:" + P.grey + ";font-size:16px;max-width:720px}",
      ".dgal-peek{position:relative;display:block;width:100%;margin-top:26px;padding:0;border:1px solid " + P.hairline + ";",
      "  background:" + P.ink + ";cursor:pointer;overflow:hidden;text-align:left;box-shadow:4px 4px 0 rgba(0,0,0,.08)}",
      ".dgal-peek:focus-visible{outline:3px solid " + P.gold + ";outline-offset:3px}",
      ".dgal-peek-row{display:flex;gap:6px;height:clamp(150px,24vw,240px)}",
      ".dgal-peek-row img{height:100%;width:auto;flex:0 0 auto;object-fit:cover;opacity:.78;transition:opacity .3s}",
      ".dgal-peek:hover .dgal-peek-row img{opacity:.55}",
      ".dgal-peek-cta{position:absolute;left:0;right:0;bottom:0;padding:18px 22px;display:flex;align-items:center;",
      "  justify-content:space-between;gap:12px;flex-wrap:wrap;background:linear-gradient(to top,rgba(46,45,41,.95),rgba(46,45,41,0))}",
      ".dgal-peek-cta b{color:#fff;font-size:20px}",
      ".dgal-peek-cta span{background:" + P.cardinal + ";color:#fff;padding:10px 18px;font-weight:700;font-size:15px}",

      ".dgal-ov{position:fixed;inset:0;z-index:2147483000;background:#1d1c1a;color:#fff;display:flex;flex-direction:column;",
      "  padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px);opacity:0;transition:opacity .25s}",
      ".dgal-ov.on{opacity:1}",
      ".dgal-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px}",
      ".dgal-top h3{font-size:20px;font-weight:700;margin:0}",
      ".dgal-top small{display:block;color:#b9b8b3;font-size:13px;font-weight:400;margin-top:2px}",
      ".dgal-btns{display:flex;gap:8px}",
      ".dgal-btn{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35);min-width:44px;height:44px;",
      "  padding:0 14px;font-size:15px;font-weight:700;cursor:pointer}",
      ".dgal-btn:hover{border-color:#fff}",
      ".dgal-btn:focus-visible{outline:3px solid " + P.gold + ";outline-offset:2px}",
      ".dgal-btn.dgal-x{background:" + P.cardinal + ";border-color:" + P.cardinal + "}",
      ".dgal-stage{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;touch-action:pan-y;cursor:grab}",
      ".dgal-stage.drag{cursor:grabbing}",
      ".dgal-track{display:flex;gap:" + GAP + "px;will-change:transform;height:min(70vh,640px)}",
      ".dgal-track img{height:100%;width:auto;flex:0 0 auto;display:block;background:#2a2927;user-select:none;",
      "  -webkit-user-drag:none;cursor:zoom-in;box-shadow:0 10px 30px rgba(0,0,0,.45)}",
      ".dgal-foot{padding:10px 18px 18px;color:#b9b8b3;font-size:14px;min-height:44px}",
      ".dgal-prog{height:3px;background:rgba(255,255,255,.12);margin:0 18px}",
      ".dgal-prog i{display:block;height:100%;width:0;background:" + P.gold + "}",

      ".dgal-lb{position:absolute;inset:0;background:#141312;display:none;flex-direction:column}",
      ".dgal-lb.on{display:flex}",
      ".dgal-lb-fig{flex:1;display:flex;align-items:center;justify-content:center;padding:8px 64px;min-height:0}",
      ".dgal-lb-fig img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.5)}",
      ".dgal-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:64px;font-size:26px;",
      "  background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.25);color:#fff;cursor:pointer}",
      ".dgal-nav:focus-visible{outline:3px solid " + P.gold + "}",
      ".dgal-prev{left:8px}.dgal-next{right:8px}",
      "@media (max-width:600px){.dgal-lb-fig{padding:8px}.dgal-nav{top:auto;bottom:70px;transform:none}",
      "  .dgal-track{height:min(62vh,72vw)}.dgal-top h3{font-size:17px}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* --------------------------------------------- About-page section */
  function mount(el, l) {
    if (!el) return;
    lang = l === "hi" ? "hi" : "en";
    if (el.getAttribute("data-dgal-lang") === lang && el.firstChild) return;   /* already drawn */
    css();
    el.setAttribute("data-dgal-lang", lang);
    el.className = "dgal-sec";

    var peek = [0, 4, 10, 12, 7, 15].map(function (i) {
      return '<img loading="lazy" decoding="async" alt="" src="' + src(i) + '" width="' + ITEMS[i].w +
             '" height="' + ITEMS[i].h + '">';
    }).join("");

    el.innerHTML =
      '<h2 class="serif">' + T("Gallery", "गैलरी") + "</h2>" +
      '<div class="dgal-bar"></div>' +
      '<p class="sans dgal-lede">' +
        T("The ideas behind DISHA, told in pictures. Eighteen pieces from our campaign on marks, streams and finding the path that fits.",
          "DISHA के पीछे के विचार, चित्रों में। अंक, स्ट्रीम और सही राह खोजने पर हमारे अभियान के अठारह चित्र।") +
      "</p>" +
      '<button type="button" class="dgal-peek sans" aria-label="' +
        T("Open the gallery, 18 pictures", "गैलरी खोलें, 18 चित्र") + '">' +
        '<div class="dgal-peek-row">' + peek + "</div>" +
        '<div class="dgal-peek-cta"><b class="serif">' + T("18 pictures", "18 चित्र") + "</b>" +
        "<span>" + T("Open gallery", "गैलरी खोलें") + "</span></div>" +
      "</button>";

    el.querySelector(".dgal-peek").onclick = function () { open(lang); };
  }

  /* first render may happen before this file loads — pick those slots up */
  function scan() {
    var n = document.querySelectorAll("[data-disha-gallery]");
    for (var i = 0; i < n.length; i++) mount(n[i], n[i].getAttribute("data-disha-gallery"));
  }

  /* ------------------------------------------------------ the viewer */
  var ov = null, track = null, stage = null, prog = null, cap = null, lb = null, lbImg = null,
      playBtn = null, lastFocus = null, raf = 0;
  var x = 0, setW = 0, playing = true, hovering = false, dragging = false, lastT = 0;
  var dragX0 = 0, dragOff0 = 0, moved = 0, cur = 0, lbOpen = false;

  function scaledWidth(i, h) { return ITEMS[i].w * h / ITEMS[i].h; }

  function measure() {
    var h = track.getBoundingClientRect().height, w = 0;
    for (var i = 0; i < ITEMS.length; i++) w += scaledWidth(i, h) + GAP;
    setW = w;
  }

  function build() {
    ov = document.createElement("div");
    ov.className = "dgal-ov sans";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", T("DISHA gallery", "DISHA गैलरी"));

    var imgs = "";
    for (var k = 0; k < 2; k++) {           /* two copies make the loop seamless */
      for (var i = 0; i < ITEMS.length; i++) {
        imgs += '<img draggable="false" decoding="async" data-i="' + i + '" src="' + src(i) + '" width="' +
                ITEMS[i].w + '" height="' + ITEMS[i].h + '" alt="' + (k ? "" : ITEMS[i].en.replace(/"/g, "&quot;")) +
                '"' + (k ? ' aria-hidden="true"' : "") + ">";
      }
    }

    ov.innerHTML =
      '<div class="dgal-top"><div><h3 class="serif">' + T("DISHA Gallery", "DISHA गैलरी") + "</h3>" +
        "<small>" + T("Drag to scrub. Tap a picture to see it full size.", "खिसकाने के लिए खींचें। पूरा देखने के लिए चित्र पर टैप करें।") + "</small></div>" +
        '<div class="dgal-btns"><button type="button" class="dgal-btn dgal-play"></button>' +
        '<button type="button" class="dgal-btn dgal-x" aria-label="' + T("Close gallery", "गैलरी बंद करें") + '">\u2715</button></div></div>' +
      '<div class="dgal-stage"><div class="dgal-track">' + imgs + "</div></div>" +
      '<div class="dgal-prog"><i></i></div>' +
      '<div class="dgal-foot" aria-live="polite"></div>' +
      '<div class="dgal-lb" role="group" aria-label="' + T("Picture viewer", "चित्र दर्शक") + '">' +
        '<div class="dgal-top"><div><h3 class="serif dgal-lb-n"></h3></div><div class="dgal-btns">' +
        '<button type="button" class="dgal-btn dgal-back">' + T("Back to strip", "पट्टी पर लौटें") + "</button></div></div>" +
        '<div class="dgal-lb-fig"><img alt=""></div>' +
        '<button type="button" class="dgal-nav dgal-prev" aria-label="' + T("Previous", "पिछला") + '">\u2039</button>' +
        '<button type="button" class="dgal-nav dgal-next" aria-label="' + T("Next", "अगला") + '">\u203A</button>' +
        '<div class="dgal-foot dgal-lb-cap"></div>' +
      "</div>";

    track = ov.querySelector(".dgal-track");
    stage = ov.querySelector(".dgal-stage");
    prog = ov.querySelector(".dgal-prog i");
    cap = ov.querySelector(".dgal-foot");
    lb = ov.querySelector(".dgal-lb");
    lbImg = lb.querySelector("img");
    playBtn = ov.querySelector(".dgal-play");

    playBtn.onclick = function () { setPlaying(!playing); };
    ov.querySelector(".dgal-x").onclick = close;
    ov.querySelector(".dgal-back").onclick = closeLb;
    ov.querySelector(".dgal-prev").onclick = function () { showLb(cur - 1); };
    ov.querySelector(".dgal-next").onclick = function () { showLb(cur + 1); };

    stage.addEventListener("mouseenter", function () { hovering = true; });
    stage.addEventListener("mouseleave", function () { hovering = false; });

    stage.addEventListener("pointerdown", function (ev) {
      if (ev.button && ev.button !== 0) return;
      dragging = true; moved = 0; dragX0 = ev.clientX; dragOff0 = x;
      stage.classList.add("drag");
      try { stage.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    stage.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      var d = ev.clientX - dragX0; moved = Math.max(moved, Math.abs(d));
      x = wrap(dragOff0 + d); paint();
    });
    function endDrag(ev) {
      if (!dragging) return;
      dragging = false; stage.classList.remove("drag");
      if (moved < 6 && ev && ev.type === "pointerup") {          /* a tap, not a drag */
        var el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (el && el.tagName === "IMG" && el.hasAttribute("data-i")) showLb(+el.getAttribute("data-i"));
      }
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", function () { if (ov && ov.parentNode) { measure(); x = wrap(x); paint(); } });
    document.body.appendChild(ov);
  }

  function wrap(v) {
    if (!setW) return v;
    while (v <= -setW) v += setW;
    while (v > 0) v -= setW;
    return v;
  }

  /* which picture sits in the middle of the screen */
  function centreIndex() {
    var h = track.getBoundingClientRect().height, mid = stage.clientWidth / 2 - x, acc = 0;
    mid = ((mid % setW) + setW) % setW;
    for (var i = 0; i < ITEMS.length; i++) {
      var w = scaledWidth(i, h) + GAP;
      if (mid < acc + w) return i;
      acc += w;
    }
    return 0;
  }

  var shown = -1;
  function paint() {
    track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    if (!setW) return;
    prog.style.width = ((-x / setW) * 100).toFixed(2) + "%";
    var i = centreIndex();
    if (i !== shown) { shown = i; cap.textContent = (i + 1) + " / " + ITEMS.length + "  \u2014  " + ITEMS[i].en; }
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    if (playing && !hovering && !dragging && !lbOpen) { x = wrap(x - SPEED * dt); paint(); }
  }

  function setPlaying(v) {
    playing = v;
    playBtn.textContent = v ? T("Pause", "रोकें") : T("Play", "चलाएँ");
    playBtn.setAttribute("aria-pressed", v ? "false" : "true");
  }

  function showLb(i) {
    cur = (i + ITEMS.length) % ITEMS.length;
    lbImg.src = src(cur);
    lbImg.alt = ITEMS[cur].en;
    lb.querySelector(".dgal-lb-n").textContent = (cur + 1) + " / " + ITEMS.length;
    lb.querySelector(".dgal-lb-cap").textContent = ITEMS[cur].en;
    if (!lbOpen) { lbOpen = true; lb.classList.add("on"); lb.querySelector(".dgal-back").focus(); }
    /* warm the neighbours */
    [cur + 1, cur - 1].forEach(function (j) { var im = new Image(); im.src = src((j + ITEMS.length) % ITEMS.length); });
  }
  function closeLb() { lbOpen = false; lb.classList.remove("on"); playBtn.focus(); }

  function onKey(ev) {
    if (!ov || !ov.parentNode) return;
    if (ev.key === "Escape") { ev.preventDefault(); if (lbOpen) closeLb(); else close(); }
    else if (lbOpen && ev.key === "ArrowRight") showLb(cur + 1);
    else if (lbOpen && ev.key === "ArrowLeft") showLb(cur - 1);
    else if (!lbOpen && (ev.key === "ArrowRight" || ev.key === "ArrowLeft")) {
      x = wrap(x + (ev.key === "ArrowRight" ? -240 : 240)); paint();
    } else if (!lbOpen && ev.key === " " && document.activeElement === document.body) {
      ev.preventDefault(); setPlaying(!playing);
    } else if (ev.key === "Tab") {                              /* keep focus inside */
      var f = ov.querySelectorAll(lbOpen ? ".dgal-lb button" : ".dgal-top > .dgal-btns button");
      if (!f.length) return;
      var a = f[0], b = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); b.focus(); }
      else if (!ev.shiftKey && document.activeElement === b) { ev.preventDefault(); a.focus(); }
    }
  }

  var prevOverflow = "";
  function open(l) {
    lang = l === "hi" ? "hi" : (l === "en" ? "en" : lang);
    css();
    if (ov && ov.getAttribute("data-lang") !== lang) { ov.remove(); ov = null; }
    if (!ov) { build(); ov.setAttribute("data-lang", lang); }
    else document.body.appendChild(ov);

    lastFocus = document.activeElement;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lbOpen = false; lb.classList.remove("on");
    x = 0; shown = -1; lastT = 0;
    setPlaying(!reducedMotion());
    measure(); paint();
    requestAnimationFrame(function () { ov.classList.add("on"); });
    document.addEventListener("keydown", onKey);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    ov.querySelector(".dgal-x").focus();
  }

  function close() {
    if (!ov) return;
    cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKey);
    ov.classList.remove("on");
    document.body.style.overflow = prevOverflow;
    var node = ov;
    setTimeout(function () { if (node.parentNode && !node.classList.contains("on")) node.parentNode.removeChild(node); }, 250);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();

  return { mount: mount, open: open, close: close, items: ITEMS };
})();
