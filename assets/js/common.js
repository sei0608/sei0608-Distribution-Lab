// ===============================
// 共通処理（一覧ページ用）
// ===============================

// 名前・タグ・バージョン検索
function filterItems(items, query) {
  const q = query.trim().toLowerCase();
  if (q === "") return items;

  return items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const tagMatch = (item.tags || []).some(tag =>
      tag.toLowerCase().includes(q)
    );
    const versionMatch = (item.versions || []).some(v =>
      v.mc_version.toLowerCase().includes(q)
    );
    return nameMatch || tagMatch || versionMatch;
  });
}

// カード生成（改善版）
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
