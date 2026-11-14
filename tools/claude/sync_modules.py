#!/usr/bin/env python3
"""Inline the module .js files into index.html — so Claude edits a small file
(30–230 KB) instead of the 2.8 MB page.

index.html ships each module inside <script id="disha-…">…</script>. The .js file
next to it is the editable source of truth; this script copies it in.

  python3 tools/claude/sync_modules.py            # write changes into index.html
  python3 tools/claude/sync_modules.py --check    # exit 1 if any block is out of sync

Only replaces the body of an existing <script id="…"> block; it never adds or
removes blocks. To add a new module, add the <script id="disha-xyz"></script>
placeholder in index.html once (small Edit), then add a line to MODULES below.
"""
import re, sys

PAGE = "index.html"
MODULES = {
    "disha-webinar-module": "webinar-module.js",
    "disha-dimensions-module": "dimensions-module.js",
    "disha-earlybird-module": "earlybird-module.js",
    "disha-sample-module": "sample-module.js",
    "disha-v2-layer": "disha-v2-layer.js",
    "disha-elite-layer": "disha-elite-layer.js",
    "disha-bank-500": "disha-bank-500.js",
}


def main(check):
    page = open(PAGE, encoding="utf-8").read()
    changed = []
    for sid, path in MODULES.items():
        src = open(path, encoding="utf-8").read().strip()
        if "</script" in src.lower():
            sys.exit(f"{path}: contains '</script' — escape it as '<\\/script' before inlining")
        rx = re.compile(r'(<script id="%s"[^>]*>)(.*?)(</script>)' % re.escape(sid), re.S)
        m = rx.search(page)
        if not m:
            sys.exit(f'{PAGE}: <script id="{sid}"> not found')
        if m.group(2).strip() == src:
            continue
        changed.append(path)
        if not check:
            page = page[:m.start(2)] + "\n" + src + "\n" + page[m.end(2):]
    if check:
        print("out of sync: " + ", ".join(changed) if changed else "all modules in sync")
        return 1 if changed else 0
    if changed:
        open(PAGE, "w", encoding="utf-8").write(page)
    print("synced: " + ", ".join(changed) if changed else "nothing to sync")
    return 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
