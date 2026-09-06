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
