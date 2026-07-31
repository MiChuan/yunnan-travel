(function () {
  const WEATHER_CODES = {
    0: { icon: "☀️", label: "晴朗" },
    1: { icon: "🌤️", label: "大部晴朗" },
    2: { icon: "⛅", label: "局部多云" },
    3: { icon: "☁️", label: "阴天" },
    45: { icon: "🌫️", label: "雾" },
    48: { icon: "🌫️", label: "雾凇" },
    51: { icon: "🌦️", label: "小毛毛雨" },
    53: { icon: "🌦️", label: "毛毛雨" },
    55: { icon: "🌧️", label: "大毛毛雨" },
    56: { icon: "🌨️", label: "冻毛毛雨" },
    57: { icon: "🌨️", label: "大冻毛毛雨" },
    61: { icon: "🌧️", label: "小雨" },
    63: { icon: "🌧️", label: "中雨" },
    65: { icon: "🌧️", label: "大雨" },
    66: { icon: "🌨️", label: "冻雨" },
    67: { icon: "🌨️", label: "大冻雨" },
    71: { icon: "🌨️", label: "小雪" },
    73: { icon: "❄️", label: "中雪" },
    75: { icon: "❄️", label: "大雪" },
    77: { icon: "❄️", label: "雪粒" },
    80: { icon: "🌦️", label: "小阵雨" },
    81: { icon: "🌧️", label: "中阵雨" },
    82: { icon: "⛈️", label: "大阵雨" },
    85: { icon: "🌨️", label: "小阵雪" },
    86: { icon: "❄️", label: "大阵雪" },
    95: { icon: "⛈️", label: "雷暴" },
    96: { icon: "⛈️", label: "雷暴伴小冰雹" },
    99: { icon: "⛈️", label: "雷暴伴大冰雹" }
  };

  const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  const regionNav = document.getElementById("regionNav");
  const weatherGrid = document.getElementById("weatherGrid");
  const refreshBtn = document.getElementById("refreshBtn");
  const lastUpdated = document.getElementById("lastUpdated");

  let regions = [];
  let activeRegionId = null;

  function getWeatherInfo(code) {
    return WEATHER_CODES[code] || { icon: "🌡️", label: "未知" };
  }

  function formatTime(isoString) {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return date.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatDayLabel(dateStr, index) {
    if (index === 0) return "今天";
    if (index === 1) return "明天";
    const date = new Date(dateStr + "T00:00:00");
    return WEEKDAYS[date.getDay()];
  }

  function windDirection(deg) {
    if (deg == null) return "--";
    const dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    return dirs[Math.round(deg / 45) % 8] + "风";
  }

  function buildApiUrl(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
      timezone: "Asia/Shanghai",
      forecast_days: "7"
    });
    return `https://api.open-meteo.com/v1/forecast?${params}`;
  }

  async function fetchWeather(region) {
    const res = await fetch(buildApiUrl(region.latitude, region.longitude));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function renderCurrent(region, data) {
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);
    return `
      <div class="weather-current">
        <div class="weather-current-main">
          <span class="weather-current-icon">${info.icon}</span>
          <div>
            <div class="weather-current-temp">${Math.round(current.temperature_2m)}°C</div>
            <div class="weather-current-label">${info.label}</div>
          </div>
        </div>
        <div class="weather-current-stats">
          <div class="weather-stat">
            <span class="weather-stat-label">体感</span>
            <span class="weather-stat-value">${Math.round(current.apparent_temperature)}°C</span>
          </div>
          <div class="weather-stat">
            <span class="weather-stat-label">湿度</span>
            <span class="weather-stat-value">${current.relative_humidity_2m}%</span>
          </div>
          <div class="weather-stat">
            <span class="weather-stat-label">风速</span>
            <span class="weather-stat-value">${Math.round(current.wind_speed_10m)} km/h</span>
          </div>
          <div class="weather-stat">
            <span class="weather-stat-label">风向</span>
            <span class="weather-stat-value">${windDirection(current.wind_direction_10m)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderForecast(data) {
    const daily = data.daily;
    const days = daily.time.map((date, i) => {
      const info = getWeatherInfo(daily.weather_code[i]);
      const pop = daily.precipitation_probability_max[i];
      return `
        <div class="weather-forecast-day">
          <div class="weather-forecast-date">${formatDayLabel(date, i)}</div>
          <div class="weather-forecast-icon">${info.icon}</div>
          <div class="weather-forecast-label">${info.label}</div>
          <div class="weather-forecast-temps">
            <span class="weather-temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
            <span class="weather-temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
          </div>
          ${pop != null ? `<div class="weather-forecast-pop">💧 ${pop}%</div>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div class="weather-forecast">
        <h4 class="weather-forecast-title">未来 7 天</h4>
        <div class="weather-forecast-grid">${days}</div>
      </div>
    `;
  }

  function renderCard(region, data, error) {
    if (error) {
      return `
        <article class="weather-card card" id="region-${region.id}" data-region="${region.id}">
          <div class="weather-card-header">
            <div class="weather-card-title">
              <span class="weather-region-icon">${region.icon}</span>
              <div>
                <h3>${region.name}</h3>
                <span class="weather-region-meta">${region.province} · 海拔 ${region.altitude}</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="weather-error">⚠️ 天气数据加载失败，请稍后重试</div>
            ${region.note ? `<p class="weather-region-note">${region.note}</p>` : ""}
          </div>
        </article>
      `;
    }

    return `
      <article class="weather-card card" id="region-${region.id}" data-region="${region.id}">
        <div class="weather-card-header">
          <div class="weather-card-title">
            <span class="weather-region-icon">${region.icon}</span>
            <div>
              <h3>${region.name}</h3>
              <span class="weather-region-meta">${region.province} · 海拔 ${region.altitude}</span>
            </div>
          </div>
          <span class="weather-update-time">更新 ${formatTime(data.current.time)}</span>
        </div>
        <div class="card-body">
          ${renderCurrent(region, data)}
          ${renderForecast(data)}
          ${region.note ? `<p class="weather-region-note">${region.note}</p>` : ""}
        </div>
      </article>
    `;
  }

  function setActiveRegion(id) {
    activeRegionId = id;
    regionNav.querySelectorAll(".weather-nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.region === id);
    });
  }

  function initNav() {
    regionNav.innerHTML = regions.map((r) => `
      <a href="#region-${r.id}" class="weather-nav-item" data-region="${r.id}">
        <span class="weather-nav-icon">${r.icon}</span>
        <span class="weather-nav-text">
          <strong>${r.name}</strong>
          <small>${r.province}</small>
        </span>
      </a>
    `).join("");

    regionNav.querySelectorAll(".weather-nav-item").forEach((item) => {
      item.addEventListener("click", () => setActiveRegion(item.dataset.region));
    });
  }

  function initObserver() {
    const cards = document.querySelectorAll(".weather-card[data-region]");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveRegion(entry.target.dataset.region);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  async function loadAllWeather() {
    weatherGrid.innerHTML = `<div class="weather-loading card"><div class="card-body">正在加载各地区天气数据…</div></div>`;

    const results = await Promise.all(
      regions.map(async (region) => {
        try {
          const data = await fetchWeather(region);
          return { region, data, error: null };
        } catch (err) {
          return { region, data: null, error: err };
        }
      })
    );

    weatherGrid.innerHTML = results.map(({ region, data, error }) => renderCard(region, data, error)).join("");
    initObserver();

    if (lastUpdated) {
      lastUpdated.textContent = `最后刷新：${new Date().toLocaleString("zh-CN")}`;
    }
  }

  async function init() {
    try {
      const res = await fetch("data/weather-locations.json");
      const config = await res.json();
      regions = config.regions;
      initNav();
      await loadAllWeather();

      if (regions.length) {
        setActiveRegion(regions[0].id);
      }
    } catch (err) {
      weatherGrid.innerHTML = `<div class="weather-error card"><div class="card-body">⚠️ 无法加载地区配置：${err.message}</div></div>`;
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "刷新中…";
      loadAllWeather().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "🔄 刷新天气";
      });
    });
  }

  init();
})();
