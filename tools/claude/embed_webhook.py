"""Copy disha-webhook.gs into the APPS_SCRIPT array in index.html so the
script shown in Settings and the repo copy never drift.
Usage: python3 tools/claude/embed_webhook.py [--dry]"""
import json, sys
html, gs = "index.html", "disha-webhook.gs"
dry = "--dry" in sys.argv
src = open(html, encoding="utf-8").read()
start = src.index("  var APPS_SCRIPT = [\n")
end = src.index('  ].join("\\n");', start)
body = open(gs, encoding="utf-8").read().rstrip("\n").split("\n")
lines = ",\n".join("    " + json.dumps(l, ensure_ascii=False) for l in body)
new = "  var APPS_SCRIPT = [\n" + lines + "\n"
if dry:
    print("IDENTICAL" if src[start:end] == new else "DIFFERENT")
else:
    open(html, "w", encoding="utf-8").write(src[:start] + new + src[end:])
    print("written")
