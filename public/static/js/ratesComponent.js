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
    if ("buy" in rateInfo && "sell" in rateInfo) {
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
          `${rateInfo.buy.toFixed(0)}/${rateInfo.sell.toFixed(0)}`
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
          `Mid: ${rateInfo.mid.toFixed(1)}`
        ),
      ]);
    } else {
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
                "(Proj)"
              ),
          ]
        ),
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
            const jsonPath = '/static/data/current_rates.json';
            const response = await fetch(jsonPath, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch rates: ${response.status}`);
            }

            const data = await response.json();

            if (data.timestamp !== lastKnownTimestamp) {
                setRatesData(data);
                setLastKnownTimestamp(data.timestamp);
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
          "24h Chg"
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

// Make RatesContainer available globally
window.RatesContainer = RatesContainer;
