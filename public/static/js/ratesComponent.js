// arsrates/static/js/ratesComponent.js

const { useState, useEffect } = React;

const RateChangeDisplay = ({ change }) => {
  if (!change && change !== 0) return null;

  const isPositive = change > 0;
  const isFlat = Math.abs(change) < 0.05;

  if (isFlat) {
    return React.createElement(
      "div",
      {
        style: {
          width: "100%",
          paddingLeft: "8px",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
            display: "inline-block",
            minWidth: "48px",
            textAlign: "left",
          },
          className: "text-muted",
        },
        "−"
      )
    );
  }

  const Arrow = isPositive ? "▲" : "▼";

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        paddingLeft: "8px",
      },
    },
    React.createElement(
      "span",
      {
        style: {
          fontSize: "0.8rem",
          whiteSpace: "nowrap",
          display: "inline-block",
          minWidth: "48px",
          textAlign: "left",
        },
        className: isPositive ? "text-success" : "text-danger",
      },
      `${Arrow} ${Math.abs(change).toFixed(1)}%`
    )
  );
};

// A rate updated on every run is flagged when it lags the latest run by more
// than this (runs are 15 min apart by day, hourly at night)
const STALE_AFTER_MS = 90 * 60 * 1000;

// Show the "vs Blue" column (set to false to hide it)
const SHOW_VS_BLUE = true;

// Columns shared by the header and every row: label, rate, 24h[, vs Blue].
// Proportional so the table fits a phone screen.
const GRID_COLUMNS = SHOW_VS_BLUE
  ? "minmax(0, 1.2fr) minmax(0, 1.45fr) minmax(0, 0.8fr) minmax(0, 0.8fr)"
  : "minmax(0, 1.3fr) minmax(0, 1.5fr) minmax(0, 0.9fr)";

// Rows in display order; a thin band separates the groups
const RATE_GROUPS = [
  ["BLUE"], // the benchmark for "vs Blue", on its own
  ["WU", "VISA", "MC", "AMEX"],
  ["TAPTAP", "REMITLY", "WISE"],
  ["CRYPTO"],
  ["OFFICIAL", "MEP", "CCL", "TARJETA", "MAYORISTA"],
];

// Short labels for the table; the full name from the JSON is the tooltip
const SHORT_LABELS = {
  BLUE: "D. Blue",
  WU: "WU",
  VISA: "Visa",
  MC: "MC",
  AMEX: "AMEX",
  TAPTAP: "TapTap",
  REMITLY: "Remitly",
  WISE: "Wise",
  CRYPTO: "USDC",
  OFFICIAL: "D. Oficial",
  MEP: "D. MEP",
  CCL: "D. CCL",
  TARJETA: "D. Tarjeta",
  MAYORISTA: "D. Mayorista",
};

// Where each rate links to (DolarHoy for the rest)
const RATE_URLS = {
  MC: "https://www.mastercard.com/global/en/personal/get-support/currency-exchange-rate-converter.html",
  VISA: "https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html",
  WU: "https://www.westernunion.com/us/en/currency-converter/usd-to-ars-rate.html",
  AMEX: null, // estimate from BCRA's A3500 (see getratescomparisonhours.sql); no source page
  MAYORISTA: "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp",
  WISE: "https://wise.com/us/currency-converter/usd-to-ars-rate",
  REMITLY: "https://www.remitly.com/us/en/argentina",
  TAPTAP: "https://www.taptapsend.com/",
};

