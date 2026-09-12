let allMods = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadMods() {
  const res = await fetch("data/mods.json");
  allMods = await res.json();

  setupMcVersionSelect();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function setupMcVersionSelect() {
  const select = document.getElementById("mc-version-select");
  const versions = new Set();

  allMods.forEach(mod => {
    mod.versions.forEach(v => versions.add(v.mc_version));
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

  let filtered = allMods;

  if (text !== "") filtered = filterItems(filtered, text);

  if (mcVersion !== "") {
    filtered = filtered.filter(mod =>
      mod.versions.some(v => v.mc_version === mcVersion)
    );
  }

  renderItemList(document.getElementById("mod-list"), filtered, "mods");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("mod-list"), allMods, "mods");
}

function showDetail(id) {
  const mod = allMods.find(m => m.id === id);
  if (!mod) return;

  document.getElementById("search-section").style.display = "none";
  document.getElementById("list-section").style.display = "none";
  document.getElementById("detail-section").style.display = "";

  document.getElementById("detail-title").textContent = mod.name;
  document.getElementById("detail-tags").innerHTML = mod.tags.map(t => `<span>${t}</span>`).join("");
  document.getElementById("detail-description").textContent = mod.description;

  document.getElementById("detail-versions").innerHTML =
    mod.versions.map(v => `
      <li><a href="${v.download_url}">${v.mc_version} - ${v.loader} ${v.mod_version}</a></li>
    `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    searchText = input.value.trim();
    updateFiltersUI();
    applyFilters();
  });

  loadMods(); // mods.js の場合
});

