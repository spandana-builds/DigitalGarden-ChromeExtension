/* =============================================================
   Hasiru Haadi — Digital Garden Dashboard
   Vanilla JS · localStorage powered
   ============================================================= */

/* ---------- Storage helpers ---------- */
const LS = {
  get: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ---------- Quotes ---------- */
const QUOTES = [
  "In every walk with nature, one receives far more than they seek. — John Muir",
  "Adopt the pace of nature: her secret is patience. — Emerson",
  "The earth has music for those who listen. — Shakespeare",
  "Look deep into nature, and then you will understand everything better. — Einstein",
  "To plant a garden is to believe in tomorrow. — Audrey Hepburn",
  "Slow down. Calm down. Don’t worry. Don’t hurry. Trust the process.",
  "A quiet mind is able to hear intuition over fear.",
  "Small steps every day grow into forests.",
];

/* ---------- Backgrounds (gradient fallbacks) ---------- */
const BACKGROUNDS = [
  'url("assets/backgrounds/forest.jpg")',
  'linear-gradient(135deg, #c5d8b8, #6f8f5a)',
  'linear-gradient(135deg, #e9d8b8, #b89968)',
  'linear-gradient(135deg, #b6cfb1, #4d6b48)',
  'linear-gradient(135deg, #cfd9c4, #7a9b6c)',
];

/* ---------- Clock + greeting ---------- */
function tickClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}`;
  document.getElementById('date').textContent = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const h = now.getHours();
  const greet = h < 5 ? 'Rest well' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Quiet night';
  const name = LS.get('hh.name', '');
  document.getElementById('greeting').textContent = name ? `${greet}, ${name}` : `${greet}, friend`;
}
setInterval(tickClock, 1000); tickClock();

/* ---------- Daily quote ---------- */
(function loadQuote() {
  const day = new Date().toDateString();
  const cached = LS.get('hh.quote', null);
  if (cached && cached.day === day) {
    document.getElementById('quote').textContent = `“${cached.text}”`;
  } else {
    const text = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    LS.set('hh.quote', { day, text });
    document.getElementById('quote').textContent = `“${text}”`;
  }
})();

/* =============================================================
   Tasks + Streak + Garden
   ============================================================= */
let tasks = LS.get('hh.tasks', []);
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const gardenStage = document.getElementById('gardenStage');
const gardenStatus = document.getElementById('gardenStatus');

const STAGE_TEXT = [
  "Plant a seed by completing your first task.",
  "A tender sprout. Keep going 🌱",
  "Your plant is growing strong 🌿",
  "It bloomed! A flourishing garden 🌸",
];

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : '';
    li.innerHTML = `
      <button class="check" data-i="${i}" aria-label="Toggle">${t.done ? '✓' : ''}</button>
      <span class="label">${escapeHtml(t.text)}</span>
      <button class="del" data-i="${i}" aria-label="Delete">✕</button>
    `;
    taskList.appendChild(li);
  });
  const done = tasks.filter(t => t.done).length;
  taskCount.textContent = `${done} done`;
  updateGarden(done);
  updateStreak();
}

function updateGarden(done) {
  let stage = 0;
  if (done >= 1) stage = 1;
  if (done >= 3) stage = 2;
  if (done >= 6) stage = 3;
  gardenStage.dataset.stage = stage;
  gardenStatus.textContent = STAGE_TEXT[stage];
}

function updateStreak() {
  const today = new Date().toDateString();
  const data = LS.get('hh.streak', { last: null, count: 0 });
  const anyDone = tasks.some(t => t.done);
  if (anyDone && data.last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    data.count = data.last === yesterday ? data.count + 1 : 1;
    data.last = today;
    LS.set('hh.streak', data);
  }
  document.getElementById('streak').textContent = `🔥 ${data.count} day streak`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

document.getElementById('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false, created: Date.now() });
  LS.set('hh.tasks', tasks);
  input.value = '';
  renderTasks();
});

taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const i = +btn.dataset.i;
  if (btn.classList.contains('check')) tasks[i].done = !tasks[i].done;
  if (btn.classList.contains('del')) tasks.splice(i, 1);
  LS.set('hh.tasks', tasks);
  renderTasks();
});
renderTasks();

/* =============================================================
   Quick notes
   ============================================================= */
const notes = document.getElementById('notes');
const notesStatus = document.getElementById('notesStatus');
notes.value = LS.get('hh.notes', '');
let notesTimer;
notes.addEventListener('input', () => {
  notesStatus.textContent = 'Saving…';
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => {
    LS.set('hh.notes', notes.value);
    notesStatus.textContent = 'Saved';
  }, 400);
});

/* =============================================================
   Pomodoro Timer
   ============================================================= */
const FOCUS_MIN = 25;
let timerSeconds = FOCUS_MIN * 60;
let timerInterval = null;
const display = document.getElementById('timerDisplay');

function renderTimer() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  display.textContent = `${m}:${s}`;
}
function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval); timerInterval = null;
      display.textContent = "Done";
      try { new Audio('assets/sounds/rain.mp3').play().catch(()=>{}); } catch {}
      return;
    }
    timerSeconds--; renderTimer();
  }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); timerInterval = null; }
function resetTimer() { pauseTimer(); timerSeconds = FOCUS_MIN * 60; renderTimer(); }

document.getElementById('timerStart').addEventListener('click', startTimer);
document.getElementById('timerPause').addEventListener('click', pauseTimer);
document.getElementById('timerReset').addEventListener('click', resetTimer);
renderTimer();

/* =============================================================
   Weather (OpenWeatherMap)
   ============================================================= */
const weatherBody = document.getElementById('weatherBody');
const weatherModal = document.getElementById('weatherModal');

function openWeatherModal() {
  const cfg = LS.get('hh.weather', { key: '', city: '' });
  document.getElementById('apiKeyInput').value = cfg.key || '';
  document.getElementById('cityInput').value = cfg.city || '';
  weatherModal.hidden = false;
}
document.getElementById('weatherSetup').addEventListener('click', openWeatherModal);
document.getElementById('weatherCancel').addEventListener('click', () => weatherModal.hidden = true);
document.getElementById('weatherSave').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  const city = document.getElementById('cityInput').value.trim();
  LS.set('hh.weather', { key, city });
  weatherModal.hidden = true;
  loadWeather();
});

async function loadWeather() {
  const cfg = LS.get('hh.weather', { key: '', city: '' });
  if (!cfg.key) {
    weatherBody.innerHTML = `<p class="muted">Click <strong>Setup</strong> to add your free API key.</p>`;
    return;
  }
  try {
    let url;
    if (cfg.city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cfg.city)}&units=metric&appid=${cfg.key}`;
      await fetchWeather(url);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${cfg.key}`),
        () => weatherBody.innerHTML = `<p class="muted">Allow location or set a city in Setup.</p>`
      );
    }
  } catch {
    weatherBody.innerHTML = `<p class="muted">Couldn’t load weather.</p>`;
  }
}
async function fetchWeather(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather');
  const data = await res.json();
  weatherBody.innerHTML = `
    <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
    <div class="muted">${escapeHtml(data.name)}</div>
    <div class="weather-cond">${escapeHtml(data.weather?.[0]?.description || '')}</div>
  `;
}
loadWeather();

/* =============================================================
   Theme toggle
   ============================================================= */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t) {
  document.body.dataset.theme = t;
  themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
}
applyTheme(LS.get('hh.theme', 'light'));
themeToggle.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  LS.set('hh.theme', next); applyTheme(next);
});

/* =============================================================
   Background shuffle
   ============================================================= */
function applyBg(idx) {
  document.documentElement.style.setProperty('--bg-image', BACKGROUNDS[idx]);
}
let bgIdx = LS.get('hh.bg', 0);
applyBg(bgIdx);
document.getElementById('bgShuffle').addEventListener('click', () => {
  bgIdx = (bgIdx + 1) % BACKGROUNDS.length;
  LS.set('hh.bg', bgIdx); applyBg(bgIdx);
});

/* =============================================================
   Rain ambience (audio + canvas)
   ============================================================= */
const rainAudio = document.getElementById('rainAudio');
const rainCanvas = document.getElementById('rainCanvas');
const rctx = rainCanvas.getContext('2d');
let rainOn = false, drops = [], rainAnim;

function sizeRain() { rainCanvas.width = innerWidth; rainCanvas.height = innerHeight; }
addEventListener('resize', sizeRain); sizeRain();

function makeDrops() {
  drops = Array.from({ length: 180 }, () => ({
    x: Math.random() * rainCanvas.width,
    y: Math.random() * rainCanvas.height,
    l: 8 + Math.random() * 14,
    s: 4 + Math.random() * 6,
  }));
}
function drawRain() {
  rctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  rctx.strokeStyle = 'rgba(200,220,230,0.5)';
  rctx.lineWidth = 1;
  drops.forEach(d => {
    rctx.beginPath();
    rctx.moveTo(d.x, d.y);
    rctx.lineTo(d.x, d.y + d.l);
    rctx.stroke();
    d.y += d.s;
    if (d.y > rainCanvas.height) { d.y = -d.l; d.x = Math.random() * rainCanvas.width; }
  });
  rainAnim = requestAnimationFrame(drawRain);
}
document.getElementById('rainToggle').addEventListener('click', () => {
  rainOn = !rainOn;
  rainCanvas.classList.toggle('active', rainOn);
  if (rainOn) {
    makeDrops(); drawRain();
    rainAudio.volume = 0.4;
    rainAudio.play().catch(() => {});
  } else {
    cancelAnimationFrame(rainAnim);
    rctx.clearRect(0,0,rainCanvas.width,rainCanvas.height);
    rainAudio.pause();
  }
});
