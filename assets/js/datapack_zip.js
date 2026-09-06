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
    const tagFolder = getFunctionTagFolder(mcVersion);

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

    // load.json / tick.json
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
      `ファイル名: ${name}-${mcVersion}-${dpVersion}.zip\n`;
  });
});

// pack_format 自動判定（最新対応）
function getPackFormat(mc) {
  const numeric = mc.match(/\d+\.\d+(\.\d+)?/);
  if (!numeric) return 18;

  const [major, minor, patch = 0] = numeric[0].split(".").map(Number);

  // 26.x 系
  if (major === 26) {
    if (minor === 1) return 36;      // 26.1〜26.1.2
    if (minor === 2) return 38;      // 26.2
  }

  // 1.21 系
  if (major === 1 && minor === 21) return 30;

  // 1.20.7〜1.20.11
  if (major === 1 && minor === 20 && patch >= 7) return 26;

  // 1.20〜1.20.6
  if (major === 1 && minor === 20) return 18;

  // 既存バージョン
  if (major === 1 && minor === 19) return 15;
  if (major === 1 && minor === 18) return 9;
  if (major === 1 && minor === 17) return 7;
  if (major === 1 && minor === 16) return 6;
  if (major === 1 && minor === 15) return 5;
  if (major === 1 && minor === 14) return 4;

  return 18;
}

function getFunctionTagFolder(mc) {
  const numeric = mc.match(/\d+\.\d+(\.\d+)?/);
  if (!numeric) return "functions";

  const [major, minor, patch = 0] = numeric[0].split(".").map(Number);

  // ★ 1.20.7 以上は全部 function ★
  if (
    (major === 1 && minor === 20 && patch >= 7) ||  // 1.20.7〜
    (major === 1 && minor >= 21) ||                 // 1.21〜
    (major >= 26)                                   // 26.x〜
  ) {
    return "function";
  }

  // それより前は functions
  return "functions";
}



