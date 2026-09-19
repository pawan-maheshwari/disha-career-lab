#!/usr/bin/env python3
"""
DISHA — cut-off watcher.

Runs on a schedule (see .github/workflows/cutoff-watch.yml). For every source
listed in data/cutoffs.json it fetches the page, fingerprints the content and
compares against the last run. When a page changes during its counselling
season, it writes a review queue to cutoff-review.md and exits with a marker
the workflow turns into a GitHub issue.

A deliberate limit
------------------
This detects publication; it does not invent numbers. Closing ranks live in
PDFs and paginated ASP pages that change format between cycles, and a scraper
that silently misreads one is worse than no scraper at all — it is exactly the
failure the tracker exists to prevent. So a human reads the source and adds the
row; the watcher makes sure nobody has to remember to look.

Also reports rows that have gone stale (no verified figure for the current
cycle), so the queue covers both "something new was published" and "we are
behind on this one".

Usage:
    python3 tools/cutoff_watch.py                 # check and write the queue
    python3 tools/cutoff_watch.py --all-seasons   # ignore the season window
    python3 tools/cutoff_watch.py --dry-run       # no state written
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE = os.path.join(ROOT, "data", "watch-state.json")
QUEUE = os.path.join(ROOT, "cutoff-review.md")
UA = "DISHA-cutoff-watcher/1.0 (+https://dishacareerlab.com)"
TIMEOUT = 30

# Where the data file might reasonably live. Checked in order, so a repo that
# keeps it at the root works as well as one with a data/ folder.
DATA_CANDIDATES = [
    os.path.join(ROOT, "data", "cutoffs.json"),
    os.path.join(ROOT, "cutoffs.json"),
    os.path.join(os.getcwd(), "data", "cutoffs.json"),
    os.path.join(os.getcwd(), "cutoffs.json"),
]


def find_data(explicit=None):
    """Return the path to cutoffs.json, or None. Prints every place it looked
    so a missing file is a five-second fix rather than a guessing game."""
    paths = [explicit] if explicit else DATA_CANDIDATES
    for p in paths:
        if p and os.path.isfile(p):
            return p
    print("Could not find cutoffs.json. Looked in:")
    for p in paths:
        print("  -", p)
    print("\nThe repo layout this expects:")
    print("  <repo>/data/cutoffs.json")
    print("  <repo>/tools/cutoff_watch.py")
    print("  <repo>/.github/workflows/cutoff-watch.yml")
    print("\nFound at the repo root instead:")
    try:
        for name in sorted(os.listdir(ROOT))[:40]:
            print("  ", name)
    except OSError:
        pass
    return None


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default if default is not None else {}


def fetch(url):
    """Return (status, fingerprint, note). Never raises — a dead source is a
    finding to report, not a crash that kills the whole run.

    Government sites on nic.in refuse plain programmatic requests from cloud
    IPs. Sending the headers a real browser sends gets past some of them; the
    ones it does not are handled by the mirror list in cutoffs.json."""
    req = urllib.request.Request(url, headers={
        "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/131.0.0.0 Safari/537.36"),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "close",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            body = r.read()
    except urllib.error.HTTPError as e:
        return ("http-%s" % e.code, None, "HTTP %s" % e.code)
    except Exception as e:                                  # noqa: BLE001
        return ("unreachable", None, type(e).__name__)

    text = body.decode("utf-8", "ignore")
    # Strip the things that change on every request (timestamps, view-state,
    # session ids, cache-busting query strings) so a stable page fingerprints
    # the same twice running.
    for pat in (
        r"__VIEWSTATE[^\"']*[\"'][^\"']*[\"']",
        r"__EVENTVALIDATION[^\"']*[\"'][^\"']*[\"']",
        r"\b\d{2}[:/-]\d{2}[:/-]\d{2,4}\b",
        r"\b\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|am|pm)?\b",
        r"[?&](v|t|ts|_|cb)=\d+",
        r"<!--.*?-->",
    ):
        text = re.sub(pat, "", text, flags=re.S)
    text = re.sub(r"\s+", " ", text).strip()
    return ("ok", hashlib.sha256(text.encode("utf-8")).hexdigest()[:16], "%d KB" % (len(body) // 1024))


def fetch_with_mirrors(src):
    """Try the official page first, then any mirrors listed for it.

    A mirror is a secondary site that republishes the same figures within a
    day or two — Careers360, Shiksha and the like. It is NOT a source of
    truth: it only tells us something has been published, which is all the
    watcher claims to do. The number still gets read and entered by a person,
    from whichever page they judge reliable."""
    status, fp, note = fetch(src["url"])
    if status == "ok":
        return status, fp, note, "official"
    for m in src.get("mirrors", []):
        m_status, m_fp, m_note = fetch(m)
        if m_status == "ok":
            return "ok-via-mirror", m_fp, "%s (official: %s)" % (m_note, note), m
    return status, fp, note, None


def in_season(months, today):
    return (not months) or today.month in months


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all-seasons", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--data", help="explicit path to cutoffs.json")
    args = ap.parse_args()

    data_path = find_data(args.data)
    if not data_path:
        return 2
    cfg = read_json(data_path)
    if not cfg:
        print("cutoffs.json at %s is not valid JSON." % data_path)
        return 2
    print("Using %s" % data_path)

    state = read_json(STATE, {"sources": {}})
    today = dt.date.today()
    changed, errors, checked = [], [], 0

    for src in cfg.get("watch", []):
        if not (args.all_seasons or in_season(src.get("season"), today)):
            continue
        checked += 1
        status, fp, note, used = fetch_with_mirrors(src)
        prev = state["sources"].get(src["id"], {})
        entry = {"url": src["url"], "lastChecked": today.isoformat(),
                 "status": status, "readVia": used,
                 "fingerprint": fp or prev.get("fingerprint")}

        if status != "ok":
            errors.append((src, note))
        elif prev.get("fingerprint") and prev["fingerprint"] != fp:
            entry["lastChanged"] = today.isoformat()
            changed.append((src, prev.get("lastChanged", "never")))
        elif not prev.get("fingerprint"):
            entry["lastChanged"] = today.isoformat()

        state["sources"][src["id"]] = entry

    # Tracks with no figure for the current cycle.
    stale = []
    year = today.year
    for tid, t in (cfg.get("tracks") or {}).items():
        years = [a.get("year", 0) for a in (t.get("actual") or [])]
        newest = max(years) if years else None
        if newest is None or newest < year:
            stale.append((tid, t.get("inst", tid), newest))
    for tid in (cfg.get("unverified", {}) or {}).get("tracks", []):
        stale.append((tid, tid, None))

    lines = ["# Cut-off review queue", "",
             "Generated %s by tools/cutoff_watch.py. Checked %d source(s)."
             % (today.isoformat(), checked), ""]

    if changed:
        lines += ["## Sources that changed since the last run", "",
                  "Open each one, read the published figure, and add a sourced row "
                  "to `data/cutoffs.json` (year, quota, category, round, value, url, "
                  "verifiedOn). Do not paste a number you have not seen on the page.", ""]
        for src, when in changed:
            via = state["sources"].get(src["id"], {}).get("readVia")
            tag = "" if via in (None, "official") else "  _(detected via mirror)_"
            lines.append("- [ ] **%s** (%s) — last changed %s — %s%s"
                         % (src["name"], src["body"], when, src["url"], tag))
            if src.get("tracks"):
                lines.append("      affects: %s" % ", ".join(src["tracks"]))
        lines.append("")

    if stale:
        lines += ["## Tracks with no verified figure for %d" % year, ""]
        for tid, inst, newest in sorted(stale, key=lambda r: (r[2] or 0)):
            lines.append("- [ ] `%s` — %s — %s"
                         % (tid, inst, "newest verified: %s" % newest if newest else "never verified"))
        lines.append("")

    if errors:
        lines += ["## Sources that could not be read", "",
                  "Worth checking by hand — a moved URL is a silent failure otherwise.", ""]
        for src, note in errors:
            lines.append("- [ ] %s — %s — %s" % (src["name"], note, src["url"]))
        lines.append("")

    if not (changed or stale or errors):
        lines.append("Nothing to review. Every watched source is unchanged and every "
                     "track has a figure for the current cycle.")

    if not args.dry_run:
        os.makedirs(os.path.dirname(STATE), exist_ok=True)
        with open(STATE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, sort_keys=True)
            f.write("\n")
        with open(QUEUE, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

    print("\n".join(lines))

    # The workflow reads this to decide whether to raise an issue.
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write("needs_review=%s\n" % ("true" if (changed or errors) else "false"))
            f.write("changed_count=%d\n" % len(changed))
            f.write("stale_count=%d\n" % len(stale))
    return 0


if __name__ == "__main__":
    sys.exit(main())
