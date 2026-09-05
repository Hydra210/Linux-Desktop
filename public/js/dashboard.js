function pad(n) { return n.toString().padStart(2, '0'); }

// ---------- clock ----------
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  document.getElementById('clock').textContent =
    hours + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + ' ' + ampm;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('date').textContent =
    days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
}
updateClock();
setInterval(updateClock, 1000);

// ---------- session uptime ----------
const startTime = Date.now();
function updateUptime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  document.getElementById('uptime').textContent =
    'session ' + pad(h) + ':' + pad(m) + ':' + pad(s);
}
setInterval(updateUptime, 1000);

// ---------- config (name / location) ----------
fetch('/api/config')
  .then(r => r.json())
  .then(cfg => {
    document.getElementById('welcome').textContent = `Welcome back, ${cfg.name}`;
  })
  .catch(() => {});

// ---------- splash text ----------
function loadSplash() {
  fetch('/api/splash')
    .then(r => r.json())
    .then(d => { document.getElementById('splash').textContent = d.text; })
    .catch(() => {});
}
loadSplash();
setInterval(loadSplash, 60 * 1000); // rotate every minute

// ---------- weather ----------
function loadWeather() {
  fetch('/api/weather')
    .then(r => r.json())
    .then(d => {
      if (d.error) throw new Error(d.error);
      document.getElementById('wxTemp').textContent = `${d.tempF}°f`;
      document.getElementById('wxDesc').textContent = d.description;
      document.getElementById('wxSub').textContent =
        `feels like ${d.feelsLikeF}°f · humidity ${d.humidity}% · wind ${d.windMph}mph`;
      document.getElementById('wxLocation').textContent = d.location.toLowerCase();
    })
    .catch(() => {
      document.getElementById('wxDesc').textContent = 'unavailable';
    });
}
loadWeather();
setInterval(loadWeather, 10 * 60 * 1000); // refresh every 10 min

// ---------- roblox profile ----------
function loadRoblox() {
  fetch('/api/roblox')
    .then(r => r.json())
    .then(d => {
      if (d.error) throw new Error(d.error);
      document.getElementById('robloxAvatar').src = d.avatarUrl || '';
      document.getElementById('robloxDisplayName').textContent = d.displayName;
      document.getElementById('robloxUsername').textContent = '@' + d.username;
      document.getElementById('robloxBio').textContent = d.bio || 'no bio set.';
      document.getElementById('statFollowers').textContent = d.followerCount;
      document.getElementById('statFriends').textContent = d.friendCount;
      document.getElementById('statFollowing').textContent = d.followingCount;
    })
    .catch(() => {
      document.getElementById('robloxDisplayName').textContent = 'profile unavailable';
    });
}
loadRoblox();
setInterval(loadRoblox, 5 * 60 * 1000); // refresh every 5 min
