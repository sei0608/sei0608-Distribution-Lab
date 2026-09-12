let allMods = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadMods() {
  const res = await fetch("data/mods.json");
  allMods = await res.json();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function applyFilters() {
  const filtered = filterItems(allMods);
  renderItemList(document.getElementById("mod-list"), filtered, "mods");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("mod-list"), allMods, "mods");

  renderTagButtons(allMods);
  setupVersionSelect(allMods);
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

  loadMods();
});
