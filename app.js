// =====================================================================
//  GCC Weekend Explorer: page logic
//  Sections: helpers · profile · Shams · weather · top picks · KPIs ·
//            places & hotels · routes · trip planner · start-up
// =====================================================================

// ---------- Helpers ----------

const $ = (selector) => document.querySelector(selector);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const byId = (id) => COUNTRIES.find((c) => c.id === id);

function mapLink(query) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function formatHours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = String(Math.round(minutes % 60)).padStart(2, "0");
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const monthName = () => new Date().toLocaleDateString("en-GB", { month: "long" });

// Turns a weather code (from Open-Meteo) into words and an emoji.
// Typical (not live) weather has no code.
function describeWeather(code) {
  if (code == null) return [`Typical ${monthName()} high`, "📊"];
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

// Animates a number counting up from 0 (skipped if the user prefers less motion).
function countUp(el, target) {
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  const duration = 900;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Profile (your name and home city) ----------
// Saved in the browser so the page remembers you next time.

const DEFAULT_PROFILE = { name: "Explorer", home: "KW" };

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("gcc-profile"));
    if (saved && saved.name && byId(saved.home)) return saved;
  } catch (error) { /* storage unavailable: use defaults */ }
  return null;
}

function saveProfile() {
  try { localStorage.setItem("gcc-profile", JSON.stringify(profile)); } catch (error) { /* ignore */ }
}

// ---------- State ----------

let profile = loadProfile() || { ...DEFAULT_PROFILE };
let selected = COUNTRIES[0];   // the country being explored
let routeMode = null;          // "car" or "plane" shown in the route animation
const weather = {};            // weather by country id, filled in when loaded
let weatherFailed = false;     // true if the weather could not be loaded

// ---------- Shams the mascot ----------

function say(text) {
  const bubble = $("#bubble");
  bubble.textContent = text;
  // Restart the "pop" animation on the bubble and the wiggle on Shams
  for (const el of [bubble, $(".hero .mascot")]) {
    el.classList.remove("is-talking");
    void el.offsetWidth;   // forces the browser to notice the class was removed
    el.classList.add("is-talking");
  }
}

function renderGreeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  $("#greeting").textContent = `${part}, ${profile.name}!`;
  $("#today").textContent = "Today is " + new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  $("#cta-title").textContent = `Got the weekend itch, ${profile.name}? 🧳`;
}

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
    // No live weather (offline, or blocked): fall back to the usual daytime high for this month
    weatherFailed = true;
    const month = new Date().getMonth();
    COUNTRIES.forEach((c) => {
      weather[c.id] = { temperature_2m: c.typicalHighs[month], weather_code: null, typical: true };
    });
    $("#weather-status").textContent =
      `Live weather isn't available right now, so these are typical ${monthName()} daytime highs.`;
  }
  renderWeather();
  renderTip();
  renderTopPicks();
  renderKpis();

  const coolest = coolestCountry();
  const w = weather[coolest.id];
  say(w.typical
    ? `${coolest.capital} is usually the coolest capital in ${monthName()}, at about ${w.temperature_2m}°C. 😎`
    : `It's ${Math.round(w.temperature_2m)}°C in ${coolest.capital}, the coolest capital right now. 😎`);
}

function renderWeather() {
  $("#weather-grid").innerHTML = COUNTRIES.map((c, i) => {
    const w = weather[c.id];
    const [label, icon] = w ? describeWeather(w.weather_code)
      : weatherFailed ? ["Unavailable", "❔"] : ["Loading…", "⏳"];
    const temp = w ? `${Math.round(w.temperature_2m)}°C` : "--";
    const wind = w && w.wind_speed_10m != null ? `Wind ${Math.round(w.wind_speed_10m)} km/h` : "";
    const active = c.id === selected.id ? " is-active" : "";
    return `
      <button class="weather-card pop-in${active}" style="--i:${i}" data-id="${c.id}">
        <span class="weather-country">${c.name}</span>
        <span class="weather-city">${c.capital}</span>
        <span class="weather-temp"><span class="weather-icon">${icon}</span> ${temp}</span>
        <span class="weather-meta">${label}${wind ? " · " + wind : ""}</span>
      </button>`;
  }).join("");
}

