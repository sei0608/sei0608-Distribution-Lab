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

function getPackFormat(mc) {
  const numeric = mc.match(/\d+\.\d+(\.\d+)?/);
  if (!numeric) return 4; // 最低値

  const [major, minor, patch = 0] = numeric[0].split(".").map(Number);

  // 26.x 系
  if (major === 26) {
    if (minor === 1) return 101.1;   // 26.1
    if (minor === 2) return 107.1;   // 26.2
  }

  // 1.21 系
  if (major === 1 && minor === 21) {
    if (patch <= 1) return 48;       // 1.21–1.21.1
    if (patch <= 3) return 57;       // 1.21.2–1.21.3
    if (patch === 4) return 61;      // 1.21.4
    if (patch === 5) return 71;      // 1.21.5
    if (patch === 6) return 80;      // 1.21.6
    if (patch <= 8) return 81;       // 1.21.7–1.21.8
    if (patch === 9) return 88.0;    // 1.21.9
    if (patch === 11) return 94.1;   // 1.21.11
  }

  // 1.20 系
  if (major === 1 && minor === 20) {
    if (patch <= 1) return 15;       // 1.20–1.20.1
    if (patch === 2) return 18;      // 1.20.2
    if (patch <= 4) return 26;       // 1.20.3–1.20.4
    if (patch <= 6) return 41;       // 1.20.5–1.20.6
  }

  // 1.19 系
  if (major === 1 && minor === 19) {
    if (patch <= 3) return 10;       // 1.19–1.19.3
    if (patch === 4) return 12;      // 1.19.4
  }

  // 1.18 系
  if (major === 1 && minor === 18) {
    if (patch <= 1) return 8;        // 1.18–1.18.1
    if (patch === 2) return 9;       // 1.18.2
  }

  // 1.17 系
  if (major === 1 && minor === 17) return 7;

  // 1.16 系
  if (major === 1 && minor === 16) {
    if (patch === 1) return 5;       // 1.16.1
    if (patch >= 2 && patch <= 5) return 6; // 1.16.2–1.16.5
  }

  // 1.15
  if (major === 1 && minor === 15) return 5;

  // 1.14
  if (major === 1 && minor === 14) return 4;

  // 1.13
  if (major === 1 && minor === 13) return 4;

  // それ以前は 4 に統一
  return 4;
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



