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
  ["BLUE", "WU", "VISA", "MC", "AMEX"],
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
  AMEX: "https://www.americanexpress.com.sa/content/exchange-rate-calculator",
  MAYORISTA: "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp",
  WISE: "https://wise.com/us/currency-converter/usd-to-ars-rate",
  REMITLY: "https://www.remitly.com/us/en/argentina",
  TAPTAP: "https://www.taptapsend.com/",
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
    // An estimated rate (MC before it's published) stays grey
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
        // An estimated rate (MC before it's published) gives an estimated comparison
        fontStyle: rateInfo.projected ? "italic" : "normal",
      },
      className,
    },
    text
  );
};

const RateDisplay = ({ rateType, rateInfo, label, feedTimestamp, blueBuy }) => {
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
            fontSize: "1.1rem",
            fontWeight: "600",
            whiteSpace: "nowrap",
          },
        },
        `${buyValue}/${sellValue}`
      );
    } else {
      // Handle single rate value
      if (rateInfo.rate === null && rateInfo.last_rate != null) {
        // Once-a-day rate (AMEX) not in yet today: "NA – <last value>", greyed,
        // with its date, so it reads as missing today but still gives a guide
        const lastDate = new Date(rateInfo.last_as_of).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          timeZone: "America/Argentina/Buenos_Aires",
        });
        return React.createElement("div", { className: "text-muted" }, [
          React.createElement(
            "div",
            {
              style: {
                fontSize: "1.1rem",
                fontWeight: "600",
                fontStyle: "italic",
                whiteSpace: "nowrap",
              },
              key: "value",
            },
            `NA – ${rateInfo.last_rate.toFixed(0)}`
          ),
          React.createElement(
            "div",
            { style: { fontSize: "0.75rem" }, key: "asof" },
            `as of ${lastDate}`
          ),
        ]);
      }

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
            fontSize: "1.1rem",
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

  const getRateUrl = () => RATE_URLS[rateType] || "https://dolarhoy.com";

  return React.createElement(
    "div",
    {
      className: "list-group-item py-1",
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
              color: "#333",
              fontWeight: "600",
              paddingLeft: "8px",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            },
            title: label,
          },
          [
            SHORT_LABELS[rateType] || label,
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
          React.createElement(
            "a",
            {
              href: getRateUrl(),
              target: "_blank",
              style: {
                textDecoration: "none",
                color: "inherit",
              },
              className: "rate-link",
            },
            displayRate()
          )
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
          const lastUpdatedElement = document.getElementById('last-updated');
          if (lastUpdatedElement) {
            const date = new Date(timestamp);
            const dateString = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const timeString = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/Argentina/Buenos_Aires'
            });
            lastUpdatedElement.textContent = `Last Updated: ${dateString}, ${timeString} ARG`;
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
          color: "#6c757d",
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
      className: "list-group-item py-2 bg-light",
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
        style: { height: "8px", backgroundColor: "#f1f3f5" },
      }),
    ...group.map(rowFor),
  ]);

  return React.createElement(
    "div",
    {
      style: {
        maxWidth: "400px",
        margin: "0 auto",
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