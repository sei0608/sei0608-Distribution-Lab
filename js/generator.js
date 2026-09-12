document.getElementById('dp-generator-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('dp-name').value.trim();
    const id = document.getElementById('dp-id').value.trim().toLowerCase();
    const selectedVersion = document.getElementById('dp-mcversion').value;
    const customFormatInput = document.getElementById('dp-custom-format').value;
    const dpVersion = document.getElementById('dp-version').value.trim();
    const description = document.getElementById('dp-description').value.trim();

    // バージョンごとの詳細定義テーブル (pack_format, supported_formats, plural: sをつけるか)
    const versionTable = {
        // --- 26.x 世代 ---
        "26.2":   { format: 61, supported: [61, 65], plural: false }, // カオス・キューブド対応
        "26.1":   { format: 61, supported: [61, 61], plural: false },
        
        // --- 1.21.x 世代 ---
        "1.21.4": { format: 61, supported: [61, 61], plural: false },
        "1.21.2": { format: 57, supported: [57, 57], plural: false },
        "1.21.1": { format: 48, supported: [48, 48], plural: false },
        "1.20.6": { format: 41, supported: [41, 41], plural: false },

        // --- 1.20.4 以前（functions と s がつく旧仕様）---
        "1.20.4": { format: 26, supported: [26, 26], plural: true },
        "1.20.2": { format: 18, supported: [18, 18], plural: true },
        "1.20.1": { format: 15, supported: [15, 15], plural: true },

        // 全対応 / カスタム
        "all_modern": { format: 61, supported: [15, 80], plural: false },
        "custom": { format: parseInt(customFormatInput) || 61, supported: null, plural: false }
    };

    const targetConfig = versionTable[selectedVersion] || versionTable["26.2"];

    // sが付くか判定 (1.20.4以前: "functions", 1.20.5以降: "function")
    const functionFolderName = targetConfig.plural ? "functions" : "function";

    const zip = new JSZip();

    // 1. pack.mcmeta の構築
    const packObj = {
        pack_format: targetConfig.format,
        description: description || `${name} v${dpVersion}`
    };

    if (targetConfig.supported) {
        packObj.supported_formats = targetConfig.supported;
    }

    const mcmetaContent = { pack: packObj };
    zip.file("pack.mcmeta", JSON.stringify(mcmetaContent, null, 4));

    // 2. mcfunction ファイルの作成 (フォルダ名自動切替)
    const functionsDir = zip.folder(`data/${id}/${functionFolderName}`);
    functionsDir.file("load.mcfunction", `# ${name} - Load Function\ntellraw @a "Loaded ${name} v${dpVersion}"`);
    functionsDir.file("tick.mcfunction", `# ${name} - Tick Function`);

    // 3. minecraft/tags/function(s) タグファイルの作成
    const tagsDir = zip.folder(`data/minecraft/tags/${functionFolderName}`);
    
    const loadTagContent = {
        values: [
            `${id}:load`
        ]
    };
    const tickTagContent = {
        values: [
            `${id}:tick`
        ]
    };

    tagsDir.file("load.json", JSON.stringify(loadTagContent, null, 4));
    tagsDir.file("tick.json", JSON.stringify(tickTagContent, null, 4));

    // 出力用ファイル名設定
    const displayVer = selectedVersion === "custom" ? `Format${targetConfig.format}` : selectedVersion;
    const outputFileName = `${name}-${displayVer}-${dpVersion}.zip`;

    // Zipファイルを生成してダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(a.href);
});

// カスタムフォーマット入力欄の表示制御
document.getElementById('dp-mcversion').addEventListener('change', function(e) {
    const customGroup = document.getElementById('custom-format-group');
    if (e.target.value === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
});
