// ===============================
// 強化版検索ロジック（共通）
// ===============================

let activeTags = new Set();
let activeVersions = new Set();
let searchText = "";

// AND検索
function filterItems(items) {
  return items.filter(item => {
    const nameMatch =
      searchText === "" ||
      item.name.toLowerCase().includes(searchText.toLowerCase());

    const tagMatch =
      activeTags.size === 0 ||
      [...activeTags].every(tag => item.tags.includes(tag));

    const versionMatch =
      activeVersions.size === 0 ||
      item.versions.some(v => activeVersions.has(v.mc_version));

    return nameMatch && tagMatch && versionMatch;
  });
}

// タグボタン生成
function renderTagButtons(items) {
  const container = document.getElementById("tag-filter");
  const tags = new Set();

  items.forEach(item => item.tags.forEach(t => tags.add(t)));

  container.innerHTML = [...tags]
    .map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`)
    .join("");

  document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;

      if (activeTags.has(tag)) {
        activeTags.delete(tag);
        btn.classList.remove("active");
      } else {
        activeTags.add(tag);
        btn.classList.add("active");
      }

      updateFiltersUI();
      applyFilters();
    });
  });
}

// バージョンフィルター
function setupVersionSelect(items) {
  const select = document.getElementById("mc-version-select");
  const versions = new Set();

  items.forEach(item => {
    item.versions.forEach(v => versions.add(v.mc_version));
  });

  select.innerHTML = [...versions]
    .map(v => `<option value="${v}">${v}</option>`)
    .join("");

  select.addEventListener("change", () => {
    activeVersions = new Set([...select.selectedOptions].map(o => o.value));
    updateFiltersUI();
    applyFilters();
  });
}

// UI 表示
function updateFiltersUI() {
  const container = document.getElementById("active-filters");
  const filters = [];

  if (searchText) filters.push(`名前: ${searchText}`);
  activeTags.forEach(t => filters.push(`タグ: ${t}`));
  activeVersions.forEach(v => filters.push(`MC: ${v}`));

  container.innerHTML = filters
    .map(f => `<span class="filter-pill">${f}</span>`)
    .join("");
}

// カード生成
function createCard(item, type) {
  return `
    <div class="card" onclick="location.href='${type}.html?id=${item.id}'">
      <div class="card-header">
        <h3>${item.name}</h3>
        <span class="version-pill">${item.versions?.[0]?.mc_version || ""}</span>
      </div>

      <div class="tag-container">
        ${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
      </div>

      <p class="card-desc">${item.description}</p>
    </div>
  `;
}

// 一覧描画
function renderItemList(container, items, type) {
  if (!items.length) {
    container.innerHTML = `<div class="no-result">該当するデータがありません。</div>`;
    return;
  }

  container.innerHTML = items.map(item => createCard(item, type)).join("");
}

// ページ名取得
function getPageType() {
  const file = location.pathname.split("/").pop();
  return file.replace(".html", "");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
