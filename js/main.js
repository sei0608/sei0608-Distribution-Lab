// data.json からデータを取得してページを初期化する処理
async function initCategoryPage(categoryKey) {
    const searchInput = document.getElementById('search-input');
    const itemList = document.getElementById('item-list');
    const itemDetail = document.getElementById('item-detail');

    try {
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

// バージョン文字列を比較用の数値配列に変換する
function parseVersion(vStr) {
    if (!vStr) return [];
    const match = vStr.match(/\d+(?:\.\d+)*/);
    if (!match) return [];
    return match[0].split('.').map(n => parseInt(n, 10));
}

// 2つのバージョン配列を比較する
function compareVersions(v1, v2) {
    const len = Math.max(v1.length, v2.length);
    for (let i = 0; i < len; i++) {
        const num1 = v1[i] !== undefined ? v1[i] : 0;
        const num2 = v2[i] !== undefined ? v2[i] : 0;
        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
    }
    return 0;
}

// 検索キーワード（kw）がデータ側のバージョン表記（vText）に該当するか判定
function isVersionMatch(vText, kw) {
    if (!vText || !kw) return false;

    if (vText.toLowerCase().includes(kw)) return true;

    const normalized = vText.replace(/–/g, '-');
    const parts = normalized.split('-').map(p => p.trim());

    if (parts.length === 2) {
        const startVer = parseVersion(parts[0]);
        const endVer = parseVersion(parts[1]);
        const targetVer = parseVersion(kw);

        if (startVer.length > 0 && endVer.length > 0 && targetVer.length > 0) {
            const geStart = compareVersions(targetVer, startVer) >= 0;
            const leEnd = compareVersions(targetVer, endVer) <= 0;

            if (geStart && leEnd) {
                return true;
            }
        }
    }

    return false;
}

// 共通表示・検索処理
function setupPage(dataList, searchInput, itemList, itemDetail) {
    // 検索入力欄の親要素（.search-box）を取得
    const searchBox = searchInput ? searchInput.closest('.search-box') : null;

    function renderList(items) {
        itemList.style.display = 'grid';
        itemDetail.style.display = 'none';
        if (searchBox) searchBox.style.display = 'block';

        itemList.innerHTML = '';
        if (items.length === 0) {
            itemList.innerHTML = '<p>該当する項目は見つかりませんでした。</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const tagsHtml = item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
            const loaderHtml = item.loader ? `<span class="tag">${item.loader}</span>` : '';
            const mcVerHtml = item.mcVersion ? `<span class="tag">MC ${item.mcVersion}</span>` : '';

            card.innerHTML = `
                <div class="item-title">${item.name}</div>
                <div>${item.summary || ''}</div>
                <div class="tags">${mcVerHtml}${loaderHtml}${tagsHtml}</div>
            `;

            card.addEventListener('click', () => {
                showDetail(item);
                history.pushState(null, '', `?id=${item.id}`);
            });
            itemList.appendChild(card);
        });
    }

    function showDetail(item) {
        itemList.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none';
        itemDetail.style.display = 'block';

        const currentUrl = `${window.location.origin}${window.location.pathname}?id=${item.id}`;

// 1. **太字** を <strong>太字</strong> に変換
        // 2. URLを自動判定して <a> タグへ変換
        const descText = item.description || '';
        const formattedDescription = descText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #4da6ff; text-decoration: underline;">$1</a>'
            );

        const tagsHtml = item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        const loaderHtml = item.loader ? `<span class="tag">${item.loader}</span>` : '';

        let versionsHtml = '';
        if (item.versions && Array.isArray(item.versions)) {
            versionsHtml = item.versions.map(v => {
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
        }

        itemDetail.innerHTML = `
            <div class="back-btn" id="back-btn">← 一覧に戻る</div>
            <h2>${item.name}</h2>
            <p><strong>制作者:</strong> ${item.author || ''}</p>
            <div class="tags" style="margin: 15px 0;">${loaderHtml}${tagsHtml}</div>
            


            <div style="margin: 20px 0; white-space: pre-wrap;">${formattedDescription}</div>
            
            <h3>バージョン履歴</h3>
            <ul class="version-list">
                ${versionsHtml}
            </ul>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            history.pushState(null, '', window.location.pathname);
            renderList(dataList);
        });
    }

    // 検索機能
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const rawQuery = e.target.value.toLowerCase().trim();
            if (rawQuery === '') {
                renderList(dataList);
                return;
            }

            const keywords = rawQuery.split(/[\s,、]+/).filter(k => k.length > 0);

            const filtered = dataList.filter(item => {
                const mcVersionsTarget = [item.mcVersion, ...(item.versions ? item.versions.map(v => v.mcVersion) : [])];

                return keywords.every(kw => {
                    const nameMatch = item.name ? item.name.toLowerCase().includes(kw) : false;
                    const tagMatch = item.tags ? item.tags.some(t => t.toLowerCase().includes(kw)) : false;
                    const loaderMatch = item.loader ? item.loader.toLowerCase().includes(kw) : false;
                    const mcMatch = mcVersionsTarget.some(vText => isVersionMatch(vText, kw));

                    return nameMatch || tagMatch || mcMatch || loaderMatch;
                });
            });

            renderList(filtered);
        });
    }

    // URLパラメータの初期判定（直リンク時の表示）
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');

    if (targetId) {
        const foundItem = dataList.find(item => item.id === targetId);
        if (foundItem) {
            showDetail(foundItem);
            return;
        }
    }

    // 初期表示
    renderList(dataList);
}
