// arsrates/static/js/config.js
(function() {
  const CONFIG = {
      development: {
          API_URL: "http://localhost:8000",
          FRONTEND_URL: "http://localhost:8000",
          FRONTEND_URL_LOGGED_OUT: "http://localhost:8000",
          FRONTEND_URL_LOGGED_IN: "http://localhost:8000"
      },
      production: {
          API_URL: "https://api.arsrates.com",
          FRONTEND_URL: "https://arsrates.com",
          FRONTEND_URL_LOGGED_OUT: "https://arsrates.com",
          FRONTEND_URL_LOGGED_IN: "https://api.arsrates.com"
      }
  };

  const isProd = window.location.hostname === "arsrates.com";
  window.APP_CONFIG = isProd ? CONFIG.production : CONFIG.development;
})();