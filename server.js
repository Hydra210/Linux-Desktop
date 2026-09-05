require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const NAME = process.env.DASHBOARD_NAME || 'Patrick';
const LOCATION = process.env.LOCATION || 'Denton, NC';
const STOCK_SYMBOL = process.env.STOCK_SYMBOL || 'RBLX';

const splashes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'splashes.json'), 'utf8'));

// ---------- simple in-memory caches ----------
let weatherCache = { data: null, fetchedAt: 0 };
let stockCache = { data: null, fetchedAt: 0 };

const WEATHER_TTL_MS = 10 * 60 * 1000; // 10 min
const STOCK_TTL_MS = 60 * 1000;        // 1 min — stock price actually moves

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
  res.json({ name: NAME, location: LOCATION });
});

app.get('/api/splash', (req, res) => {
  const text = splashes[Math.floor(Math.random() * splashes.length)];
  res.json({ text });
});

app.get('/api/weather', async (req, res) => {
  const now = Date.now();
  if (weatherCache.data && (now - weatherCache.fetchedAt) < WEATHER_TTL_MS) {
    return res.json(weatherCache.data);
  }

  try {
    const query = encodeURIComponent(LOCATION);
    const response = await fetch(`https://wttr.in/${query}?format=j1`);
    if (!response.ok) throw new Error(`wttr.in responded ${response.status}`);
    const raw = await response.json();

    const current = raw.current_condition[0];
    const payload = {
      tempF: current.temp_F,
      tempC: current.temp_C,
      description: current.weatherDesc[0].value,
      humidity: current.humidity,
      windMph: current.windspeedMiles,
      feelsLikeF: current.FeelsLikeF,
      location: LOCATION,
    };

    weatherCache = { data: payload, fetchedAt: now };
    res.json(payload);
  } catch (err) {
    console.error('[weather] fetch failed:', err.message);
    if (weatherCache.data) {
      return res.json(weatherCache.data); // serve stale rather than nothing
    }
    res.status(502).json({ error: 'weather unavailable' });
  }
});

app.get('/api/stock', async (req, res) => {
  const now = Date.now();
  if (stockCache.data && (now - stockCache.fetchedAt) < STOCK_TTL_MS) {
    return res.json(stockCache.data);
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${STOCK_SYMBOL}?range=1d&interval=5m`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (dashboard widget)' },
    });
    if (!response.ok) throw new Error(`yahoo finance responded ${response.status}`);
    const raw = await response.json();

    const result = raw.chart.result[0];
    const meta = result.meta;
    const closes = (result.indicators.quote[0].close || []).filter(v => v !== null && v !== undefined);

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    const change = price - prevClose;
    const percentChange = (change / prevClose) * 100;

    const payload = {
      symbol: STOCK_SYMBOL,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      percentChange: Number(percentChange.toFixed(2)),
      isUp: change >= 0,
      series: closes.length ? closes : [prevClose, price],
      marketState: meta.marketState || 'UNKNOWN',
    };

    stockCache = { data: payload, fetchedAt: now };
    res.json(payload);
  } catch (err) {
    console.error('[stock] fetch failed:', err.message);
    if (stockCache.data) {
      return res.json(stockCache.data);
    }
    res.status(502).json({ error: 'stock data unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});