function renderTip() {
  const w = weather[selected.id];
  if (!w) { $("#weather-tip").textContent = ""; return; }
  const intro = w.typical
    ? `${selected.capital} in ${monthName()}: usually about ${w.temperature_2m}°C.`
    : `${selected.capital} now: ${Math.round(w.temperature_2m)}°C.`;
  $("#weather-tip").textContent = `${intro} ${weatherTip(w.temperature_2m)}`;
}

function coolestCountry() {
  const withWeather = COUNTRIES.filter((c) => weather[c.id]);
  if (withWeather.length === 0) return null;
  return withWeather.reduce((a, b) =>
    weather[a.id].temperature_2m <= weather[b.id].temperature_2m ? a : b);
}

// ---------- Today's top picks ----------
// Each place gets a score: in season = +3; outdoor places score higher when
// it's cooler; indoor places get a bonus when it's very hot.

function scorePlace(place, country) {
  const month = new Date().getMonth() + 1;
  const w = weather[country.id];
  const temp = w ? w.temperature_2m : 32;   // assume a warm day until weather loads
  let score = place.months.includes(month) ? 3 : 0;
  if (place.outdoor) score += (34 - temp) / 3;
  else if (temp >= 34) score += 1;
  return score;
}

function topPicks(count) {
  const all = COUNTRIES.flatMap((country) =>
    country.places.map((place) => ({ place, country, score: scorePlace(place, country) })));
  all.sort((a, b) => b.score - a.score);
  // Take the best place from different countries so the list has variety
  const picks = [];
  for (const item of all) {
    if (!picks.some((p) => p.country.id === item.country.id)) picks.push(item);
    if (picks.length === count) break;
  }
  return picks;
}

function renderTopPicks() {
  const month = new Date().getMonth() + 1;
  $("#top-picks").innerHTML = topPicks(3).map(({ place, country }, i) => {
    const w = weather[country.id];
    const reasons = [
      place.months.includes(month) ? "In season" : "Off season",
      place.outdoor ? "Outdoors" : "Indoors",
      w ? `${w.typical ? "Usually " : ""}${Math.round(w.temperature_2m)}°C in ${country.capital}` : null
    ].filter(Boolean).join(" · ");
    return `
      <button class="pick pop-in" style="--i:${i}" data-id="${country.id}">
        <span class="pick-rank">#${i + 1}</span>
        <span class="pick-country">${country.name} · ${VIBES[place.vibe]}</span>
        <span class="pick-name">${place.name}</span>
        <span class="pick-why">${reasons}</span>
      </button>`;
  }).join("");
}

// ---------- KPIs ----------

