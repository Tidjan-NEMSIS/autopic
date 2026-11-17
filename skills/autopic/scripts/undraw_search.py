"""
unDraw Search & Download Script
Searches the unDraw.co illustration catalog via their search API and downloads SVGs.

Usage:
    python undraw_search.py --query "teamwork" [--limit 5] [--download] [--output ./public/illustrations]
    python undraw_search.py --build-catalog [--output ./undraw-catalog.json]

API (as of 2026):
    GET https://undraw.co/api/search?q=<keyword>&page=<n>
    Response: { results: [{_id, title, newSlug, media}], total, hasMore, page }
    - 40 results per page
    - Query must be >= 3 characters
    - media field = CDN URL to SVG (https://cdn.undraw.co/illustration/<slug>.svg)
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error


UNDRAW_SEARCH_API = "https://undraw.co/api/search"
RESULTS_PER_PAGE = 40

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://undraw.co/illustrations",
}


def fetch_search(query: str, page: int = 0) -> dict:
    """Search unDraw illustrations by keyword.
    Returns dict with keys: results, total, hasMore, page.
    """
    url = f"{UNDRAW_SEARCH_API}?q={urllib.request.quote(query)}&page={page}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 400:
            body = e.read().decode("utf-8", errors="replace")
            print(f"[error] API error: {body}", file=sys.stderr)
        else:
            print(f"[warn] HTTP {e.code} for query '{query}' page {page}", file=sys.stderr)
        return {"results": [], "total": 0, "hasMore": False, "page": page}
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"[warn] Failed to fetch: {e}", file=sys.stderr)
        return {"results": [], "total": 0, "hasMore": False, "page": page}


def search_illustrations(query: str, limit: int = 5) -> list:
    """Search illustrations by keyword, paginating as needed up to `limit` results."""
    if len(query) < 3:
        print(f"[error] Query must be at least 3 characters (got '{query}')", file=sys.stderr)
        return []

    all_results = []
    page = 0

    while len(all_results) < limit:
        data = fetch_search(query, page)
        results = data.get("results", [])

        if not results:
            break

        for item in results:
            all_results.append({
                "title": item.get("title", ""),
                "slug": item.get("newSlug", ""),
                "media": item.get("media", ""),
                "id": item.get("_id", ""),
            })
            if len(all_results) >= limit:
                break

        if not data.get("hasMore", False):
            break
        page += 1

    return all_results


def build_catalog(output_path: str) -> list:
    """Build a local catalog by searching broad categories.
    Since unDraw has no 'list all' endpoint, we use broad keyword searches.
    """
    # Broad keywords that cover most of the catalog
    categories = [
        "man", "woman", "the", "work", "app", "code", "data", "design",
        "web", "mobile", "cloud", "social", "business", "team", "online",
        "digital", "technology", "creative", "education", "health",
        "finance", "security", "communication", "marketing", "analytics",
        "developer", "product", "project", "customer", "shopping",
        "music", "video", "photo", "travel", "food", "nature",
        "sport", "game", "book", "email", "chat", "search",
        "file", "server", "database", "network", "home", "city",
        "robot", "artificial", "machine", "learning", "crypto",
        "startup", "launch", "success", "error", "empty", "loading",
    ]

    seen_ids = set()
    catalog = []

    for i, keyword in enumerate(categories):
        print(f"[info] Scanning '{keyword}' ({i+1}/{len(categories)})...", file=sys.stderr)
        page = 0
        while True:
            data = fetch_search(keyword, page)
            results = data.get("results", [])
            if not results:
                break

            for item in results:
                item_id = item.get("_id", "")
                if item_id and item_id not in seen_ids:
                    seen_ids.add(item_id)
                    catalog.append({
                        "title": item.get("title", ""),
                        "slug": item.get("newSlug", ""),
                        "media": item.get("media", ""),
                        "id": item_id,
                    })

            if not data.get("hasMore", False):
                break
            page += 1
            time.sleep(0.2)  # Be polite to the API

        time.sleep(0.3)

    print(f"[info] Catalog complete: {len(catalog)} unique illustrations", file=sys.stderr)

    if output_path:
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
        print(f"[info] Saved catalog to {output_path}", file=sys.stderr)

    return catalog


def slugify(text: str) -> str:
    """Convert a title to a filesystem-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text.strip('-')


def download_svg(url: str, output_path: str) -> bool:
    """Download an SVG file from a URL."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"[error] Failed to download {url}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Search and download unDraw.co illustrations")
    parser.add_argument("--query", "-q", type=str, help="Search keyword(s) (min 3 chars)")
    parser.add_argument("--limit", "-l", type=int, default=5, help="Max results (default: 5)")
    parser.add_argument("--download", "-d", action="store_true", help="Download matched SVGs")
    parser.add_argument("--output", "-o", type=str, default="./illustrations", help="Output directory for downloads or catalog file path")
    parser.add_argument("--build-catalog", action="store_true", help="Build full local catalog via broad searches")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    if args.build_catalog:
        output = args.output if args.output.endswith(".json") else os.path.join(args.output, "undraw-catalog.json")
        build_catalog(output)
        return

    if not args.query:
        parser.error("--query is required (or use --build-catalog)")

    results = search_illustrations(args.query, args.limit)

    if not results:
        print(f"No illustrations found for '{args.query}'", file=sys.stderr)
        sys.exit(1)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(f"Found {len(results)} illustration(s) for '{args.query}':\n")
        for i, r in enumerate(results, 1):
            print(f"  {i}. {r['title']}")
            print(f"     SVG: {r['media']}")
            print(f"     Slug: {r['slug']}")
            print()

    if args.download:
        os.makedirs(args.output, exist_ok=True)
        for r in results:
            filename = f"{r['slug']}.svg"
            filepath = os.path.join(args.output, filename)
            print(f"Downloading {r['title']}...", file=sys.stderr)
            if download_svg(r["media"], filepath):
                print(f"  ✅ Saved: {filepath}")
            else:
                print(f"  ❌ Failed: {r['title']}")


if __name__ == "__main__":
    main()
