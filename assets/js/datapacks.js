let allDatapacks = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadDatapacks() {
  const res = await fetch("data/datapacks.json");
  allDatapacks = await res.json();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function applyFilters() {
  const filtered = filterItems(allDatapacks);
  renderItemList(document.getElementById("datapack-list"), filtered, "datapacks");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("datapack-list"), allDatapacks, "datapacks");

  renderTagButtons(allDatapacks);
  setupVersionSelect(allDatapacks);
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

  loadDatapacks();
});