function renderKpis() {
  // 1. Best weather right now: the coolest capital
  const coolest = coolestCountry();
  if (coolest) {
    const w = weather[coolest.id];
    $("#kpi-weather").innerHTML = `${coolest.name} · <span class="count">0</span>°C`;
    countUp($("#kpi-weather .count"), Math.round(w.temperature_2m));
    $("#kpi-weather-sub").textContent = w.typical
      ? `Typical ${monthName()} high in ${coolest.capital}, usually the coolest GCC capital this month`
      : `${describeWeather(w.weather_code)[0]} in ${coolest.capital}, the coolest GCC capital right now`;
  }

  // 2. Weekend countdown (the GCC weekend is Friday and Saturday)
  const day = new Date().getDay();   // 0 = Sunday ... 5 = Friday, 6 = Saturday
  if (day === 5 || day === 6) {
    $("#kpi-weekend").textContent = "It's the weekend! 🎉";
    $("#kpi-weekend-sub").textContent = "Make the most of it: see today's top picks above";
  } else if (day === 4) {
    $("#kpi-weekend").textContent = "Starts tomorrow";
    $("#kpi-weekend-sub").textContent = "Pack tonight and leave Friday morning";
  } else {
    $("#kpi-weekend").innerHTML = `<span class="count">0</span> days to go`;
    countUp($("#kpi-weekend .count"), 5 - day);
    $("#kpi-weekend-sub").textContent = "Until Friday: perfect time to plan";
  }

  // 3. Quickest getaway from your home city
  const home = byId(profile.home);
  const fastest = COUNTRIES
    .filter((c) => c.id !== home.id)
    .map((c) => ({ country: c, trip: tripTimes(home.id, c.id) }))
    .sort((a, b) => a.trip.bestMinutes - b.trip.bestMinutes)[0];
  $("#kpi-trip-label").textContent = `Quickest getaway from ${home.capital}`;
  $("#kpi-trip").textContent = fastest.country.name;
  $("#kpi-trip-sub").textContent =
    `${formatHours(fastest.trip.bestMinutes)} door to door by ${fastest.trip.best}`;
}

// ---------- Places and hotels ----------

function renderPlaces() {
  $("#places").innerHTML = selected.places.map((p, i) => `
    <article class="card pop-in" style="--i:${i}">
      <div class="card-image card-image--${selected.id}">
        <span class="card-vibe">${VIBES[p.vibe]}</span>
      </div>
      <div class="card-body">
        <span class="card-city">${p.city} · ${p.outdoor ? "Outdoors" : "Indoors"}</span>
        <h3>${p.name}</h3>
        <p>${p.text}</p>
        <a class="button" target="_blank" rel="noopener"
           href="${mapLink(p.name + ", " + p.city)}">View on map</a>
      </div>
    </article>`).join("");
}

