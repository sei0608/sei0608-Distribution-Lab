let allResourcepacks = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadResourcepacks() {
  const res = await fetch("data/resourcepacks.json");
  allResourcepacks = await res.json();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function applyFilters() {
  const filtered = filterItems(allResourcepacks);
  renderItemList(document.getElementById("resourcepack-list"), filtered, "resourcepacks");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("resourcepack-list"), allResourcepacks, "resourcepacks");

  renderTagButtons(allResourcepacks);
  setupVersionSelect(allResourcepacks);
}

function showDetail(id) {
  const rp = allResourcepacks.find(r => r.id === id);
  if (!rp) return;

  document.getElementById("search-section").style.display = "none";
  document.getElementById("list-section").style.display = "none";
  document.getElementById("detail-section").style.display = "";

  document.getElementById("detail-title").textContent = rp.name;
  document.getElementById("detail-tags").innerHTML = rp.tags.map(t => `<span>${t}</span>`).join("");
  document.getElementById("detail-description").textContent = rp.description;

  document.getElementById("detail-versions").innerHTML =
    rp.versions.map(v => `
      <li><a href="${v.download_url}">${v.mc_version} - ${v.resourcepack_version}</a></li>
    `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");

  input.addEventListener("input", () => {
    searchText = input.value.trim();
    updateFiltersUI();
    applyFilters();
  });

  loadResourcepacks();
});
