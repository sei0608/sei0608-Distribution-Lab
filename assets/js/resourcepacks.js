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