// Shown when a rate name is hovered or tapped: full name and what the rate is
const RATE_INFO = {
  BLUE: ["Dólar Blue", "Informal (street) market rate: what cuevas pay (buy) and charge (sell) for cash dollars."],
  WU: ["Western Union", "Rate for sending dollars to pesos with Western Union. Doesn't include WU's fees."],
  VISA: ["Visa", "Visa sets one rate per day for all card charges in pesos, unlike market rates, which move during the day. Sunday and Monday use Saturday's rate. It follows the previous day's MEP but runs about 6.5% below it. Assumes no foreign transaction fee."],
  MC: ["Mastercard", "Mastercard sets one rate per day, published around 3 PM ET. Until then it's estimated (Est.) from Visa's rate, which MC matches on weekdays. Saturday and Sunday use Friday's rate. Assumes no foreign transaction fee."],
  AMEX: ["American Express", "AMEX uses one rate per day: BCRA's Mayorista (A3500) from 2 business days earlier, with no markup. The charge shows its final dollar amount right away (AMEX used to charge the official rate and refund the difference later). Shown as an estimate (Est.), typically within 0.1% of real charges, unless we have an actual charge for the day."],
  TAPTAP: ["TapTap Send", "Rate for sending dollars to pesos with TapTap Send (US to Argentina). Doesn't include fees."],
  REMITLY: ["Remitly", "Remitly's standard rate (not the first-transfer promo rate). Doesn't include fees."],
  WISE: ["Wise", "Rate for sending dollars to pesos with Wise. Doesn't include fees."],
  CRYPTO: ["USDC", "Price of the USDC dollar stablecoin in pesos on Argentine crypto exchanges."],
  OFFICIAL: ["Dólar Oficial", "Official retail rate at banks."],
  MEP: ["Dólar MEP (Bolsa)", "Legal rate for buying or selling dollars through bonds in a local brokerage account."],
  CCL: ["Dólar CCL (Contado con liquidación)", "Rate for moving dollars into or out of Argentina through securities (bonds, CEDEARs) settled abroad."],
  TARJETA: ["Dólar Tarjeta", "Oficial sell + 30%: roughly what a foreign-currency charge costs on an Argentine card paid in pesos."],
  MAYORISTA: ["Dólar Mayorista (A3500)", "BCRA's wholesale reference rate, published on business days around 4 PM. Shows the latest published value."],
};

// "vs Blue" compares each row with Blue buy (compra): what a cueva pays for a
// dollar, the benchmark for someone turning dollars into pesos. Buy/sell rows
// use their own buy price so both sides match. Not shown for Blue itself or for
// Tarjeta (what card charges cost in pesos, not a rate you can sell dollars at).
const NO_VS_BLUE = ["BLUE", "TARJETA"];

// Gaps smaller than this stay grey: too small to call better or worse
const VS_BLUE_NEUTRAL_PCT = 0.5;

// Colored by +/- sign only, no arrows: arrows in the 24h column mean the rate
// moved; this column is a gap to Blue right now. Above Blue (green) is a better
// deal for someone turning dollars into pesos.
const VsBlueDisplay = ({ rateType, rateInfo, blueBuy }) => {
  const value = "buy" in rateInfo ? rateInfo.buy : rateInfo.rate;
  let text = "−";
  let className = "text-muted";
  if (NO_VS_BLUE.includes(rateType)) {
    text = "—";
  } else if (value != null && blueBuy) {
    const pct = ((value - blueBuy) / blueBuy) * 100;
    const sign = pct >= 0.05 ? "+" : pct <= -0.05 ? "−" : "";
    text = `${sign}${Math.abs(pct).toFixed(1)}%`;
    // An estimated rate (MC before it's published, AMEX) stays grey
    if (!rateInfo.projected && Math.abs(pct) >= VS_BLUE_NEUTRAL_PCT) {
      className = pct > 0 ? "text-success" : "text-danger";
    }
  }

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        paddingLeft: "8px",
        fontSize: "0.8rem",
        whiteSpace: "nowrap",
        // An estimated rate (MC before it's published, AMEX) gives an estimated comparison
        fontStyle: rateInfo.projected ? "italic" : "normal",
      },
      className,
    },
    text
  );
};

