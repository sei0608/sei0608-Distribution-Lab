// data.json からデータを取得してページを初期化する処理
async function initCategoryPage(categoryKey) {
    const searchInput = document.getElementById('search-input');
    const itemList = document.getElementById('item-list');
    const itemDetail = document.getElementById('item-detail');

    try {
        // キャッシュバスター (?v=タイムスタンプ) を追加して常に最新のdata.jsonを取得
        const cacheBuster = Date.now();
        const response = await fetch(`data.json?v=${cacheBuster}`);
        
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

// 範囲文字列（例: "1.21.8-1.21.11", "26.1-26.2", "26.1.0-26.1.2"）を展開する関数
// 範囲文字列（例: "1.21.8-1.21.11", "26.1-26.2", "26.1.0-26.1.2"）を展開する関数
function expandVersionRange(text) {
    const normalized = text.replace(/–/g, '-'); // ハイフンの表記揺れを統一
    const rangeMatch = normalized.match(/(\d+(?:\.\d+)*)\s*-\s*(\d+(?:\.\d+)*)/);

    if (rangeMatch) {
        const startParts = rangeMatch[1].split('.').map(Number);
        const endParts = rangeMatch[2].split('.').map(Number);

        // プレフィックス（メジャー・マイナー）が同じ場合、末尾の数値範囲を展開
        if (startParts.length === endParts.length && startParts.length >= 2) {
            const lastIndex = startParts.length - 1;
            const samePrefix = startParts.slice(0, lastIndex).every((val, idx) => val === endParts[idx]);

            if (samePrefix && startParts[lastIndex] <= endParts[lastIndex]) {
                const prefix = startParts.slice(0, lastIndex).join('.');
                const list = [];
                for (let i = startParts[lastIndex]; i <= endParts[lastIndex]; i++) {
                    list.push(`${prefix}.${i}`);
                }
                return list;
            }
        }
    }
    return [text];
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

    // 複合即時検索機能 (スペース・カンマ区切りおよびバージョン範囲展開対応)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const rawQuery = e.target.value.toLowerCase().trim();
            if (rawQuery === '') {
                renderList(dataList);
                return;
            }

            // スペース（半角/全角）、カンマ(,)、読点(、)でキーワードを分割
            const keywords = rawQuery.split(/[\s,、]+/).filter(k => k.length > 0);

            const filtered = dataList.filter(item => {
                // mcVersion およびバージョン履歴のバージョン表記から範囲を展開
                const mcVersionsTarget = [item.mcVersion, ...(item.versions ? item.versions.map(v => v.mcVersion) : [])];
                const expandedMcVersions = mcVersionsTarget.flatMap(v => v ? expandVersionRange(v) : []);

                return keywords.every(kw => {
                    const nameMatch = item.name.toLowerCase().includes(kw);
                    const tagMatch = item.tags.some(t => t.toLowerCase().includes(kw));
                    const mcMatch = expandedMcVersions.some(v => v.toLowerCase().includes(kw));
                    const loaderMatch = item.loader ? item.loader.toLowerCase().includes(kw) : false;
                    
                    return nameMatch || tagMatch || mcMatch || loaderMatch;
                });
            });

            renderList(filtered);
        });
    }

    // 初期表示
    renderList(dataList);
}
