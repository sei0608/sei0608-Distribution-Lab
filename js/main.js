// data.json からデータを取得してページを初期化する処理
async function initCategoryPage(categoryKey) {
    const searchInput = document.getElementById('search-input');
    const itemList = document.getElementById('item-list');
    const itemDetail = document.getElementById('item-detail');

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allData = await response.json();
        const dataList = allData[categoryKey] || [];

        setupPage(dataList, searchInput, itemList, itemDetail);
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        itemList.innerHTML = '<p style="color: #ff6b6b;">データの読み込みに失敗しました。</p>';
    }
}

// 共通表示・検索処理
function setupPage(dataList, searchInput, itemList, itemDetail) {
    function renderList(items) {
        itemList.innerHTML = '';
        if (items.length === 0) {
            itemList.innerHTML = '<p>該当する項目は見つかりませんでした。</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const loaderHtml = item.loader ? `<span class="tag">${item.loader}</span>` : '';
            const mcVerHtml = `<span class="tag">MC ${item.mcVersion}</span>`;

            card.innerHTML = `
                <div class="item-title">${item.name}</div>
                <div>${item.summary}</div>
                <div class="tags">${mcVerHtml}${loaderHtml}${tagsHtml}</div>
            `;

            card.addEventListener('click', () => showDetail(item));
            itemList.appendChild(card);
        });
    }

    function showDetail(item) {
        itemList.style.display = 'none';
        if (searchInput) searchInput.style.display = 'none';
        itemDetail.style.display = 'block';

        const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const loaderHtml = item.loader ? `<span class="tag">${item.loader}</span>` : '';

        let versionsHtml = item.versions.map(v => {
            let fileName = '';
            let label = '';

            if (item.type === 'datapack') {
                fileName = `${item.name}-${v.mcVersion}-${v.version}.zip`;
                label = `MC ${v.mcVersion} - v${v.version}`;
            } else if (item.type === 'mod') {
                fileName = `${item.name}-${v.mcVersion}-${item.loader}-${v.version}.jar`;
                label = `MC ${v.mcVersion} - ${item.loader} - v${v.version}`;
            } else if (item.type === 'resourcepack') {
                fileName = `${item.name}-${v.mcVersion}-${v.version}.zip`;
                label = `MC ${v.mcVersion} - v${v.version}`;
            } else {
                fileName = `${item.name}-${v.version}.zip`;
                label = `v${v.version}`;
            }

            const downloadPath = `downloads/${item.type}s/${fileName}`;

            return `
                <li class="version-item">
                    <span>${label}</span>
                    <a href="${downloadPath}" class="download-btn" download>ダウンロード</a>
                </li>
            `;
        }).join('');

        itemDetail.innerHTML = `
            <div class="back-btn" id="back-btn">← 一覧に戻る</div>
            <h2>${item.name}</h2>
            <p><strong>制作者:</strong> ${item.author}</p>
            <div class="tags" style="margin: 15px 0;">${loaderHtml}${tagsHtml}</div>
            <div style="margin: 20px 0; white-space: pre-wrap;">${item.description}</div>
            
            <h3>バージョン履歴</h3>
            <ul class="version-list">
                ${versionsHtml}
            </ul>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            itemDetail.style.display = 'none';
            itemList.style.display = 'block';
            if (searchInput) searchInput.style.display = 'block';
        });
    }

    // 即時検索機能
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query === '') {
                renderList(dataList);
                return;
            }

            const filtered = dataList.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(query);
                const tagMatch = item.tags.some(t => t.toLowerCase().includes(query));
                const mcMatch = item.mcVersion.toLowerCase().includes(query);
                const loaderMatch = item.loader ? item.loader.toLowerCase().includes(query) : false;
                
                return nameMatch || tagMatch || mcMatch || loaderMatch;
            });

            renderList(filtered);
        });
    }

    // 初期表示
    renderList(dataList);
}