function renderHotels() {
  $("#hotels").innerHTML = selected.hotels.map((h, i) => `
    <article class="hotel slide-in" style="--i:${i}">
      <span class="hotel-icon">🏨</span>
      <div class="hotel-info">
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

// Works out door-to-door times and which way Shams recommends.
function tripTimes(fromId, toId) {
  const r = findRoute(fromId, toId);
  // Driving: about 90 km/h on average, plus about 1 hour per border crossing.
  const carMinutes = (r.km / 90) * 60 + r.borders * 60;
  // Flying: flight time plus about 3 hours for getting to the airport, check-in, and arrival.
  const planeMinutes = r.flight + 180;
  // Driving is usually cheaper and you have your car there, so we recommend it
  // unless it takes more than 2 hours longer than flying.
  const best = carMinutes <= planeMinutes + 120 ? "car" : "plane";
  const bestMinutes = best === "car" ? carMinutes : planeMinutes;
  return { r, carMinutes, planeMinutes, best, bestMinutes };
}

// Draws the animated trip: a line from A to B with a car or plane moving along it.
function routeMapSvg(from, to, mode) {
  const path = mode === "plane"
    ? "M60 120 Q300 -20 540 120"              // a high arc for flying
    : "M60 120 C200 160 400 80 540 120";      // a gentle road
  const vehicle = mode === "plane"
    ? `<text class="vehicle" dominant-baseline="central" text-anchor="middle">✈️</text>`
    : `<text class="vehicle" dominant-baseline="central" text-anchor="middle" transform="scale(-1 1)">🚗</text>`;
  // Before the animation starts (or if motion is reduced) the vehicle waits halfway
  const motion = reduceMotion ? "" :
    `<animateMotion dur="3.2s" repeatCount="indefinite" begin="indefinite" path="${path}" calcMode="spline"
       keyTimes="0;1" keySplines="0.45 0 0.55 1"/>`;
  return `
    <svg viewBox="0 0 600 170" class="route-svg" role="img"
         aria-label="${mode === "plane" ? "Flight" : "Drive"} from ${from.capital} to ${to.capital}">
      <path d="${path}" class="route-track"/>
      <path d="${path}" class="route-line route-line--${mode}" pathLength="1"/>
      <circle cx="60" cy="120" r="9" class="route-dot"/>
      <circle cx="540" cy="120" r="9" class="route-dot route-dot--end"/>
      <circle cx="540" cy="120" r="9" class="route-pulse"/>
      <text x="60" y="155" text-anchor="middle" class="route-label">${from.capital}</text>
      <text x="540" y="155" text-anchor="middle" class="route-label">${to.capital}</text>
      <g transform="${reduceMotion ? (mode === "plane" ? "translate(300 50)" : "translate(300 110)") : ""}">
        ${motion}
        ${vehicle}
      </g>
    </svg>`;
}

function startRouteAnimation(container) {
  container.querySelectorAll("animateMotion").forEach((a) => a.beginElement());
}

function renderRouteMap(from, to) {
  const box = $("#route-map");
  box.innerHTML = `
    <div class="toggle" role="group" aria-label="Show trip by">
      <button data-mode="car" class="${routeMode === "car" ? "is-on" : ""}">🚗 Car</button>
      <button data-mode="plane" class="${routeMode === "plane" ? "is-on" : ""}">✈️ Plane</button>
    </div>
    ${routeMapSvg(from, to, routeMode)}`;
  startRouteAnimation(box);
  document.querySelectorAll(".route-option").forEach((el) =>
    el.classList.toggle("is-showing", el.dataset.mode === routeMode));
}

function renderRoute() {
  const from = byId($("#origin").value);
  const to = selected;

  if (from.id === to.id) {
    $("#route-map").innerHTML = "";
    $("#route").innerHTML = `<p class="muted">You're already in ${to.name}. Choose a different starting point.</p>`;
    return;
  }

  const t = tripTimes(from.id, to.id);
  routeMode = t.best;
  const reason = t.best === "car"
    ? "Driving is recommended: it isn't much slower, it's usually cheaper, and you'll have your car there."
    : `Flying is recommended: it saves about ${formatHours(t.carMinutes - t.planeMinutes)}.`;

  const drivingUrl =
    "https://www.google.com/maps/dir/?api=1&travelmode=driving" +
    `&origin=${encodeURIComponent(from.capital + ", " + from.name)}` +
    `&destination=${encodeURIComponent(to.capital + ", " + to.name)}`;

  $("#route").innerHTML = `
    <div class="route-option pop-in${t.best === "car" ? " is-best" : ""}" data-mode="car" style="--i:0">
      ${t.best === "car" ? '<span class="badge">Recommended</span>' : ""}
      <h3>🚗 By car</h3>
      <p class="route-big">${formatHours(t.carMinutes)}</p>
      <p>About ${t.r.km.toLocaleString()} km · ${t.r.borders} border crossing${t.r.borders > 1 ? "s" : ""}</p>
      <a class="button button--ghost" target="_blank" rel="noopener" href="${drivingUrl}">Open driving route</a>
    </div>
    <div class="route-option pop-in${t.best === "plane" ? " is-best" : ""}" data-mode="plane" style="--i:1">
      ${t.best === "plane" ? '<span class="badge">Recommended</span>' : ""}
      <h3>✈️ By plane</h3>
      <p class="route-big">${formatHours(t.planeMinutes)}</p>
      <p>${formatHours(t.r.flight)} flight ${from.airport} → ${to.airport}, plus about 3h at airports</p>
    </div>
    <p class="tip route-reason">${reason}</p>`;
  renderRouteMap(from, to);
}

// ---------- Selecting a country ----------

function selectCountry(id) {
  selected = byId(id);
  document.querySelectorAll(".country-name").forEach((el) => { el.textContent = selected.name; });
  $("#route-destination").textContent = `${selected.capital}, ${selected.name}`;
  renderWeather();
  renderTip();
  renderPlaces();
  renderHotels();
  renderRoute();
}

