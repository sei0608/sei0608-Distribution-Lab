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
