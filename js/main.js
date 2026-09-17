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

// バージョン文字列を比較用の数値配列に変換する (例: "1.21.11" -> [1, 21, 11])
function parseVersion(vStr) {
    if (!vStr) return [];
    const match = vStr.match(/\d+(?:\.\d+)*/);
    if (!match) return [];
    return match[0].split('.').map(n => parseInt(n, 10));
}

// 2つのバージョン配列を比較する ( -1: v1 < v2,  0: v1 == v2,  1: v1 > v2 )
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

// 検索キーワード（kw）がデータ側のバージョン表記（vText）に該当するか判定する関数
function isVersionMatch(vText, kw) {
    if (!vText || !kw) return false;

    // 単純な部分一致（文字列として含まれるか）
    if (vText.toLowerCase().includes(kw)) return true;

    // ハイフン（- や –）で囲まれた範囲表記があるか確認
    const normalized = vText.replace(/–/g, '-');
    const parts = normalized.split('-').map(p => p.trim());

    if (parts.length === 2) {
        const startVer = parseVersion(parts[0]);
        const endVer = parseVersion(parts[1]);
        const targetVer = parseVersion(kw);

        // 入力された検索キーワード（kw）が有効なバージョン番号の場合
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

    function showDetail(item, updateHash = true) {
        itemList.style.display = 'none';
        if (searchInput) searchInput.parentElement.style.display = 'none';
        itemDetail.style.display = 'block';

        // URLのハッシュに id を反映 (#id)
        if (updateHash && item.id) {
            history.pushState(null, '', `#${item.id}`);
        }

        // URLを自動判定してaタグへ変換
        const formattedDescription = item.description.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #4da6ff; text-decoration: underline;">$1</a>'
        );

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
            <div style="margin: 20px 0; white-space: pre-wrap;">${formattedDescription}</div>
            
            <h3>バージョン履歴</h3>
            <ul class="version-list">
                ${versionsHtml}
            </ul>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            itemDetail.style.display = 'none';
            itemList.style.display = 'grid';
            if (searchInput) searchInput.parentElement.style.display = 'block';
            // ハッシュを消去
            history.pushState(null, '', location.pathname);
        });
    }

    // URLハッシュ判定（#id が指定されている場合に直接詳細を開く）
    function checkHash() {
        const hash = location.hash.replace('#', '');
        if (hash) {
            const targetItem = dataList.find(item => item.id === hash);
            if (targetItem) {
                showDetail(targetItem, false);
                return true;
            }
        }
        return false;
    }

    // 複合即時検索機能
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
                    const nameMatch = item.name.toLowerCase().includes(kw);
                    const tagMatch = item.tags.some(t => t.toLowerCase().includes(kw));
                    const loaderMatch = item.loader ? item.loader.toLowerCase().includes(kw) : false;
                    const mcMatch = mcVersionsTarget.some(vText => isVersionMatch(vText, kw));

                    return nameMatch || tagMatch || mcMatch || loaderMatch;
                });
            });

            renderList(filtered);
        });
    }

    // ブラウザの「進む」「戻る」ボタンへの対応
    window.addEventListener('popstate', () => {
        if (!checkHash()) {
            itemDetail.style.display = 'none';
            itemList.style.display = 'grid';
            if (searchInput) searchInput.parentElement.style.display = 'block';
        }
    });

    // 初期表示処理 (ハッシュ指定がある場合は直接詳細画面を表示)
    if (!checkHash()) {
        renderList(dataList);
    }
}
