let alldatapacks = [];

async function loaddatapacks() {
  const res = await fetch("data/datapacks.json");
  alldatapacks = await res.json();
  const list = document.getElementById("datapack-list");
  renderItemList(list, alldatapacks, "datapacks");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  input.addEventListener("input", () => {
    const filtered = filterItems(alldatapacks, input.value);
    const list = document.getElementById("datapack-list");
    renderItemList(list, filtered, "datapacks");
  });

  loaddatapacks();
});
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderDetail(datapack) {
  const main = document.querySelector("main");
  main.innerHTML = "";

  const section = document.createElement("section");

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = datapack.name;
  section.appendChild(title);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tag-list";
  (datapack.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagsDiv.appendChild(span);
  });
  section.appendChild(tagsDiv);

  const desc = document.createElement("p");
  desc.textContent = datapack.description;
  section.appendChild(desc);

  const historyTitle = document.createElement("h3");
  historyTitle.textContent = "バージョン履歴";
  section.appendChild(historyTitle);

  const ul = document.createElement("ul");
  datapack.versions.forEach(v => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = `${v.mc_version} - ${v.datapack_version}`;
    a.href = v.download_url;
    li.appendChild(a);
    ul.appendChild(li);
  });
  section.appendChild(ul);

  main.appendChild(section);
}

async function loaddatapacks() {
  const res = await fetch("data/datapacks.json");
  alldatapacks = await res.json();

  const id = getQueryParam("id");
  if (id) {
    const datapack = alldatapacks.find(m => m.id === id);
    if (datapack) {
      renderDetail(datapack);
      return;
    }
  }

  const list = document.getElementById("datapack-list");
  renderItemList(list, alldatapacks, "datapacks");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("input", () => {
      const filtered = filterItems(alldatapacks, input.value);
      const list = document.getElementById("datapack-list");
      renderItemList(list, filtered, "datapacks");
    });
  }

  loaddatapacks();
});