const RateDisplay = ({ rateType, rateInfo, label, feedTimestamp, blueBuy }) => {
  // Rate-name tooltip: opens on hover, or on tap (phones have no hover)
  const [showInfo, setShowInfo] = useState(false);
  if (!rateInfo) return null;

  // Only today's values are sent; show the time of one that stopped updating
  const staleAsOf =
    rateInfo.as_of &&
    feedTimestamp &&
    new Date(feedTimestamp) - new Date(rateInfo.as_of) > STALE_AFTER_MS
      ? new Date(rateInfo.as_of).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Argentina/Buenos_Aires",
        })
      : null;

  const displayRate = () => {
    // Check if rate is a buy/sell pair
    if ("buy" in rateInfo && "sell" in rateInfo) {
      // Handle null values in buy/sell rates
      if (rateInfo.buy === null && rateInfo.sell === null) {
        return React.createElement(
          "div",
          {
            style: {
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
            },
          },
          "Not Available"
        );
      }

      // Format the buy/sell display
      const buyValue = rateInfo.buy !== null ? rateInfo.buy.toFixed(0) : "-";
      const sellValue = rateInfo.sell !== null ? rateInfo.sell.toFixed(0) : "-";

      return React.createElement(
        "div",
        {
          style: {
            fontSize: "1.2rem",
            fontWeight: "600",
            whiteSpace: "nowrap",
          },
        },
        `${buyValue}/${sellValue}`
      );
    } else {
      // Handle single rate value
      if (rateInfo.rate === null) {
        return React.createElement(
          "div",
          {
            style: {
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
            },
          },
          "Not Available"
        );
      }

      const rateValue = React.createElement(
        "div",
        {
          style: {
            fontSize: "1.2rem",
            fontWeight: "600",
            whiteSpace: "nowrap",
          },
          key: "value",
        },
        rateInfo.rate.toFixed(0)
      );

      if (!staleAsOf) return rateValue;

      return React.createElement("div", null, [
        rateValue,
        React.createElement(
          "div",
          {
            style: {
              fontSize: "0.75rem",
            },
            className: "text-muted",
            key: "asof",
          },
          `as of ${staleAsOf}`
        ),
      ]);
    }
  };

  // null = no link (AMEX); missing = DolarHoy
  const rateUrl = rateType in RATE_URLS ? RATE_URLS[rateType] : "https://dolarhoy.com";
  const info = RATE_INFO[rateType];

  return React.createElement(
    "div",
    {
      className: "list-group-item py-1",
      // Keep an open tooltip above the rows below it
      style: showInfo ? { zIndex: 5 } : undefined,
    },
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          width: "100%",
          gridTemplateColumns: GRID_COLUMNS,
          gap: "0",
          alignItems: "center",
        },
      },
      [
        React.createElement(
          "div",
          {
            key: "label",
            style: {
              width: "100%",
              fontSize: "0.95rem",
              color: "#374151",
              fontWeight: "500",
              paddingLeft: "8px",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            },
            className: info ? "rate-label" : undefined,
            title: info ? undefined : label,
            tabIndex: info ? 0 : undefined,
            onMouseEnter: info ? () => setShowInfo(true) : undefined,
            onMouseLeave: info ? () => setShowInfo(false) : undefined,
            // Not a toggle: a tap fires mouseenter first, which already opened it.
            // Tapping elsewhere (blur) or moving the mouse away closes it.
            onClick: info ? () => setShowInfo(true) : undefined,
            onBlur: info ? () => setShowInfo(false) : undefined,
          },
          [
            React.createElement(
              "span",
              { key: "name", className: info ? "rate-label-name" : undefined },
              SHORT_LABELS[rateType] || label
            ),
            rateInfo.projected &&
              React.createElement(
                "span",
                {
                  key: "proj",
                  style: {
                    fontSize: "0.75rem",
                    fontWeight: "normal",
                    marginLeft: "4px",
                  },
                  className: "text-muted",
                },
                "(Est.)"
              ),
            info &&
              showInfo &&
              React.createElement(
                "div",
                { key: "tip", className: "rate-tip", role: "tooltip" },
                [
                  React.createElement("strong", { key: "n" }, info[0]),
                  React.createElement("div", { key: "d" }, info[1]),
                ]
              ),
          ]
        )

        ,
        React.createElement(
          "div",
          {
            key: "rate",
            style: {
              width: "100%",
              textAlign: "right",
              paddingRight: "8px",
            },
          },
          rateUrl
            ? React.createElement(
                "a",
                {
                  href: rateUrl,
                  target: "_blank",
                  style: {
                    textDecoration: "none",
                    color: "inherit",
                  },
                  className: "rate-link",
                },
                displayRate()
              )
            : displayRate()
        ),
        React.createElement(RateChangeDisplay, {
          key: "change",
          change: rateInfo.change_24h,
        }),
        SHOW_VS_BLUE &&
          React.createElement(VsBlueDisplay, {
            key: "vsblue",
            rateType,
            rateInfo,
            blueBuy,
          }),
      ]
    )
  );
};

// "● Updated 4 min ago · Oct 6, 8:00 AM ARG". The dot is green while the data
// is fresh (runs are 15 min apart by day, hourly at night) and grey once stale.
const STALE_DOT_AFTER_MIN = 90;
function paintFreshness() {
  const el = document.getElementById("last-updated");
  const timestamp = window.__ratesTimestamp;
  if (!el || !timestamp) return;
  const when = new Date(timestamp);
  const mins = Math.max(0, Math.round((Date.now() - when) / 60000));
  const ago = mins < 1 ? "just now"
    : mins < 60 ? `${mins} min ago`
    : mins < 48 * 60 ? `${Math.round(mins / 60)} h ago`
    : `${Math.round(mins / 1440)} days ago`;
  const exact = when.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const dot = document.createElement("span");
  dot.className = "live-dot" + (mins > STALE_DOT_AFTER_MIN ? " stale" : "");
  el.replaceChildren(dot, `Updated ${ago} · ${exact} ARG`);
}

