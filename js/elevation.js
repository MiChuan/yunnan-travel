(function () {
  const elevationStats = document.getElementById("elevationStats");
  const elevationPoints = document.getElementById("elevationPoints");
  const ctx = document.getElementById("elevationChart");

  let data = null;
  let chart = null;

  function getAltitudeLevel(alt) {
    if (alt < 3000) return "safe";
    if (alt < 4000) return "warning";
    return "danger";
  }

  function getAltitudeColor(alt) {
    const level = getAltitudeLevel(alt);
    if (level === "safe") return "#10b981";
    if (level === "warning") return "#f59e0b";
    return "#ef4444";
  }

  function renderStats(stats) {
    elevationStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">${stats.maxAltitude}m</div>
          <div class="stat-label">最高海拔 · ${stats.maxPoint}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📉</div>
        <div class="stat-content">
          <div class="stat-value">${stats.minAltitude}m</div>
          <div class="stat-label">最低海拔 · ${stats.minPoint}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">${stats.highRiskCount}</div>
          <div class="stat-label">高反风险路段 (＞4000m)</div>
        </div>
      </div>
    `;
  }

  function renderPoints(points) {
    elevationPoints.innerHTML = points
      .map((point, index) => {
        const level = getAltitudeLevel(point.altitude);
        return `
          <div class="elevation-point-item" data-index="${index}">
            <div class="point-icon">${point.icon}</div>
            <div class="point-info">
              <div class="point-name">${point.name}</div>
              <div class="point-day">Day ${point.day}</div>
            </div>
            <div class="point-altitude altitude-${level}">${point.altitude}m</div>
          </div>
        `;
      })
      .join("");

    elevationPoints.querySelectorAll(".elevation-point-item").forEach((item) => {
      item.addEventListener("click", () => {
        const index = parseInt(item.dataset.index);
        if (chart) {
          chart.setActiveElements([{ datasetIndex: 0, index: index }]);
          chart.update();
        }
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function buildGradient(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.3)");
    gradient.addColorStop(0.3, "rgba(245, 158, 11, 0.3)");
    gradient.addColorStop(0.6, "rgba(16, 185, 129, 0.3)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
    return gradient;
  }

  function initChart(points) {
    const labels = points.map((p) => p.name);
    const dataValues = points.map((p) => p.altitude);
    const pointColors = points.map((p) => getAltitudeColor(p.altitude));

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "海拔 (m)",
            data: dataValues,
            borderColor: "#2563eb",
            borderWidth: 2,
            backgroundColor: function (context) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return "rgba(37, 99, 235, 0.1)";
              return buildGradient(ctx, chartArea);
            },
            fill: true,
            tension: 0.3,
            pointBackgroundColor: pointColors,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointHoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            titleFont: { size: 14, weight: "600" },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function (context) {
                const point = points[context[0].dataIndex];
                return `${point.icon} ${point.name}`;
              },
              label: function (context) {
                const point = points[context.dataIndex];
                const level = getAltitudeLevel(point.altitude);
                const levelLabel =
                  level === "safe" ? "安全" : level === "warning" ? "注意" : "高反风险";
                return [
                  `海拔: ${point.altitude}m`,
                  `天数: Day ${point.day}`,
                  `等级: ${levelLabel}`,
                  `备注: ${point.note}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "海拔 (m)",
              font: { size: 12, weight: "500" }
            },
            grid: {
              color: "rgba(0, 0, 0, 0.06)"
            },
            ticks: {
              callback: function (value) {
                return value + "m";
              }
            }
          }
        }
      }
    });
  }

  async function loadData() {
    try {
      const res = await fetch("data/elevation.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();

      renderStats(data.stats);
      renderPoints(data.points);
      initChart(data.points);
    } catch (err) {
      console.error("加载海拔数据失败:", err);
      elevationPoints.innerHTML = `<div class="weather-error">加载海拔数据失败: ${err.message}</div>`;
    }
  }

  loadData();
})();
