# Personal Dashboard

Pitch-black, white-text, starfield dashboard. Clock, weather, Roblox profile
preview, and a rotating splash text pulled from a pool of 500.

## Set your profile picture

Drop your own image into `public/icons/pfp.png` — **it has to be named
exactly `pfp.png`** (overwrite the placeholder silhouette that's already
there). If your image is a `.jpg` or something else, just convert/rename it
to `.png` first.

## Configuration

Set these as environment variables (Render: Dashboard → your service →
Environment). For local testing, copy `.env.example` to `.env` and edit it.

| Variable | Default | What it does |
|---|---|---|
| `DASHBOARD_NAME` | `Patrick` | Name shown in "Welcome back, ___" |
| `LOCATION` | `Denton, NC` | Location used for the weather lookup |
| `STOCK_SYMBOL` | `RBLX` | Ticker symbol shown on the stock panel |

## Running locally

```
npm install
npm start
```

Then open `http://localhost:3000`.

## Deploying to Render

1. Push this folder to a GitHub repo.
2. On Render: **New → Web Service**, connect the repo.
3. Environment: **Node**.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add the environment variables from the table above under the service's
   **Environment** tab.
7. Deploy. Render will give you a URL like `your-app.onrender.com` — point
   your wallpaper plugin at that.

## Notes

- Weather comes from `wttr.in` (no API key needed) — cached server-side for
  10 minutes so it's not re-fetched on every page load.
- Stock data comes from Yahoo Finance's public chart endpoint (no API key),
  cached server-side for 60 seconds. The sparkline redraws with a smooth
  0.7s glide animation whenever new data comes in rather than snapping.
- Render's free tier spins down after inactivity — the first load after
  it's been idle can take ~30-50 seconds to wake back up. If that's
  annoying for a wallpaper that's supposed to always be live, look at
  Render's paid "always on" tier, or a free uptime-pinger service to keep
  it warm.
- Splash text rotates once a minute automatically while the page is open.
