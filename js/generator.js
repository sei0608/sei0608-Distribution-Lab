document.getElementById('dp-generator-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('dp-name').value.trim();
    const id = document.getElementById('dp-id').value.trim().toLowerCase();
    const mcVersion = document.getElementById('dp-mcversion').value;
    const dpVersion = document.getElementById('dp-version').value.trim();
    const description = document.getElementById('dp-description').value.trim();

    // マインクラフトのバージョンに応じた pack_format マッピング
    const packFormatMap = {
        "1.20.4": 26,
        "1.20.1": 15,
        "1.19.4": 12
    };

    const packFormat = packFormatMap[mcVersion] || 15;

    const zip = new JSZip();

    // 1. pack.mcmeta の作成
    const mcmetaContent = {
        pack: {
            pack_format: packFormat,
            description: description || `${name} v${dpVersion}`
        }
    };
    zip.file("pack.mcmeta", JSON.stringify(mcmetaContent, null, 4));

    // 2. mcfunction ファイルの作成
    const functionsDir = zip.folder(`data/${id}/functions`);
    functionsDir.file("load.mcfunction", `# ${name} - Load Function\ntellraw @a "Loaded ${name} v${dpVersion}"`);
    functionsDir.file("tick.mcfunction", `# ${name} - Tick Function`);

    // 3. minecraft/tags/function タグファイルの作成
    const tagsDir = zip.folder("data/minecraft/tags/functions");
    
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
    const outputFileName = `${name}-${mcVersion}-${dpVersion}.zip`;

    // Zipファイルを生成してダウンロードさせる
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(a.href);
});
