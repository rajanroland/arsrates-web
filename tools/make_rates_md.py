#!/usr/bin/env python3
"""
Plain-text rates for AI tools and scripts: arsrates.com/rates.md.

Runs in the arsrates-web GitHub Pages deploy (its workflow calls
tools/make_rates_md.py before uploading the site), so rates.md always matches
the current_rates.json being published, without an extra commit per rate run.
The prod build copies this file to the Pages repo's tools/ folder.

    python3 make_rates_md.py public/static/data/current_rates.json public/rates.md

Standard library only (it runs on GitHub's build machine).
"""
import json
import sys
from datetime import datetime, timedelta, timezone

ARG = timezone(timedelta(hours=-3))   # Argentina, no daylight saving

# Same groups and order as the rates table (RATE_GROUPS in ratesComponent.js)
GROUPS = [
    ("Market", ["BLUE", "OFFICIAL", "MEP", "CCL", "MAYORISTA", "TARJETA", "CRYPTO"]),
    ("Sending money (headline rate, before fees)", ["WU", "TAPTAP", "REMITLY", "WISE"]),
    ("Card charges in pesos (one rate per day; no foreign transaction fee)", ["VISA", "MC", "AMEX"]),
]
NOTES = {
    "BLUE": "informal market rate for cash dollars",
    "OFFICIAL": "official retail rate at banks",
    "MEP": "legal rate via bonds in a local brokerage account",
    "CCL": "rate for moving dollars in or out via securities",
    "MAYORISTA": "Central Bank wholesale reference rate (A3500)",
    "TARJETA": "official sell + 30%, cost of card charges paid in pesos with an Argentine card",
    "CRYPTO": "USDC stablecoin on Argentine exchanges",
    "VISA": "one rate per day for all charges",
    "MC": "one rate per day, published around 3 PM ET",
    "AMEX": "one rate per day: A3500 from 2 business days before the charge",
}
# What an estimate ("projected") is based on
ESTIMATE_NOTES = {
    "MC": "estimated from Visa until Mastercard publishes today's rate",
    "AMEX": "estimate; real charges have matched it within about 0.1%",
}


def fmt(value):
    return "–" if value is None else f"{float(value):,.2f}"


def main(src, dst):
    data = json.load(open(src))
    rates, labels = data.get("rates", {}), data.get("labels", {})
    updated = data.get("timestamp") or data.get("last_updated") or ""
    try:
        when = datetime.fromisoformat(str(updated))
        if when.tzinfo:
            when = when.astimezone(ARG)
        updated = when.strftime("%Y-%m-%d %H:%M") + " Argentina time (UTC-3)"
    except ValueError:
        pass

    out = [
        "# Dollar to peso rates in Argentina (ARS per 1 USD)",
        "",
        f"Last updated: {updated}. Source: https://arsrates.com (updated every 15 minutes, "
        "07:00-21:00 Argentina time, hourly overnight). For information only.",
        "",
    ]
    for title, keys in GROUPS:
        out += [f"## {title}", "", "| Rate | Pesos per USD | Change 24h | Notes |", "|---|---|---|---|"]
        for key in keys:
            r = rates.get(key)
            if not r:
                continue
            note = NOTES.get(key, "")
            if r.get("projected"):
                note = (note + "; " if note else "") + ESTIMATE_NOTES.get(key, "estimate")
            change = r.get("change_24h")
            change = f"{change:+.2f}%" if isinstance(change, (int, float)) else "–"
            if "buy" in r:
                value = f"{fmt(r.get('buy'))} buy / {fmt(r.get('sell'))} sell"
            else:
                value = fmt(r.get("rate"))
            out.append(f"| {labels.get(key, key)} | {value} | {change} | {note} |")
        out.append("")
    out += [
        "Buy = pesos you get when you sell 1 US dollar; sell = pesos you pay to buy 1 US dollar.",
        "Guides: https://arsrates.com/guide",
        "",
    ]
    with open(dst, "w") as f:
        f.write("\n".join(out))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
