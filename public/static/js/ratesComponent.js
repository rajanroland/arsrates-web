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
          paddingLeft: "16px",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            display: "inline-block",
            minWidth: "54px",
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
        paddingLeft: "16px",
      },
    },
    React.createElement(
      "span",
      {
        style: {
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
          display: "inline-block",
          minWidth: "54px",
          textAlign: "left",
        },
        className: isPositive ? "text-success" : "text-danger",
      },
      `${Arrow} ${Math.abs(change).toFixed(1)}%`
    )
  );
};

const RateDisplay = ({ rateInfo, label }) => {
  if (!rateInfo) return null;

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
      const midValue = rateInfo.mid !== null ? rateInfo.mid.toFixed(1) : "-";

      return React.createElement("div", null, [
        React.createElement(
          "div",
          {
            style: {
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
            },
            key: "values",
          },
          `${buyValue}/${sellValue}`
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "0.75rem",
            },
            className: "text-muted",
            key: "mid",
          },
          `Mid: ${midValue}`
        ),
      ]);
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

      return React.createElement(
        "div",
        {
          style: {
            fontSize: "0.95rem",
            whiteSpace: "nowrap",
          },
        },
        rateInfo.rate.toFixed(1)
      );
    }
  };

  // Rest of the component code remains the same...

  const getRateUrl = () => {
    switch (label) {
      case "Mastercard":
        return "https://www.mastercard.us/en-us/personal/get-support/convert-currency.html";
      case "Visa":
        return "https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html";
      case "Western Union":
        return "https://www.westernunion.com/us/en/currency-converter/usd-to-ars-rate.html";
      default:
        return "https://dolarhoy.com";
    }
  };

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
          gridTemplateColumns: "180px 140px 70px",
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
              fontSize: "0.875rem",
              color: "#333",
              paddingLeft: "8px",
              display: "flex",
              alignItems: "center",
            },
          },
          [
            label,
            rateInfo.projected &&
              React.createElement(
                "span",
                {
                  key: "proj",
                  style: {
                    fontSize: "0.75rem",
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

  const rateOrder = [
    "BLUE",
    "OFFICIAL",
    "WU",
    "VISA",
    "MC",
    "TARJETA",
    "CRYPTO",
    "CCL",
    "MEP",
  ];

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
          gridTemplateColumns: "180px 140px 70px",
          gap: "0",
          alignItems: "center",
        },
      },
      [
        React.createElement(
          "div",
          {
            key: "type",
            style: {
              width: "100%",
              fontSize: "0.875rem",
              fontWeight: "bold",
              paddingLeft: "8px",
            },
          },
          "Rate Type"
        ),
        React.createElement(
          "div",
          {
            key: "value",
            style: {
              width: "100%",
              textAlign: "right",
              fontSize: "0.875rem",
              fontWeight: "bold",
              paddingRight: "8px",
            },
          },
          "Buy/Sell (Mid)"
        ),
        React.createElement(
          "div",
          {
            key: "change",
            style: {
              width: "100%",
              fontSize: "0.875rem",
              fontWeight: "bold",
              paddingLeft: "8px",
            },
          },
          "24h"
        ),
      ]
    )
  );

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
      ...rateOrder.map((rateType) =>
        React.createElement(RateDisplay, {
          key: rateType,
          rateInfo: ratesData.rates[rateType],
          label: ratesData.labels[rateType],
        })
      ),
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