const RatesContainer = () => {
  const [ratesData, setRatesData] = useState(null);
  const [lastKnownTimestamp, setLastKnownTimestamp] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // First, determine which URL to use based on hostname
        let url;
        if (window.location.hostname === 'arsrates.com') {
          // Special case for GitHub Pages
          url = '/static/data/current_rates.json';
          console.log('GitHub Pages detected, using static file path:', url);
        } else {
          // For API server (both development and production)
          const apiUrl = window.APP_CONFIG?.API_URL || 'https://api.arsrates.com';
          url = `${apiUrl}/api/rates`;
          console.log('API server detected, using API endpoint:', url);
        }

        console.log(`Fetching rates from: ${url}`);

        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch rates: ${response.status}`);
        }
        console.log("Parsing response...");
        const data = await response.json();
        console.log("Response parsed successfully, contains data:", !!data);

        // In the useEffect of RatesContainer:
        const updateLastUpdated = (timestamp) => {
          window.__ratesTimestamp = timestamp;
          paintFreshness();
          // Keep "N min ago" current between updates
          if (!window.__freshnessTimer) {
            window.__freshnessTimer = setInterval(paintFreshness, 60 * 1000);
          }
        };

        // Update the fetch rates section to use this:
        if (data.timestamp !== lastKnownTimestamp) {
          setRatesData(data);
          setLastKnownTimestamp(data.timestamp);
          updateLastUpdated(data.timestamp);
        }


      } catch (error) {
        console.error("Error loading rates:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [lastKnownTimestamp]);

  if (!ratesData) {
    return React.createElement(
      "div",
      {
        className: "alert alert-info",
      },
      "Loading rates..."
    );
  }

  const headerCell = (key, text, extraStyle = {}, title) =>
    React.createElement(
      "div",
      {
        key,
        style: {
          width: "100%",
          fontSize: "0.7rem",
          fontWeight: "600",
          letterSpacing: "0.04em",
          color: "inherit",
          whiteSpace: "nowrap",
          ...extraStyle,
        },
        title,
      },
      text
    );

  const headers = React.createElement(
    "div",
    {
      className: "list-group-item py-2 rates-header",
      style: { width: "100%" },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          width: "100%",
          gridTemplateColumns: GRID_COLUMNS,
          gap: "0",
          alignItems: "center",
        },
      },
      [
        headerCell("type", "RATE TYPE", { paddingLeft: "8px" }),
        headerCell("value", "BUY/SELL", { textAlign: "right", paddingRight: "8px" }),
        headerCell("change", "VS 24H", { paddingLeft: "8px" }),
        SHOW_VS_BLUE &&
          headerCell("vsblue", "VS BLUE", { paddingLeft: "8px" },
                     "Compared with Dólar Blue buy (compra)"),
      ]
    )
  );

  const rowFor = (rateType) =>
    React.createElement(RateDisplay, {
      key: rateType,
      rateType,
      rateInfo: ratesData.rates[rateType],
      label: ratesData.labels[rateType],
      feedTimestamp: ratesData.timestamp,
      blueBuy: ratesData.rates.BLUE && ratesData.rates.BLUE.buy,
    });

  const rows = RATE_GROUPS.flatMap((group, i) => [
    i > 0 &&
      React.createElement("div", {
        key: `sep-${i}`,
        className: "rates-band",
        style: { height: "8px" },
      }),
    ...group.map(rowFor),
  ]);

  return React.createElement(
    "div",
    {
      // Fill the column (.rates-wrap sets the width). Auto margins would shrink
      // it to its content inside the list-group's flex layout.
      style: {
        width: "100%",
      },
      className: "rates-container",
    },
    [
      headers,
      ...rows,
    ]
  );
};

// Add ErrorBoundary class after RatesContainer
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Rate display error:', error);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        { className: "alert alert-warning" },
        "Error displaying rates. Please refresh the page."
      );
    }
    return this.props.children;
  }
}

// Create App component that wraps RatesContainer with ErrorBoundary
const App = () => {
  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(RatesContainer)
  );
};

// Replace the original export with App
window.RatesContainer = App;