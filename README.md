# GCC Weekend Explorer

A one-page practice website for planning weekend trips across the GCC
(Kuwait, Saudi Arabia, Bahrain, Qatar, UAE, Oman).

## Features

- **Live weather** for every GCC capital (from the free [Open-Meteo](https://open-meteo.com) API, no account needed)
- **Best places to go** in each country, with map links
- **Hotel suggestions** for each country
- **Car or plane?** Pick a starting city and the page estimates driving and flying time and recommends one

## Files

- `index.html`: the page structure (the sections and empty spaces that get filled in)
- `styles.css`: the visual design (colors, layout, cards, buttons)
- `data.js`: all the content (countries, places, hotels, distances, and flight times). Edit this file to change what the site shows.
- `app.js`: the logic (loads the weather, reacts to clicks, works out car vs plane)

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
