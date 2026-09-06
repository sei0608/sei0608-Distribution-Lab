document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generate-btn");
  const log = document.getElementById("log");

  btn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const id = document.getElementById("id").value.trim();
    const mcVersion = document.getElementById("mc_version").value.trim();
    const dpVersion = document.getElementById("dp_version").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !id || !mcVersion || !dpVersion) {
      log.value = "必要な項目が入力されていません。";
      return;
    }

    const packFormat = getPackFormat(mcVersion);
    const zip = new JSZip();

    // pack.mcmeta
    const packMcmeta = {
      pack: {
        pack_format: packFormat,
        description: description
      }
    };
    zip.file(`${name}/pack.mcmeta`, JSON.stringify(packMcmeta, null, 2));

    // load.mcfunction / tick.mcfunction
    zip.file(`${name}/data/${id}/functions/load.mcfunction`, "");
    zip.file(`${name}/data/${id}/functions/tick.mcfunction`, "");

    // ★ ここが完全修正された部分 ★
    const tagFolder = getFunctionTagFolder(mcVersion);

    const loadJson = { values: [`${id}:load`] };
    const tickJson = { values: [`${id}:tick`] };

    zip.file(`${name}/data/minecraft/tags/${tagFolder}/load.json`, JSON.stringify(loadJson, null, 2));
    zip.file(`${name}/data/minecraft/tags/${tagFolder}/tick.json`, JSON.stringify(tickJson, null, 2));

    // ZIP生成
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${mcVersion}-${dpVersion}.zip`;
    a.click();

    log.value =
      `ZIP を生成しました。\n\n` +
      `pack_format: ${packFormat}\n` +
      `function タグフォルダ: ${tagFolder}\n` +
      `ファイル名: ${name}-${mcVersion}-${dpVersion}.zip\n\n` +
      `フォルダ構成:\n` +
      `${name}/pack.mcmeta\n` +
      `${name}/data/${id}/functions/load.mcfunction\n` +
      `${name}/data/${id}/functions/tick.mcfunction\n` +
      `${name}/data/minecraft/tags/${tagFolder}/load.json\n` +
      `${name}/data/minecraft/tags/${tagFolder}/tick.json\n`;
  });
});

// pack_format 自動判定
function getPackFormat(mc) {
  if (mc.startsWith("1.20")) return 18;
  if (mc.startsWith("1.19")) return 15;
  if (mc.startsWith("1.18")) return 9;
  if (mc.startsWith("1.17")) return 7;
  if (mc.startsWith("1.16")) return 6;
  if (mc.startsWith("1.15")) return 5;
  if (mc.startsWith("1.14")) return 4;
  return 18;
}

// ★ 完全修正：MCバージョンを数字だけ抽出して比較する
function getFunctionTagFolder(mc) {
  // 数字だけ抽出（例：1.20.7-pre1 → 1.20.7）
  const numeric = mc.match(/\d+\.\d+\.\d+/);
  if (!numeric) return "functions";

  const [major, minor, patch] = numeric[0].split(".").map(Number);

  // 1.20.7 以上 → function
  if (major === 1 && minor === 20 && patch >= 7) {
    return "function";
  }

  return "functions";
}
