// arsrates/static/js/pageview.js
// Counts one page view per page load (POST /api/pageview, app/routers/analytics.py).
// No cookies: an anonymous random id in localStorage tells new visitors from
// returning ones. To stop counting your own visits on a browser, open any page
// with ?notrack=1 once (?notrack=0 to undo).
(function () {
  const NOTRACK_KEY = "arsrates_notrack";
  const VISITOR_KEY = "arsrates_visitor_id";

  // localStorage can be missing or throw (private mode, blocked storage)
  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    },
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get("notrack") === "1") storage.set(NOTRACK_KEY, "1");
  if (params.get("notrack") === "0") storage.remove(NOTRACK_KEY);
  if (storage.get(NOTRACK_KEY) === "1") return;

  let visitorId = storage.get(VISITOR_KEY);
  let isNewVisitor = false;
  if (!visitorId && window.crypto && window.crypto.randomUUID) {
    const id = window.crypto.randomUUID();
    if (storage.set(VISITOR_KEY, id)) {
      visitorId = id;
      isNewVisitor = true;
    }
  }

  // Only external referrers (moving between our own pages isn't a source)
  let referrerHost = null;
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host !== window.location.hostname && !/(^|\.)arsrates\.com$/.test(host)) {
        referrerHost = host;
      }
    }
  } catch (e) {}

  let timezone = null;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}

  const payload = {
    site: window.location.hostname,
    path: window.location.pathname,
    referrer_host: referrerHost,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    visitor_id: visitorId,
    is_new_visitor: isNewVisitor,
    timezone: timezone,
    language: navigator.language || null,
    webdriver: navigator.webdriver === true,
  };

  const apiUrl = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || "https://api.arsrates.com";
  try {
    // text/plain keeps this a "simple" request: no CORS preflight
    fetch(`${apiUrl}/api/pageview`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {});
  } catch (e) {}
})();
