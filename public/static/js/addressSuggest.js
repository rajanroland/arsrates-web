// arsrates/static/js/addressSuggest.js
// Suggestions while typing an address, shared by the WU finder
// (wu_locations.html) and the exchange-house page (exchange_houses.html).
// Matching landmarks (static/js/wuLandmarks.js, if loaded) show right away;
// addresses follow from Photon (photon.komoot.io, built for search-as-you-type
// on OpenStreetMap data). Nominatim's usage policy doesn't allow autocomplete,
// so pages use it only for their Search button.
//
// setupAddressSuggestions({ input, dropdown, onPick, onType })
//   input:    the text box
//   dropdown: an empty element with class "dropdown-menu"
//   onPick(lat, lon, label): a suggestion was chosen
//   onType(): optional, runs on every keystroke (e.g. to clear the last result)
(function () {
  // Greater Buenos Aires, to keep matches local
  const AMBA = { minLon: -59.2, minLat: -35.2, maxLon: -57.8, maxLat: -34.3 };

  window.setupAddressSuggestions = function ({ input, dropdown, onPick, onType }) {
    let timer = null;
    let request = null;

    function landmarkMatches(query) {
      if (!window.findLandmarks || query.length < 2) return [];
      return window.findLandmarks(query).slice(0, 3).map((i) => {
        const lm = window.WU_LANDMARKS[i];
        return { lat: lm.lat, lon: lm.lon, label: `${lm.name}, ${lm.barrio}`, landmark: true };
      });
    }

    function hide() {
      dropdown.style.display = "none";
    }

    function show(suggestions) {
      if (!suggestions.length) return hide();
      dropdown.innerHTML = "";
      suggestions.forEach((s) => {
        const item = document.createElement("a");
        item.className = "dropdown-item text-wrap";
        item.href = "#";
        item.textContent = s.label;
        if (s.landmark) {
          const tag = document.createElement("small");
          tag.className = "text-muted ms-2";
          tag.textContent = "landmark";
          item.appendChild(tag);
        }
        item.addEventListener("click", (e) => {
          e.preventDefault();
          input.value = s.label;
          hide();
          onPick(s.lat, s.lon, s.label);
        });
        dropdown.appendChild(item);
      });
      // Just below the box, whatever element the dropdown is positioned in
      dropdown.style.display = "block";
      dropdown.style.position = "absolute";
      dropdown.style.zIndex = "1000";
      const parent = dropdown.offsetParent || document.body;
      const p = parent.getBoundingClientRect();
      const r = (input.closest(".input-group") || input).getBoundingClientRect();
      dropdown.style.top = `${r.bottom - p.top + parent.scrollTop}px`;
      dropdown.style.left = `${r.left - p.left + parent.scrollLeft}px`;
      dropdown.style.setProperty("width", `${r.width}px`, "important");   // beats a "w-100" class
      dropdown.style.minWidth = "0";
    }

    async function fetchPlaces(query, landmarks) {
      if (request) request.abort();
      request = new AbortController();
      try {
        const bbox = [AMBA.minLon, AMBA.minLat, AMBA.maxLon, AMBA.maxLat].join(",");
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=${bbox}`,
          { signal: request.signal }
        );
        if (!response.ok) throw new Error(`Photon ${response.status}`);
        const data = await response.json();
        const places = (data.features || []).map((f) => {
          const p = f.properties || {};
          const street = [p.street, p.housenumber].filter(Boolean).join(" ");
          const label = [p.name !== p.street ? p.name : null, street, p.district || p.locality, p.city, p.state]
            .filter(Boolean)
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .join(", ");
          return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], label };
        });
        if (input.value.trim() === query) show([...landmarks, ...places].slice(0, 6));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Address suggestions:", error);
          show(landmarks);
        }
      }
    }

    input.setAttribute("autocomplete", "off");
    input.addEventListener("input", () => {
      clearTimeout(timer);
      if (request) request.abort();
      if (onType) onType();
      const query = input.value.trim();
      const landmarks = landmarkMatches(query);
      show(landmarks);
      if (query.length < 4) return;
      // Wait for a pause in typing, so Photon gets one request, not one per key
      timer = setTimeout(() => fetchPlaces(query, landmarks), 400);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
    document.addEventListener("click", (e) => {
      if (e.target !== input && !dropdown.contains(e.target)) hide();
    });

    return { hide };
  };
})();
