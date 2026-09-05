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

// ---------- stock ticker ----------
const SPARK_POINTS = 48;       // fixed point count so old/new series always line up for animation
const SPARK_ANIM_MS = 700;     // how long the line takes to glide to new data

const sparkCanvas = document.getElementById('stockSparkline');
const sparkCtx = sparkCanvas.getContext('2d');

let currentSpark = null;   // points currently being drawn (interpolated during animation)
let sparkFrom = null;      // animation start points
let sparkTo = null;        // animation target points
let sparkAnimStart = 0;
let sparkColor = '#3ddc84';

function resizeSparkCanvas() {
  sparkCanvas.width = sparkCanvas.clientWidth * devicePixelRatio;
  sparkCanvas.height = sparkCanvas.clientHeight * devicePixelRatio;
}
window.addEventListener('resize', resizeSparkCanvas);
resizeSparkCanvas();

// resample any-length series to a fixed number of points via linear interpolation,
// so the sparkline always has a consistent shape to animate between updates
function resample(series, count) {
  if (series.length === count) return series.slice();
  const result = [];
  for (let i = 0; i < count; i++) {
    const pos = (i / (count - 1)) * (series.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(series.length - 1, Math.ceil(pos));
    const frac = pos - lo;
    result.push(series[lo] + (series[hi] - series[lo]) * frac);
  }
  return result;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawSpark(points) {
  const w = sparkCanvas.width;
  const h = sparkCanvas.height;
  sparkCtx.clearRect(0, 0, w, h);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = (max - min) || 1;
  const pad = h * 0.12;

  sparkCtx.beginPath();
  points.forEach((val, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    if (i === 0) sparkCtx.moveTo(x, y);
    else sparkCtx.lineTo(x, y);
  });

  sparkCtx.strokeStyle = sparkColor;
  sparkCtx.lineWidth = 2 * devicePixelRatio;
  sparkCtx.lineJoin = 'round';
  sparkCtx.lineCap = 'round';
  sparkCtx.shadowColor = sparkColor;
  sparkCtx.shadowBlur = 6;
  sparkCtx.stroke();

  // soft fill under the line
  const lastX = w;
  const lastPoint = points[points.length - 1];
  const lastY = h - pad - ((lastPoint - min) / range) * (h - pad * 2);
  sparkCtx.lineTo(lastX, h);
  sparkCtx.lineTo(0, h);
  sparkCtx.closePath();
  sparkCtx.shadowBlur = 0;
  const gradient = sparkCtx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, sparkColor + '33');
  gradient.addColorStop(1, sparkColor + '00');
  sparkCtx.fillStyle = gradient;
  sparkCtx.fill();
}

function animateSpark(timestamp) {
  if (!sparkAnimStart) sparkAnimStart = timestamp;
  const elapsed = timestamp - sparkAnimStart;
  const t = Math.min(1, elapsed / SPARK_ANIM_MS);
  const eased = easeInOutCubic(t);

  currentSpark = sparkFrom.map((v, i) => v + (sparkTo[i] - v) * eased);
  drawSpark(currentSpark);

  if (t < 1) {
    requestAnimationFrame(animateSpark);
  } else {
    currentSpark = sparkTo;
  }
}

function updateSparkline(newSeries) {
  const resampled = resample(newSeries, SPARK_POINTS);
  if (!currentSpark) {
    currentSpark = resampled;
    drawSpark(currentSpark);
    return;
  }
  sparkFrom = currentSpark;
  sparkTo = resampled;
  sparkAnimStart = 0;
  requestAnimationFrame(animateSpark);
}

function loadStock() {
  fetch('/api/stock')
    .then(r => r.json())
    .then(d => {
      if (d.error) throw new Error(d.error);

      document.getElementById('stockSymbol').textContent = d.symbol.toLowerCase() + ' stock';
      document.getElementById('stockPrice').textContent = `$${d.price.toFixed(2)}`;

      const changeEl = document.getElementById('stockChange');
      const arrowEl = document.getElementById('stockArrow');
      const textEl = document.getElementById('stockChangeText');

      changeEl.classList.remove('up', 'down');
      changeEl.classList.add(d.isUp ? 'up' : 'down');
      arrowEl.textContent = d.isUp ? '▲' : '▼';
      textEl.textContent = `${d.isUp ? '+' : ''}${d.change.toFixed(2)} (${d.isUp ? '+' : ''}${d.percentChange.toFixed(2)}%)`;

      sparkColor = d.isUp ? '#3ddc84' : '#ff5a5a';
      updateSparkline(d.series);
    })
    .catch(() => {
      document.getElementById('stockPrice').textContent = 'n/a';
    });
}
loadStock();
setInterval(loadStock, 60 * 1000); // stock endpoint itself caches for 60s server-side
