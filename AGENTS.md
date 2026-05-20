# Weather Chrome Extension

Manifest V3 extension. Displays the current temperature on the toolbar badge and dynamically changes the icon based on weather conditions. Requires a WeatherAPI.com API key (configured via options page).

## Commands

- **Lint:** `npm run lint` — ESLint with `unicorn` + `security` plugins; config in `release/config/eslint.config.mjs`
- **Pack:** `npm run pack` — builds `.zip` + `.crx` into `dist/` via `release/scripts/pack.mjs` (requires `../Chrome-Extension-Keys/key.pem` for CRX signing)
- **Install for dev:** Load unpacked from repo root in `chrome://extensions` with Developer Mode on

## Release Process

1. **Bump version** in `manifest.json` `"version"` field
2. **Commit** all changes, push to `main`
3. **Run:** `npm run publish` (or `bash ../release/scripts/tag_release.sh .`)
   - Compares manifest version vs latest git tag
   - If newer: creates tag `v{version}`, builds ZIP+CRX, creates GitHub Release with both artifacts
4. **Requirements:** `gh` CLI authenticated, private key at `../Chrome-Extension-Keys/key.pem`
5. **Never commit** `key.pem`

## Architecture

No bundler — files loaded directly by Chrome. No ES module imports; each script is standalone.

```
background.js          <- service worker entry; fetches weather, updates badge + icon
options.html           <- settings page (API key + city)
  |- options.js        <- reads/writes chrome.storage.sync for settings
icons/                 <- 84 PNG icon variants (per condition + day/night + size)
```

No content scripts, no popup.

## Key Patterns

- **Dynamic icon switching** — `updateIcon(conditionCode, isDay)` maps WeatherAPI condition codes to icon filenames via `weatherIconMap`, then calls `chrome.action.setIcon()` with the matching 16/48/128 PNGs from `icons/`.
- **Badge shows temperature** — `updateBadge(feeText)` formats as whole number + `°` symbol.
- **Action title (tooltip)** — `updateActionTitle()` shows temperature, feels-like, condition text, cloud %, and UV index on hover.
- **Exponential-backoff fetch** — `fetchWithRetry()` same pattern as other extensions.
- **Cache with TTL** — `fetchWeatherData(forceUpdate=false)` checks `chrome.storage.local` with 30-minute TTL.
- **API:** `GET https://api.weatherapi.com/v1/current.json?key={apiKey}&q={city}` — requires user-provided API key.
- **Two-tier storage** — user settings (`weatherApiKey`, `city`) in `chrome.storage.sync`; cached weather data in `chrome.storage.local`.
- **Re-initialization** — `chrome.runtime.onStartup` + `chrome.idle.onStateChanged` re-fetch after browser restart or wake.
- **Alarm** — `chrome.alarms` fires `'updateWeather'` every 30 minutes.
- **Storage keys in `chrome.storage.sync`:** `weatherApiKey` (string), `city` (string).
- **Storage keys in `chrome.storage.local`:** `weatherData` (object), `weatherDataTimestamp` (epoch ms).

## Gotchas

- **No bundler/transpiler** — plain JS loaded by Chrome. Don't use Node.js-only APIs.
- **`../release/` is a separate git repo** (`chrome-ext-release`) containing shared build tooling. Changes to build tooling go there.
- **CSP:** `script-src 'self'` — no inline scripts in HTML; all JS in separate files.
- **`sort -V` is broken on Windows** — if `tag_release.sh` version detection fails, tag manually.
- **Options page uses inline styles** — no external CSS file; styles are embedded in `options.html`.
- **84 icon files** in `icons/` — one set per weather condition per size per day/night variant. Adding new conditions requires adding 6 new PNGs (16/48/128 × day/night).
