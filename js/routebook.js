let itineraryData = null;
let activeDay = 1;

async function init() {
  const res = await fetch("data/itinerary.json");
  itineraryData = await res.json();
  document.getElementById("routeSubtitle").textContent =
    `${itineraryData.days.length} 天全程路线与每日行程`;

  renderTimeline();
  renderDayNav();
  renderDayDetails();
  renderExternalLinks();
  bindViewToggle();
  bindHashNavigation();

  const hash = location.hash.match(/^#day(\d+)$/);
  if (hash) selectDay(parseInt(hash[1], 10));
}

function renderExternalLinks() {
  const container = document.getElementById("externalLinks");
  itineraryData.links.forEach(link => {
    const a = document.createElement("a");
    a.className = "external-link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${link.icon} ${link.name}`;
    container.appendChild(a);
  });
}

function renderTimeline() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = itineraryData.days
    .map(
      day => `
    <div class="timeline-item" data-day="${day.day}">
      <div class="timeline-day">Day ${day.day}</div>
      <div class="timeline-route">${day.route}</div>
      <div class="timeline-note">${day.note}${day.alerts.length ? " · ⚠️ " + day.alerts.join("、") : ""}</div>
    </div>`
    )
    .join("");

  timeline.querySelectorAll(".timeline-item").forEach(el => {
    el.addEventListener("click", () => {
      const day = parseInt(el.dataset.day, 10);
      switchView("daily");
      selectDay(day);
    });
  });
}

function renderDayNav() {
  const nav = document.getElementById("dayNav");
  nav.innerHTML = itineraryData.days
    .map(
      day => `
    <div class="day-nav-item${day.day === activeDay ? " active" : ""}" data-day="${day.day}">
      <div class="day-label">Day ${day.day}</div>
      ${day.route}
    </div>`
    )
    .join("");

  nav.querySelectorAll(".day-nav-item").forEach(el => {
    el.addEventListener("click", () => selectDay(parseInt(el.dataset.day, 10)));
  });
}

function renderDayDetails() {
  const container = document.getElementById("dayDetails");
  container.innerHTML = itineraryData.days
    .map(day => {
      const stopsHtml = day.stops
        .map((stop, i) => {
          const arrow = i < day.stops.length - 1 ? '<span class="stop-arrow">→</span>' : "";
          return `<span class="stop-chip">${stop}</span>${arrow}`;
        })
        .join("");

      const alertsHtml =
        day.alerts.length > 0
          ? `<div class="alert-block"><strong>⚠️ 注意事项</strong><ul>${day.alerts.map(a => `<li>${a}</li>`).join("")}</ul></div>`
          : "";

      return `
      <div class="day-detail${day.day === activeDay ? " active" : ""}" id="day-${day.day}">
        <div class="day-detail-header">
          <h2>Day ${day.day}</h2>
          <div class="route-text">${day.route}</div>
        </div>
        <div class="day-detail-body">
          <h3 style="font-size:14px;color:var(--text-muted);margin-bottom:12px;">途经站点</h3>
          <div class="stops-list">${stopsHtml}</div>
          <div class="info-block">
            <h3>当日说明</h3>
            <p>${day.note}</p>
          </div>
          ${alertsHtml}
        </div>
      </div>`;
    })
    .join("");
}

function selectDay(day) {
  activeDay = day;
  location.hash = `day${day}`;

  document.querySelectorAll(".day-nav-item").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.day, 10) === day);
  });

  document.querySelectorAll(".day-detail").forEach(el => {
    el.classList.toggle("active", el.id === `day-${day}`);
  });

  document.querySelectorAll(".timeline-item").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.day, 10) === day);
  });

  const activeNav = document.querySelector(`.day-nav-item[data-day="${day}"]`);
  if (activeNav) activeNav.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function switchView(view) {
  const overview = document.getElementById("overviewView");
  const daily = document.getElementById("dailyView");
  const buttons = document.querySelectorAll(".view-btn");

  buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  overview.style.display = view === "overview" ? "block" : "none";
  daily.style.display = view === "daily" ? "grid" : "none";
}

function bindViewToggle() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
}

function bindHashNavigation() {
  window.addEventListener("hashchange", () => {
    const match = location.hash.match(/^#day(\d+)$/);
    if (match) {
      switchView("daily");
      selectDay(parseInt(match[1], 10));
    }
  });
}

init();
