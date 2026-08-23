#!/usr/bin/env python3
"""Verify a built Hugo site: every page renders and every internal link resolves.

Usage:
    python3 scripts/check-site.py [public-dir]

Checks performed against the generated output:

  1. Every page listed in sitemap.xml exists on disk.
  2. Every internal link, image, stylesheet and script target exists on disk.
     Targets written as absolute URLs under the site's own baseURL count as
     internal, because Hugo emits absolute permalinks for processed images.
  3. Every in-page fragment (#anchor) has a matching id/name on its target page.
  4. The expected top-level pages exist and are non-empty.

External URLs are inventoried but never fetched, so the check stays fast and
does not fail because somebody else's server is down.

Exits non-zero and prints every problem found, so a broken build fails CI
instead of shipping dead links.
"""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "public").resolve()
REPO = Path(__file__).resolve().parent.parent

BASE_URL = "https://risanb.com/"
config = REPO / "config.yaml"
if config.is_file():
    m = re.search(r'^baseURL:\s*"?([^"\s]+)"?', config.read_text(encoding="utf-8"), re.M)
    if m:
        BASE_URL = m.group(1)
BASE_HOST = urlsplit(BASE_URL).netloc

REQUIRED = ["index.html", "404.html", "about/index.html", "blog/index.html",
            "code/index.html", "categories/index.html", "tags/index.html",
            "index.xml", "sitemap.xml"]

LINK_ATTRS = {"a": "href", "link": "href", "area": "href",
              "img": "src", "script": "src", "source": "src", "iframe": "src"}
SKIP_SCHEMES = ("mailto:", "tel:", "javascript:", "data:", "#!")


class PageParser(HTMLParser):
    """Collect link targets and anchor ids from one page.

    Using a real parser rather than a regex matters: page summaries end up
    inside meta description attributes, and those summaries can contain text
    that merely looks like markup (code samples showing `<a href="...">`).
    A regex scan treats that text as a link; a parser correctly sees it as an
    attribute value.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.targets: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ("id", "name"):
            if a.get(key):
                self.ids.add(a[key])
        attr = LINK_ATTRS.get(tag)
        if attr and a.get(attr):
            self.targets.append(a[attr].strip())

    handle_startendtag = handle_starttag


def parse(path: Path) -> PageParser:
    p = PageParser()
    p.feed(path.read_text(encoding="utf-8", errors="replace"))
    p.close()
    return p


def target_path(url_path: str) -> Path:
    """Map an internal URL path to the file that should satisfy it."""
    p = ROOT / unquote(url_path.lstrip("/"))
    if url_path.endswith("/") or p.is_dir():
        return p / "index.html"
    return p


def main() -> int:
    if not ROOT.is_dir():
        print(f"FATAL: build directory {ROOT} does not exist -- did hugo run?")
        return 2

    problems: list[str] = []
    pages = sorted(ROOT.rglob("*.html"))
    parsed = {page: parse(page) for page in pages}

    # 1. required pages
    for rel in REQUIRED:
        f = ROOT / rel
        if not f.is_file():
            problems.append(f"missing required page: {rel}")
        elif f.stat().st_size == 0:
            problems.append(f"required page is empty: {rel}")

    # 2. sitemap coverage
    sitemap = ROOT / "sitemap.xml"
    sitemap_urls: list[str] = []
    if sitemap.is_file():
        raw = sitemap.read_text(encoding="utf-8", errors="replace")
        for loc in re.findall(r"<loc>\s*(.*?)\s*</loc>", raw, re.S):
            sitemap_urls.append(loc)
            parts = urlsplit(loc)
            if parts.netloc and parts.netloc != BASE_HOST:
                problems.append(f"sitemap entry points off-site: {loc}")
            elif not target_path(parts.path or "/").is_file():
                problems.append(f"sitemap entry has no generated file: {loc}")

    # 3. links, images and assets
    anchors_needed: dict[Path, set[str]] = {}
    checked = external = 0

    for page in pages:
        rel_page = page.relative_to(ROOT)
        for raw in parsed[page].targets:
            if not raw or raw.startswith(SKIP_SCHEMES):
                continue
            parts = urlsplit(raw)

            if parts.scheme in ("http", "https") or raw.startswith("//"):
                if parts.netloc != BASE_HOST:
                    external += 1
                    continue
                url_path = parts.path or "/"
            elif parts.scheme:
                external += 1
                continue
            elif not parts.path and parts.fragment:
                anchors_needed.setdefault(page, set()).add(parts.fragment)
                continue
            elif raw.startswith("/"):
                url_path = parts.path
            else:
                resolved = (page.parent / parts.path).resolve()
                try:
                    rel = resolved.relative_to(ROOT)
                except ValueError:
                    problems.append(f"{rel_page}: link escapes site root -> {raw}")
                    continue
                url_path = "/" + str(rel).replace("\\", "/")
                if parts.path.endswith("/"):
                    url_path += "/"

            checked += 1
            tp = target_path(url_path)
            if not tp.is_file():
                problems.append(f"{rel_page}: broken internal link -> {raw}")
            elif parts.fragment and tp.suffix == ".html":
                anchors_needed.setdefault(tp, set()).add(parts.fragment)

    # 4. fragments
    fragments = 0
    for target, frags in sorted(anchors_needed.items()):
        have = parsed[target].ids if target in parsed else parse(target).ids
        for frag in sorted(frags):
            fragments += 1
            if frag not in have:
                problems.append(f"{target.relative_to(ROOT)}: missing anchor #{frag}")

    print(f"build dir      : {ROOT}")
    print(f"base URL       : {BASE_URL}")
    print(f"html pages     : {len(pages)}")
    print(f"sitemap URLs   : {len(sitemap_urls)}")
    print(f"internal links : {checked} checked")
    print(f"fragments      : {fragments} checked")
    print(f"external links : {external} inventoried (not fetched)")

    if problems:
        print(f"\n{len(problems)} problem(s) found:")
        for p in problems[:200]:
            print(f"  - {p}")
        if len(problems) > 200:
            print(f"  ... and {len(problems) - 200} more")
        return 1

    print("\nOK: all pages present, all internal links and anchors resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
