# GCC Weekend Explorer

A one-page practice website for planning weekend trips across the GCC
(Kuwait, Saudi Arabia, Bahrain, Qatar, UAE, Oman).

## Features

- **Shams, your guide**: a cartoon sun who greets you by name and reacts as you use the page
- **Quick setup**: on your first visit, enter your name and home city (or skip to use the defaults). Saved in your browser.
- **Today's top 3 places**: ranked using the season and the current weather
- **3 KPIs**: best weather right now, weekend countdown, and your quickest getaway
- **"Plan my escape" form**: dropdown menus for From, To, Travel by, and Vibe, which build a mini trip plan
- **Live weather** for every GCC capital (from the free [Open-Meteo](https://open-meteo.com) API, no account needed)
- **Best places and hotels** for each country, with map links
- **Car or plane?**: estimates both, recommends one, and animates the trip

## Files

- `index.html`: the page structure (the sections and empty spaces that get filled in)
- `styles.css`: the visual design (colors, layout, cards, buttons)
- `data.js`: all the content (countries, places with their vibe and best months, hotels, distances, and flight times). Edit this file to change what the site shows.
- `app.js`: the logic (setup, Shams' messages, weather, top picks, KPIs, car vs plane, the trip planner form)

## Run it locally

**Option 1: just open the file**
Double-click `index.html`. It opens in your web browser. You need an internet connection for the weather.

**Option 2: use a local web server** (needs Python installed)

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. Press `Ctrl+C` in the terminal to stop the server.

## Notes

Distances, driving times, and flight times are rough estimates. Hotels are example suggestions.
Always check prices, border requirements, and flight schedules before you travel.
