document.getElementById('dp-generator-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('dp-name').value.trim();
    const id = document.getElementById('dp-id').value.trim().toLowerCase();
    const targetVersionRange = document.getElementById('dp-mcversion').value;
    const dpVersion = document.getElementById('dp-version').value.trim();
    const description = document.getElementById('dp-description').value.trim();

    // バージョン設定のマッピング (pack_format と supported_formats の定義)
    // Minecraft 1.20.2以降は supported_formats:[min, max] を指定することで全バージョン警告を回避可能
    let packFormat = 48; // デフォルトは最新設定 (例: 1.21.x用)
    let supportedFormats = [15, 60]; // 1.20.1 〜 最新版までカバー

    if (targetVersionRange === "all") {
        // 全バージョン広く対応 (1.18〜1.21+ 向け設定)
        packFormat = 48;
        supportedFormats = [8, 60];
    } else if (targetVersionRange === "1.20_all") {
        // 1.20全般対応 (1.20〜1.20.6)
        packFormat = 41;
        supportedFormats = [15, 41];
    } else if (targetVersionRange === "1.18_1.19") {
        // 1.18〜1.19対応
        packFormat = 10;
        supportedFormats = [8, 12];
    }

    const zip = new JSZip();

    // 1. pack.mcmeta の作成 (Wiki準拠の全バージョン対応記述)
    const mcmetaContent = {
        pack: {
            pack_format: packFormat,
            supported_formats: supportedFormats,
            description: description || `${name} v${dpVersion}`
        }
    };
    zip.file("pack.mcmeta", JSON.stringify(mcmetaContent, null, 4));

    // 2. mcfunction ファイルの作成
    const functionsDir = zip.folder(`data/${id}/function`);
    functionsDir.file("load.mcfunction", `# ${name} - Load Function\ntellraw @a "Loaded ${name} v${dpVersion}"`);
    functionsDir.file("tick.mcfunction", `# ${name} - Tick Function`);

    // 3. minecraft/tags/function タグファイルの作成
    const tagsDir = zip.folder("data/minecraft/tags/function");
    
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

    // ファイル名ルール: 名前-mcバージョン-データパックバージョン.zip
    const displayMcVersion = targetVersionRange === "all" ? "AllVer" : targetVersionRange;
    const outputFileName = `${name}-${displayMcVersion}-${dpVersion}.zip`;

    // Zipファイルを生成してダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(a.href);
});