function exploreCountry(id) {
  selectCountry(id);
  say(pickRandom([
    `Ooh, ${selected.name}! Great pick. 👌`,
    `${selected.name} it is! Here's what I'd see.`,
    `Yalla, ${selected.name}! Scroll down for hotels and routes.`
  ]));
  $("#explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

// ---------- Trip planner popup ----------

function countryOptions(includeSurprise) {
  const surprise = includeSurprise ? `<option value="random">🎲 Surprise me</option>` : "";
  return surprise + COUNTRIES.map((c) => `<option value="${c.id}">${c.capital}, ${c.name}</option>`).join("");
}

function openPlanner() {
  $("#plan-from").value = profile.home;
  $("#plan-to").value = selected.id !== profile.home ? selected.id : "random";
  $("#plan-error").textContent = "";
  $("#plan-form").hidden = false;
  $("#plan-result").hidden = true;
  $("#plan-dialog").showModal();
}

function makePlan(event) {
  event.preventDefault();
  const from = byId($("#plan-from").value);
  let toId = $("#plan-to").value;
  if (toId === "random") {
    toId = pickRandom(COUNTRIES.filter((c) => c.id !== from.id)).id;
  }
  if (toId === from.id) {
    $("#plan-error").textContent = "You're already there! Pick a different destination. 😄";
    return;
  }
  $("#plan-error").textContent = "";
  const to = byId(toId);
  const vibe = $("#plan-vibe").value;
  const t = tripTimes(from.id, to.id);
  const mode = $("#plan-mode").value === "auto" ? t.best : $("#plan-mode").value;
  const minutes = mode === "car" ? t.carMinutes : t.planeMinutes;

  // Best place for the chosen vibe, otherwise Shams' top-scoring place there
  const ranked = [...to.places].sort((a, b) => scorePlace(b, to) - scorePlace(a, to));
  const match = to.places.find((p) => p.vibe === vibe);
  const place = match || ranked[0];
  const hotel = (vibe === "beach" && to.hotels.find((h) => /beach|seafront/i.test(h.type))) || to.hotels[0];

  const w = weather[to.id];
  const weatherLine = w && w.typical
    ? `Usually about ${w.temperature_2m}°C in ${to.capital} in ${monthName()}. ${weatherTip(w.temperature_2m)}`
    : w
    ? `${Math.round(w.temperature_2m)}°C and ${describeWeather(w.weather_code)[0].toLowerCase()} in ${to.capital}. ${weatherTip(w.temperature_2m)}`
    : "Live weather isn't available right now. Check the forecast before you go.";
  const modeNote = mode !== t.best
    ? ` (Shams would go by ${t.best}: ${formatHours(t.bestMinutes)}.)` : " Shams' pick! 👍";
  const placeNote = match || vibe === "any" ? "" : `<em>No ${VIBES[vibe].toLowerCase()} spot here, so this is my top pick instead.</em><br>`;

  const result = $("#plan-result");
  result.innerHTML = `
    <h2>Your weekend in ${to.name} ${mode === "car" ? "🚗" : "✈️"}</h2>
    <p class="muted">From ${from.capital}${vibe !== "any" ? " · " + VIBES[vibe] : ""}</p>
    <div class="route-map route-map--small">${routeMapSvg(from, to, mode)}</div>
    <div class="plan-step pop-in" style="--i:0"><span>🌤️</span>
      <div><strong>Weather</strong><p>${weatherLine}</p></div></div>
    <div class="plan-step pop-in" style="--i:1"><span>${mode === "car" ? "🚗" : "✈️"}</span>
      <div><strong>Getting there</strong><p>By ${mode}: about ${formatHours(minutes)} door to door.${modeNote}</p></div></div>
    <div class="plan-step pop-in" style="--i:2"><span>📍</span>
      <div><strong>Must-see</strong><p>${placeNote}<b>${place.name}</b> (${place.city}): ${place.text}</p></div></div>
    <div class="plan-step pop-in" style="--i:3"><span>🏨</span>
      <div><strong>Stay at</strong><p><a href="${mapLink(hotel.name + ", " + hotel.city)}" target="_blank" rel="noopener">${hotel.name}</a> · ${hotel.type}, ${hotel.city}</p></div></div>
    <div class="modal-actions">
      <button class="button button--ghost" id="plan-again" type="button">Plan another</button>
      <button class="button" id="plan-explore" type="button">Explore ${to.name}</button>
    </div>`;
  $("#plan-form").hidden = true;
  result.hidden = false;
  startRouteAnimation(result);

  $("#plan-again").onclick = () => { result.hidden = true; $("#plan-form").hidden = false; };
  $("#plan-explore").onclick = () => {
    $("#plan-dialog").close();
    $("#origin").value = from.id;
    exploreCountry(to.id);
  };
  say(`Your ${to.name} plan is ready, ${profile.name}! ${mode === "car" ? "Road trip! 🍿" : "Window seat, please! ✈️"}`);
}

// ---------- First-time setup popup ----------

function openSetup() {
  $("#setup-name").value = profile.name === DEFAULT_PROFILE.name ? "" : profile.name;
  $("#setup-home").value = profile.home;
  $("#setup-dialog").showModal();
}

function applyProfile(isNew) {
  saveProfile();
  $("#origin").value = profile.home;
  renderGreeting();
  renderKpis();
  renderRoute();
  if (isNew) say(`Nice to meet you, ${profile.name}! Here's what's good this weekend. 🌴`);
}

// ---------- Start ----------

// Fill the dropdown menus
$("#origin").innerHTML = countryOptions(false);
$("#setup-home").innerHTML = countryOptions(false);
$("#plan-from").innerHTML = countryOptions(false);
$("#plan-to").innerHTML = countryOptions(true);
$("#plan-vibe").innerHTML = `<option value="any">✨ Anything goes</option>` +
  Object.entries(VIBES).map(([key, label]) => `<option value="${key}">${label}</option>`).join("");

// Clicks
$("#weather-grid").addEventListener("click", (event) => {
  const card = event.target.closest(".weather-card");
  if (card) exploreCountry(card.dataset.id);
});
$("#top-picks").addEventListener("click", (event) => {
  const pick = event.target.closest(".pick");
  if (pick) exploreCountry(pick.dataset.id);
});
$("#route-map").addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  routeMode = button.dataset.mode;
  renderRouteMap(byId($("#origin").value), selected);
  say(routeMode === "car" ? "Road trip! Don't forget the snacks. 🍿" : "Window seat, please! ✈️");
});
$("#origin").addEventListener("change", renderRoute);
$("#open-planner").addEventListener("click", openPlanner);
$("#close-planner").addEventListener("click", () => $("#plan-dialog").close());
$("#plan-form").addEventListener("submit", makePlan);
$("#edit-profile").addEventListener("click", openSetup);

// Clicking the dark area outside a popup closes it
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
});

// When the setup popup closes, save the name (or the defaults)
$("#setup-dialog").addEventListener("close", () => {
  const isNew = !loadProfile();
  if ($("#setup-dialog").returnValue === "save") {
    profile = {
      name: $("#setup-name").value.trim() || DEFAULT_PROFILE.name,
      home: $("#setup-home").value
    };
  }
  $("#setup-dialog").returnValue = "";
  applyProfile(isNew);
});
$("#setup-skip").addEventListener("click", () => $("#setup-dialog").close("skip"));

// First render
$("#origin").value = profile.home;
renderGreeting();
const firstPick = topPicks(COUNTRIES.length).find((p) => p.country.id !== profile.home);
selectCountry(firstPick.country.id);
renderTopPicks();
renderKpis();
say(`Marhaba, ${profile.name}! I'm Shams, your weekend guide. ☀️`);
loadWeather();

// First visit: ask for a name and home city
if (!loadProfile()) openSetup();
