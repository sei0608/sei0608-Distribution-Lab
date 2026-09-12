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

function showList() {
  document.getElementById("detail-section").style.display = "none";

  const list = document.getElementById("datapack-list");
  list.innerHTML = allDatapacks.map(dp => `
    <div class="card" onclick="location.href='datapacks.html?id=${dp.id}'">
      <h3>${dp.name}</h3>
      <p>${dp.description}</p>
    </div>
  `).join("");
}

function showDetail(id) {
  const dp = allDatapacks.find(d => d.id === id);
  if (!dp) return;

  document.getElementById("datapack-list").innerHTML = "";
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
    const q = input.value.toLowerCase();
    const filtered = allDatapacks.filter(dp =>
      dp.name.toLowerCase().includes(q)
    );

    const list = document.getElementById("datapack-list");
    list.innerHTML = filtered.map(dp => `
      <div class="card" onclick="location.href='datapacks.html?id=${dp.id}'">
        <h3>${dp.name}</h3>
        <p>${dp.description}</p>
      </div>
    `).join("");
  });

  loadDatapacks();
});
