// arsrates/static/js/config.js
(function() {
    const CONFIG = {
      development: {
        API_URL: "http://localhost:8000",
        FRONTEND_URL: "http://localhost:8000",
        FRONTEND_URL_LOGGED_OUT: "http://localhost:8000",
        FRONTEND_URL_LOGGED_IN: "http://localhost:8000",
        RATES_SOURCE: "api"  // Use API endpoint in development
      },
      production: {
        API_URL: "https://api.arsrates.com",
        FRONTEND_URL: "https://arsrates.com",
        FRONTEND_URL_LOGGED_OUT: "https://arsrates.com",
        FRONTEND_URL_LOGGED_IN: "https://api.arsrates.com",
        RATES_SOURCE: "api"  // Use API endpoint on production server
      },
      githubPages: {
        API_URL: "https://api.arsrates.com",
        FRONTEND_URL: "https://arsrates.com",
        FRONTEND_URL_LOGGED_OUT: "https://arsrates.com",
        FRONTEND_URL_LOGGED_IN: "https://api.arsrates.com",
        RATES_SOURCE: "static"  // Use static file on GitHub Pages
      }
    };
  
    // Determine which environment we're in
    let configKey = "development";
    
    if (window.location.hostname === "api.arsrates.com") {
      configKey = "production";
    } else if (window.location.hostname === "arsrates.com") {
      configKey = "githubPages";
    }
    
    window.APP_CONFIG = CONFIG[configKey];
  })();