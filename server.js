require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const NAME = process.env.DASHBOARD_NAME || 'Patrick';
const LOCATION = process.env.LOCATION || 'Denton, NC';
const ROBLOX_USER = process.env.ROBLOX_USER || 'Nexesmere';

const splashes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'splashes.json'), 'utf8'));

// ---------- simple in-memory caches ----------
let weatherCache = { data: null, fetchedAt: 0 };
let robloxCache = { data: null, fetchedAt: 0 };

const WEATHER_TTL_MS = 10 * 60 * 1000; // 10 min
const ROBLOX_TTL_MS = 5 * 60 * 1000;   // 5 min

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

app.get('/api/roblox', async (req, res) => {
  const now = Date.now();
  if (robloxCache.data && (now - robloxCache.fetchedAt) < ROBLOX_TTL_MS) {
    return res.json(robloxCache.data);
  }

  try {
    let userId = ROBLOX_USER;

    // resolve username -> numeric id if a username was given instead of an id
    if (!/^\d+$/.test(ROBLOX_USER)) {
      const idRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [ROBLOX_USER], excludeBannedUsers: false }),
      });
      const idData = await idRes.json();
      if (!idData.data || !idData.data.length) throw new Error('username not found');
      userId = idData.data[0].id;
    }

    const [userRes, avatarRes, friendsRes, followersRes, followingRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userId}`),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
      fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
      fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      fetch(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
    ]);

    const [user, avatar, friends, followers, following] = await Promise.all([
      userRes.json(), avatarRes.json(), friendsRes.json(), followersRes.json(), followingRes.json(),
    ]);

    const payload = {
      userId,
      displayName: user.displayName,
      username: user.name,
      bio: user.description || '',
      avatarUrl: (avatar.data && avatar.data[0] && avatar.data[0].imageUrl) || null,
      friendCount: friends.count,
      followerCount: followers.count,
      followingCount: following.count,
      profileUrl: `https://www.roblox.com/users/${userId}/profile`,
    };

    robloxCache = { data: payload, fetchedAt: now };
    res.json(payload);
  } catch (err) {
    console.error('[roblox] fetch failed:', err.message);
    if (robloxCache.data) {
      return res.json(robloxCache.data);
    }
    res.status(502).json({ error: 'roblox profile unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});
