let allresourcepacks = [];

async function loadresourcepacks() {
  const res = await fetch("data/resourcepacks.json");
  allresourcepacks = await res.json();
  const list = document.getElementById("resourcepack-list");
  renderItemList(list, allresourcepacks, "resourcepacks");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  input.addEventListener("input", () => {
    const filtered = filterItems(allresourcepacks, input.value);
    const list = document.getElementById("resourcepack-list");
    renderItemList(list, filtered, "resourcepacks");
  });

  loadresourcepacks();
});
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderDetail(resourcepack) {
  const main = document.querySelector("main");
  main.innerHTML = "";

  const section = document.createElement("section");

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = resourcepack.name;
  section.appendChild(title);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tag-list";
  (resourcepack.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagsDiv.appendChild(span);
  });
  section.appendChild(tagsDiv);

  const desc = document.createElement("p");
  desc.textContent = resourcepack.description;
  section.appendChild(desc);

  const historyTitle = document.createElement("h3");
  historyTitle.textContent = "バージョン履歴";
  section.appendChild(historyTitle);

  const ul = document.createElement("ul");
  resourcepack.versions.forEach(v => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = `${v.mc_version} - ${v.loader} ${v.resourcepack_version}`;
    a.href = v.download_url;
    li.appendChild(a);
    ul.appendChild(li);
  });
  section.appendChild(ul);

  main.appendChild(section);
}

async function loadresourcepacks() {
  const res = await fetch("data/resourcepacks.json");
  allresourcepacks = await res.json();

  const id = getQueryParam("id");
  if (id) {
    const resourcepack = allresourcepacks.find(m => m.id === id);
    if (resourcepack) {
      renderDetail(resourcepack);
      return;
    }
  }

  const list = document.getElementById("resourcepack-list");
  renderItemList(list, allresourcepacks, "resourcepacks");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("input", () => {
      const filtered = filterItems(allresourcepacks, input.value);
      const list = document.getElementById("resourcepack-list");
      renderItemList(list, filtered, "resourcepacks");
    });
  }

  loadresourcepacks();
});
