/* ===========================================================================
   DISHA WhatsApp entry points  →  window.DISHA_WHATSAPP
   ---------------------------------------------------------------------------
   Opens a chat with the DISHA WhatsApp agent (supabase/functions/whatsapp-agent).
   Nothing shows until CFG.number is set, so this is safe to ship before the
   WhatsApp Business number is live.

     • footer link "Questions? Chat with us on WhatsApp" (all screens)
     • small pill above Ask Dhruv on desktop only — on phones Ask Dhruv stays
       the one floating action (see #disha-declutter)
     • deep link  dishacareerlab.com/#whatsapp   (blog, Instagram bio, posters)
     • DISHA_WHATSAPP.open(lang)

   Edit this file, then: python3 tools/claude/sync_modules.py
   =========================================================================== */
window.DISHA_WHATSAPP = (function () {
  "use strict";

  var CFG = {
    /* WhatsApp Business number, digits only with country code, e.g. "919876543210".
       Empty = every entry point stays hidden. */
    number: "",
    hello: { en: "Hi DISHA! I have a question.", hi: "नमस्ते DISHA! मेरा एक प्रश्न है।" }
  };

  var GREEN = "#25D366", CARDINAL = "#8C1515";

  function lang() {
    try { if ((document.documentElement.lang || "").slice(0, 2) === "hi") return "hi"; } catch (e) {}
    return "en";
  }
  function T(en, hi, l) { return (l || lang()) === "hi" ? hi : en; }
  function ready() { return /^\d{8,15}$/.test(String(CFG.number || "")); }

  function link(l) {
    l = l || lang();
    return "https://wa.me/" + CFG.number + "?text=" + encodeURIComponent(CFG.hello[l] || CFG.hello.en);
  }
  function open(l) {
    if (!ready()) return false;
    var w = window.open(link(l), "_blank", "noopener");
    if (!w) location.href = link(l);
    return true;
  }

  var ICON = '<svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" fill="currentColor">' +
    '<path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8.9 3.8.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4z"/></svg>';

  function css() {
    if (document.getElementById("dwa-css")) return;
    var s = document.createElement("style");
    s.id = "dwa-css";
    s.textContent =
      ".dwa-foot{display:block;margin:10px auto 0;text-align:center;font:600 13px/1.4 system-ui,sans-serif}" +
      ".dwa-foot a{color:" + CARDINAL + ";text-decoration:none;display:inline-flex;gap:6px;align-items:center}" +
      ".dwa-foot svg{color:" + GREEN + "}" +
      "#dwa-pill{display:none}" +
      "@media (min-width:900px){#dwa-pill{display:inline-flex;position:fixed;right:18px;bottom:84px;z-index:9990;" +
      "gap:8px;align-items:center;padding:9px 14px;border-radius:999px;background:" + GREEN + ";color:#fff;" +
      "font:600 13px system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.18)}" +
      "#dwa-pill:hover{filter:brightness(.95)}}" +
      "@media print{.dwa-foot,#dwa-pill{display:none!important}}";
    document.head.appendChild(s);
  }

  function pill() {
    if (document.getElementById("dwa-pill")) return;
    var a = document.createElement("a");
    a.id = "dwa-pill"; a.href = link(); a.target = "_blank"; a.rel = "noopener";
    a.className = "noprint";
    a.innerHTML = ICON + "<span>" + T("WhatsApp us", "WhatsApp करें") + "</span>";
    a.setAttribute("aria-label", T("Chat with DISHA on WhatsApp", "WhatsApp पर DISHA से बात करें"));
    document.body.appendChild(a);
  }

  /* The footer is React-rendered; find it by its text and re-attach if a
     re-render drops our line. */
  function footer() {
    if (document.querySelector(".dwa-foot")) return;
    var nodes = document.querySelectorAll("div,p,footer,span");
    for (var i = nodes.length - 1; i >= 0; i--) {
      var n = nodes[i];
      if (n.children.length < 4 && /^\s*Developed by\s/.test(n.textContent || "") && /PlanetAI/.test(n.textContent)) {
        var d = document.createElement("div");
        d.className = "dwa-foot noprint";
        d.innerHTML = '<a href="' + link() + '" target="_blank" rel="noopener">' + ICON +
          "<span>" + T("Questions? Chat with us on WhatsApp", "प्रश्न हैं? WhatsApp पर बात करें") + "</span></a>";
        n.parentNode.insertBefore(d, n.nextSibling);
        return;
      }
    }
  }

  function mount() {
    if (!ready()) return;
    css(); pill(); footer();
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; footer(); pill(); }, 400);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function deeplink() { if ((location.hash || "") === "#whatsapp") open(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.addEventListener("load", function () { setTimeout(deeplink, 600); });
  window.addEventListener("hashchange", deeplink);

  return { open: open, link: link, ready: ready, cfg: CFG };
})();
