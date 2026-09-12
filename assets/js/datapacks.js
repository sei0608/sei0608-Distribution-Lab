let allDatapacks = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadDatapacks() {
  const res = await fetch("data/datapacks.json");
  allDatapacks = await res.json();

  setupMcVersionSelect();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function setupMcVersionSelect() {
  const select = document.getElementById("mc-version-select");
  const versions = new Set();

  allDatapacks.forEach(dp => {
    dp.versions.forEach(v => versions.add(v.mc_version));
  });

  versions.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });

  select.addEventListener("change", applyFilters);
}

function applyFilters() {
  const text = document.getElementById("search-input").value.trim().toLowerCase();
  const mcVersion = document.getElementById("mc-version-select").value;

  let filtered = allDatapacks;

  if (text !== "") filtered = filterItems(filtered, text);

  if (mcVersion !== "") {
    filtered = filtered.filter(dp =>
      dp.versions.some(v => v.mc_version === mcVersion)
    );
  }

  renderItemList(document.getElementById("datapack-list"), filtered, "datapacks");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("datapack-list"), allDatapacks, "datapacks");
}

function showDetail(id) {
  const dp = allDatapacks.find(d => d.id === id);
  if (!dp) return;

  document.getElementById("search-section").style.display = "none";
  document.getElementById("list-section").style.display = "none";
  document.getElementById("detail-section").style.display = "";

  document.getElementById("detail-title").textContent = dp.name;
  document.getElementById("detail-tags").innerHTML = dp.tags.map(t => `<span>${t}</span>`).join("");
  document.getElementById("detail-description").textContent = dp.description;

  document.getElementById("detail-versions").innerHTML =
    dp.versions.map(v => `
      <li><a href="${v.download_url}">${v.mc_version} - ${v.datapack_version}</a></li>
    `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    searchText = input.value.trim();
    updateFiltersUI();
    applyFilters();
  });

  loadDatapacks(); // mods.js の場合
});
