#  Hasiru Haadi – Digital Garden Dashboard


A nature-inspired productivity dashboard that transforms your browser’s new tab into a peaceful digital workspace for focus, organization, and mindful productivity.


> _Hasiru Haadi_ means "green path" in Kannada.

---

##  Features

- 🕰 **Live clock, date & dynamic greeting**
- 💬 **Daily nature-inspired quote**
- ✅ **Task manager** with localStorage persistence
- 🌱 **Digital Garden** — your plant grows as you complete tasks (seed → sprout → small plant → flowering)
- 🔥 **Productivity streak counter**
- 📝 **Quick notes** with auto-save
- ⛅ **Weather widget** powered by OpenWeatherMap
- 🍅 **Pomodoro focus timer** (25 min)
- 🌧️ **Rain ambience** toggle (audio + animated rain canvas)
- 🌙 **Dark / light theme toggle**
- 🖼️ **Background shuffle** (forest photo, cloudy sky, landscape photo )
- 🪟 **Glassmorphism UI**, soft shadows, smooth animations
 

---

##  Folder Structure

```
digital-garden-dashboard/
├── manifest.json
├── newtab.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── icons/
    │   └── icon.png
    ├── backgrounds/
    │   └── forest.jpg
    └── sounds/
        └── rain.mp3   
```

> `assets/sounds/rain.mp3` is optional. Without it, the rain visual still works, only the audio is silent. You can use any royalty-free rain loop.

---

##  Tech Stack

- HTML5
- CSS3 (custom properties, glassmorphism, grid)
- Vanilla JavaScript (ES6+)
- Chrome Extension Manifest V3
- OpenWeatherMap API (free tier)

---

##  Installation

1. **Download / clone** this folder.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `digital-garden-dashboard` folder.
5. Open a new tab — enjoy your garden 

Works in Chrome, Edge, Brave, Arc, Opera, and any Chromium browser.

---

##  Weather Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api).
2. On the dashboard, click **Setup** in the Weather card.
3. Paste your key and (optionally) a city name. Save.
4. If you leave the city blank, the extension will request your location.

---

##How the Garden Grows 🧑‍🌾

| Tasks completed | Stage |
|-----------------|-------|
| 0               | 🌰 Seed |
| 1–2             | 🌱 Sprout |
| 3–5             | 🌿 Small plant |
| 6+              | 🌸 Flowering plant |

---

##  Screenshots

_Add your own screenshots here:_

![Main Dashboard](screenshots/image0.png)

![Task Manager](screenshots/image1.png)

![Focus Mode](screenshots/image2.png)
---

##  Future Improvements

- Sync data via `chrome.storage.sync`
- More ambience sounds (forest, café, ocean)
- Custom Pomodoro durations + break cycles
- Multiple plants / garden beds
- Habit tracker
- Bookmark grid



