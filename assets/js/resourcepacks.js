let allResourcepacks = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadResourcepacks() {
  const res = await fetch("data/resourcepacks.json");
  allResourcepacks = await res.json();

  setupMcVersionSelect();

  const id = getQueryParam("id");
  id ? showDetail(id) : showList();
}

function setupMcVersionSelect() {
  const select = document.getElementById("mc-version-select");
  const versions = new Set();

  allResourcepacks.forEach(rp => {
    rp.versions.forEach(v => versions.add(v.mc_version));
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

  let filtered = allResourcepacks;

  if (text !== "") filtered = filterItems(filtered, text);

  if (mcVersion !== "") {
    filtered = filtered.filter(rp =>
      rp.versions.some(v => v.mc_version === mcVersion)
    );
  }

  renderItemList(document.getElementById("resourcepack-list"), filtered, "resourcepacks");
}

function showList() {
  document.getElementById("search-section").style.display = "";
  document.getElementById("list-section").style.display = "";
  document.getElementById("detail-section").style.display = "none";

  renderItemList(document.getElementById("resourcepack-list"), allResourcepacks, "resourcepacks");
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
  if (input) input.addEventListener("input", applyFilters);

  loadResourcepacks();
});
