// ---------- Helpers ----------

const $ = (selector) => document.querySelector(selector);

function mapLink(query) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function formatHours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Turns a weather code (from Open-Meteo) into words and an emoji.
function describeWeather(code) {
  if (code === 0) return ["Clear", "☀️"];
  if (code <= 3) return ["Partly cloudy", "⛅"];
  if (code <= 48) return ["Foggy", "🌫️"];
  if (code <= 67) return ["Rain", "🌧️"];
  if (code <= 77) return ["Snow", "❄️"];
  if (code <= 82) return ["Showers", "🌦️"];
  return ["Thunderstorm", "⛈️"];
}

// A simple weekend tip based on temperature.
function weatherTip(temp) {
  if (temp >= 38) return "Very hot: plan indoor visits and go out after sunset.";
  if (temp >= 30) return "Hot: outdoor trips are best in the morning or evening.";
  if (temp >= 18) return "Great weather for outdoor sightseeing.";
  return "Cool: bring a light jacket for the evenings.";
}

// ---------- State ----------

let selected = COUNTRIES[0];   // the country being explored
const weather = {};            // weather by country id, filled in when loaded
let weatherFailed = false;     // true if the weather could not be loaded

// ---------- Weather ----------

async function loadWeather() {
  const lats = COUNTRIES.map((c) => c.lat).join(",");
  const lons = COUNTRIES.map((c) => c.lon).join(",");
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lats}&longitude=${lons}` +
    "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    const results = Array.isArray(data) ? data : [data];
    results.forEach((r, i) => { weather[COUNTRIES[i].id] = r.current; });
    $("#weather-status").textContent = "Live weather from Open-Meteo.";
  } catch (error) {
    weatherFailed = true;
    $("#weather-status").textContent =
      "Couldn't load live weather. Check your internet connection and refresh.";
  }
  renderWeather();
  renderTip();
}

function renderWeather() {
  $("#weather-grid").innerHTML = COUNTRIES.map((c) => {
    const w = weather[c.id];
    const [label, icon] = w ? describeWeather(w.weather_code)
      : weatherFailed ? ["Unavailable", "❔"] : ["Loading…", "⏳"];
    const temp = w ? `${Math.round(w.temperature_2m)}°C` : "--";
    const wind = w ? `Wind ${Math.round(w.wind_speed_10m)} km/h` : "";
    const active = c.id === selected.id ? " is-active" : "";
    return `
      <button class="weather-card${active}" data-id="${c.id}">
        <span class="weather-country">${c.name}</span>
        <span class="weather-city">${c.capital}</span>
        <span class="weather-temp">${icon} ${temp}</span>
        <span class="weather-meta">${label}${wind ? " · " + wind : ""}</span>
      </button>`;
  }).join("");
}

function renderTip() {
  const w = weather[selected.id];
  $("#weather-tip").textContent = w
    ? `${selected.capital} now: ${Math.round(w.temperature_2m)}°C. ${weatherTip(w.temperature_2m)}`
    : "";
}

// ---------- Places and hotels ----------

function renderPlaces() {
  $("#places").innerHTML = selected.places.map((p) => `
    <article class="card">
      <div class="card-image card-image--${selected.id}"></div>
      <div class="card-body">
        <span class="card-city">${p.city}</span>
        <h3>${p.name}</h3>
        <p>${p.text}</p>
        <a class="button" target="_blank" rel="noopener"
           href="${mapLink(p.name + ", " + p.city)}">View on map</a>
      </div>
    </article>`).join("");
}

function renderHotels() {
  $("#hotels").innerHTML = selected.hotels.map((h) => `
    <article class="hotel">
      <div>
        <span class="tag">${h.type}</span>
        <h3>${h.name}</h3>
        <p>${h.city}</p>
      </div>
      <a class="button button--ghost" target="_blank" rel="noopener"
         href="${mapLink(h.name + ", " + h.city)}">Find hotel</a>
    </article>`).join("");
}

// ---------- Routes: car or plane? ----------

function findRoute(fromId, toId) {
  return ROUTES[`${fromId}-${toId}`] || ROUTES[`${toId}-${fromId}`];
}

function renderRoute() {
  const from = COUNTRIES.find((c) => c.id === $("#origin").value);
  const to = selected;
  const box = $("#route");

  if (from.id === to.id) {
    box.innerHTML = `<p class="muted">You're already in ${to.name}. Choose a different starting point.</p>`;
    return;
  }

  const r = findRoute(from.id, to.id);
  // Driving: about 90 km/h on average, plus about 1 hour per border crossing.
  const carMinutes = (r.km / 90) * 60 + r.borders * 60;
  // Flying: flight time plus about 3 hours for getting to the airport, check-in, and arrival.
  const planeMinutes = r.flight + 180;
  // Driving is usually cheaper and you have your car there, so we recommend it
  // unless it takes more than 2 hours longer than flying.
  const best = carMinutes <= planeMinutes + 120 ? "car" : "plane";
  const reason = best === "car"
    ? "Driving is recommended: it isn't much slower, it's usually cheaper, and you'll have your car there."
    : `Flying is recommended: it saves about ${formatHours(carMinutes - planeMinutes)}.`;

  const drivingUrl =
    "https://www.google.com/maps/dir/?api=1&travelmode=driving" +
    `&origin=${encodeURIComponent(from.capital + ", " + from.name)}` +
    `&destination=${encodeURIComponent(to.capital + ", " + to.name)}`;

  box.innerHTML = `
    <div class="route-option${best === "car" ? " is-best" : ""}">
      ${best === "car" ? '<span class="badge">Recommended</span>' : ""}
      <h3>🚗 By car</h3>
      <p class="route-big">${formatHours(carMinutes)}</p>
      <p>About ${r.km.toLocaleString()} km · ${r.borders} border crossing${r.borders > 1 ? "s" : ""}</p>
      <a class="button button--ghost" target="_blank" rel="noopener" href="${drivingUrl}">Open driving route</a>
    </div>
    <div class="route-option${best === "plane" ? " is-best" : ""}">
      ${best === "plane" ? '<span class="badge">Recommended</span>' : ""}
      <h3>✈️ By plane</h3>
      <p class="route-big">${formatHours(planeMinutes)}</p>
      <p>${formatHours(r.flight)} flight ${from.airport} → ${to.airport}, plus about 3h at airports</p>
    </div>
    <p class="tip route-reason">${reason}</p>`;
}

// ---------- Selecting a country ----------

function selectCountry(id) {
  selected = COUNTRIES.find((c) => c.id === id);
  document.querySelectorAll(".country-name").forEach((el) => { el.textContent = selected.name; });
  $("#route-destination").textContent = `${selected.capital}, ${selected.name}`;
  renderWeather();
  renderTip();
  renderPlaces();
  renderHotels();
  renderRoute();
}

// ---------- Start ----------

$("#origin").innerHTML = COUNTRIES.map(
  (c) => `<option value="${c.id}">${c.capital}, ${c.name}</option>`
).join("");

$("#weather-grid").addEventListener("click", (event) => {
  const card = event.target.closest(".weather-card");
  if (card) {
    selectCountry(card.dataset.id);
    $("#explore").scrollIntoView({ behavior: "smooth" });
  }
});

$("#origin").addEventListener("change", renderRoute);

$("#origin").value = "KW";  // trips start from Kuwait by default
selectCountry("SA");
loadWeather();
