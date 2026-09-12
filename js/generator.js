document.getElementById('dp-generator-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('dp-name').value.trim();
    const id = document.getElementById('dp-id').value.trim().toLowerCase();
    const selectedVersion = document.getElementById('dp-mcversion').value;
    const customFormatInput = document.getElementById('dp-custom-format').value;
    const dpVersion = document.getElementById('dp-version').value.trim();
    const description = document.getElementById('dp-description').value.trim();

    // バージョン定義テーブル
    // plural: true -> functions / false -> function
    // useRange: true -> min_format & max_format / false -> pack_format
    const versionTable = {
        "26.2":           { minFormat: 107, maxFormat: 107, plural: false, useRange: true },
        "26.1":           { minFormat: 101, maxFormat: 101, plural: false, useRange: true },
        "1.21.11":        { minFormat: 94,  maxFormat: 94,  plural: false, useRange: true },
        "1.21.9-1.21.10": { minFormat: 88,  maxFormat: 88,  plural: false, useRange: true },
        "1.21.7-1.21.8":  { format: 81, plural: false, useRange: false },
        "1.21.6":         { format: 80, plural: false, useRange: false },
        "1.21.5":         { format: 71, plural: false, useRange: false },
        "1.21.4":         { format: 61, plural: false, useRange: false },
        "1.21.2-1.21.3":  { format: 57, plural: false, useRange: false },
        "1.21-1.21.1":    { format: 48, plural: true,  useRange: false },
        "1.20.5-1.20.6":  { format: 41, plural: true,  useRange: false },
        "1.20.3-1.20.4":  { format: 26, plural: true,  useRange: false },
        "1.20.2":         { format: 18, plural: true,  useRange: false },
        "1.20-1.20.1":    { format: 15, plural: true,  useRange: false },
        "1.19.4":         { format: 12, plural: true,  useRange: false },
        "1.19-1.19.3":    { format: 10, plural: true,  useRange: false },
        "1.18.2":         { format: 9,  plural: true,  useRange: false },
        "1.18-1.18.1":    { format: 8,  plural: true,  useRange: false },
        "1.17-1.17.1":    { format: 7,  plural: true,  useRange: false },
        "1.16.2-1.16.5":  { format: 6,  plural: true,  useRange: false },
        "1.15-1.16.1":    { format: 5,  plural: true,  useRange: false },
        "1.13-1.14.4":    { format: 4,  plural: true,  useRange: false },
        "custom":         { format: parseFloat(customFormatInput) || 107, plural: false, useRange: false }
    };

    const targetConfig = versionTable[selectedVersion] || versionTable["26.2"];

    // フォルダ名切り替え (1.21.1以前: functions / 1.21.2以降: function)
    const functionFolderName = targetConfig.plural ? "functions" : "function";

    const zip = new JSZip();

    // 1. pack.mcmeta の構築
    const packObj = {
        description: description || `${name} v${dpVersion}`
    };

    if (targetConfig.useRange) {
        // 1.21.9 以降の形式
        packObj.min_format = targetConfig.minFormat;
        packObj.max_format = targetConfig.maxFormat;
    } else {
        // 1.21.8 以前の形式
        packObj.pack_format = targetConfig.format;
    }

    const mcmetaContent = { pack: packObj };
    zip.file("pack.mcmeta", JSON.stringify(mcmetaContent, null, 4));

    // 2. mcfunction ファイルの作成
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
