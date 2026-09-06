let allMods = [];

async function loadMods() {
  const res = await fetch("data/mods.json");
  allMods = await res.json();
  const list = document.getElementById("mod-list");
  renderItemList(list, allMods, "mods");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  input.addEventListener("input", () => {
    const filtered = filterItems(allMods, input.value);
    const list = document.getElementById("mod-list");
    renderItemList(list, filtered, "mods");
  });

  loadMods();
});
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderDetail(mod) {
  const main = document.querySelector("main");
  main.innerHTML = "";

  const section = document.createElement("section");

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = mod.name;
  section.appendChild(title);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tag-list";
  (mod.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagsDiv.appendChild(span);
  });
  section.appendChild(tagsDiv);

  const desc = document.createElement("p");
  desc.textContent = mod.description;
  section.appendChild(desc);

  const historyTitle = document.createElement("h3");
  historyTitle.textContent = "バージョン履歴";
  section.appendChild(historyTitle);

  const ul = document.createElement("ul");
  mod.versions.forEach(v => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = `${v.mc_version} - ${v.loader} ${v.mod_version}`;
    a.href = v.download_url;
    li.appendChild(a);
    ul.appendChild(li);
  });
  section.appendChild(ul);

  main.appendChild(section);
}

async function loadMods() {
  const res = await fetch("data/mods.json");
  allMods = await res.json();

  const id = getQueryParam("id");
  if (id) {
    const mod = allMods.find(m => m.id === id);
    if (mod) {
      renderDetail(mod);
      return;
    }
  }

  const list = document.getElementById("mod-list");
  renderItemList(list, allMods, "mods");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("input", () => {
      const filtered = filterItems(allMods, input.value);
      const list = document.getElementById("mod-list");
      renderItemList(list, filtered, "mods");
    });
  }

  loadMods();
});
