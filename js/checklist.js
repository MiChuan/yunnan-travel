const STORAGE_KEY = "yunnan-travel-checklist-v1";
const TAG_LABELS = { core: "核心", rec: "推荐", opt: "可选" };

let checklistData = null;
let checkedSet = new Set();

async function init() {
  const res = await fetch("data/checklist.json");
  checklistData = await res.json();

  document.getElementById("checklistSubtitle").textContent = checklistData.subtitle;
  loadCheckedState();
  renderMetaTags();
  renderChecklist();
  bindToolbar();
  updateStats();
  renderFooterNote();
}

function loadCheckedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) checkedSet = new Set(JSON.parse(saved));
  } catch {
    checkedSet = new Set();
  }
}

function saveCheckedState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedSet]));
}

function itemId(sectionId, index) {
  return `${sectionId}-${index}`;
}

function renderMetaTags() {
  const container = document.getElementById("metaTags");
  container.innerHTML = `
    <span class="meta-tag">📅 2026年8月</span>
    <span class="meta-tag">👥 2人</span>
    <span class="meta-tag">🚄 高铁+包车</span>
    <span class="meta-tag">⛰️ 海拔 1100–4506m</span>`;
}

function renderChecklist() {
  const container = document.getElementById("checklistContainer");
  container.innerHTML = checklistData.sections
    .map(section => {
      const itemsHtml = section.items
        .map((item, index) => {
          const id = itemId(section.id, index);
          const isChecked = checkedSet.has(id);
          return `
          <div class="check-item${isChecked ? " done" : ""}" data-id="${id}">
            <div class="checkbox${isChecked ? " checked" : ""}" role="checkbox" aria-checked="${isChecked}" tabindex="0"></div>
            <div class="item-info">
              <div class="item-name">
                ${item.name}
                <span class="tag tag-${item.tag}">${TAG_LABELS[item.tag]}</span>
              </div>
              <div class="item-desc">${item.desc}</div>
            </div>
          </div>`;
        })
        .join("");

      return `
      <div class="checklist-section">
        <div class="section-header" style="background:${section.color};">
          <span>${section.icon} ${section.name}</span>
          <span class="count">${section.items.length} 项</span>
        </div>
        <div class="section-content open">${itemsHtml}</div>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".check-item").forEach(row => {
    const checkbox = row.querySelector(".checkbox");
    const toggle = () => toggleItem(row.dataset.id, row, checkbox);
    checkbox.addEventListener("click", toggle);
    checkbox.addEventListener("keydown", e => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    });
  });

  container.querySelectorAll(".section-header").forEach(header => {
    header.addEventListener("click", () => {
      header.nextElementSibling.classList.toggle("open");
    });
  });
}

function toggleItem(id, row, checkbox) {
  if (checkedSet.has(id)) {
    checkedSet.delete(id);
    checkbox.classList.remove("checked");
    row.classList.remove("done");
    checkbox.setAttribute("aria-checked", "false");
  } else {
    checkedSet.add(id);
    checkbox.classList.add("checked");
    row.classList.add("done");
    checkbox.setAttribute("aria-checked", "true");
  }
  saveCheckedState();
  updateStats();
}

function updateStats() {
  let total = 0;
  let core = 0;

  checklistData.sections.forEach(section => {
    total += section.items.length;
    core += section.items.filter(i => i.tag === "core").length;
  });

  const checked = checkedSet.size;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  document.getElementById("totalItems").textContent = total;
  document.getElementById("checkedItems").textContent = checked;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("coreItems").textContent = core;
  document.getElementById("progressFill").style.width = percent + "%";
}

function bindToolbar() {
  document.getElementById("expandAll").addEventListener("click", () => {
    document.querySelectorAll(".section-content").forEach(el => el.classList.add("open"));
  });

  document.getElementById("collapseAll").addEventListener("click", () => {
    document.querySelectorAll(".section-content").forEach(el => el.classList.remove("open"));
  });

  document.getElementById("resetAll").addEventListener("click", () => {
    if (!confirm("确定重置所有勾选状态？")) return;
    checkedSet.clear();
    saveCheckedState();
    renderChecklist();
    updateStats();
  });
}

function renderFooterNote() {
  const note = document.getElementById("footerNote");
  note.innerHTML = `
    <p>🖨️ 使用浏览器打印（Ctrl+P）可生成纸质版随身携带</p>
    <p>⚠️ 出发前务必检查：${checklistData.reminders.join("、")}</p>`;
}

init();
