function filterItems(items, query) {
  const q = query.trim().toLowerCase();
  if (q === "") return items;

  return items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const tagMatch = (item.tags || []).some(tag =>
      tag.toLowerCase().includes(q)
    );
    return nameMatch || tagMatch;
  });
}

function renderItemList(container, items, type) {
  container.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = item.name;
    card.appendChild(title);

    const tagsDiv = document.createElement("div");
    tagsDiv.className = "tag-list";
    (item.tags || []).forEach(tag => {
      const span = document.createElement("span");
      span.textContent = tag;
      tagsDiv.appendChild(span);
    });
    card.appendChild(tagsDiv);

    const desc = document.createElement("p");
    desc.textContent = item.description;
    card.appendChild(desc);

    const link = document.createElement("a");
    link.textContent = "ダウンロードページへ";
    link.href = `${type}.html?id=${encodeURIComponent(item.id)}`;
    card.appendChild(link);

    container.appendChild(card);
  });
}
