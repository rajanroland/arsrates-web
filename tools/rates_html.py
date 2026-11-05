#!/usr/bin/env python3
"""
Writes the current rates into the published home page and today's date into the
sitemap, on each GitHub Pages deploy (called by make_rates_md.py). The live table
is drawn by JavaScript, and most AI crawlers don't run JavaScript, so without
this they'd see no rates. In browsers ratesComponent.js removes this table as
soon as the live one has loaded.

Replaces the <!-- RATES_HTML --> marker in public/index.html. Only the deployed
copy changes, never the file in the repo. Standard library only.
"""
import html
import os
import re

# Same order as the rates table (RATE_GROUPS in ratesComponent.js)
ROWS = ["BLUE", "WU", "VISA", "MC", "AMEX", "TAPTAP", "REMITLY", "WISE", "CRYPTO",
        "OFFICIAL", "MEP", "CCL", "TARJETA", "MAYORISTA"]
MARKER = "<!-- RATES_HTML -->"
HOME_URL = "https://arsrates.com/"


def _num(value):
    return "–" if value is None else f"{float(value):,.0f}"


def rates_table(data, updated):
    rates, labels = data.get("rates", {}), data.get("labels", {})
    rows = []
    for key in ROWS:
        r = rates.get(key)
        if not r:
            continue
        value = f"{_num(r.get('buy'))} / {_num(r.get('sell'))}" if "buy" in r else _num(r.get("rate"))
        label = html.escape(str(labels.get(key, key)))
        if r.get("projected"):
            label += " (est.)"
        change = r.get("change_24h")
        change = f"{change:+.1f}%" if isinstance(change, (int, float)) else "–"
        rows.append(f"<tr><th scope=\"row\">{label}</th><td>{value}</td><td>{change}</td></tr>")
    return (f"<table><caption>Pesos per 1 US dollar. Last updated: {html.escape(updated)}.</caption>"
            "<thead><tr><th scope=\"col\">Rate</th><th scope=\"col\">Buy / sell</th>"
            "<th scope=\"col\">24h</th></tr></thead><tbody>" + "".join(rows) + "</tbody></table>")


def add_to_site(data, updated, site_dir, today):
    """site_dir: the folder being published (public/); today: YYYY-MM-DD."""
    index = os.path.join(site_dir, "index.html")
    with open(index, encoding="utf-8") as f:
        page = f.read()
    if MARKER not in page:
        print("rates_html: marker not found in index.html, skipping")
    else:
        with open(index, "w", encoding="utf-8") as f:
            f.write(page.replace(MARKER, rates_table(data, updated)))
    sitemap = os.path.join(site_dir, "sitemap.xml")
    if os.path.exists(sitemap):
        with open(sitemap, encoding="utf-8") as f:
            text = f.read()
        text = re.sub(rf"<loc>{re.escape(HOME_URL)}</loc>(<lastmod>[^<]*</lastmod>)?",
                      f"<loc>{HOME_URL}</loc><lastmod>{today}</lastmod>", text)
        with open(sitemap, "w", encoding="utf-8") as f:
            f.write(text)
