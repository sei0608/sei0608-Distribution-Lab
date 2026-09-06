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

    // pack.mcmeta（min/max 対応）
    const packMcmeta = createPackMcmeta(description, packFormat);
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


// ===============================
// pack_format（正式版全対応）
// ===============================
function getPackFormat(mc) {
  const numeric = mc.match(/\d+\.\d+(\.\d+)?/);
  if (!numeric) return 4;

  const [major, minor, patch = 0] = numeric[0].split(".").map(Number);

  // 26.x 系
  if (major === 26) {
    if (minor === 1) return 101.1;
    if (minor === 2) return 107.1;
  }

  // 1.21 系
  if (major === 1 && minor === 21) {
    if (patch <= 1) return 48;
    if (patch <= 3) return 57;
    if (patch === 4) return 61;
    if (patch === 5) return 71;
    if (patch === 6) return 80;
    if (patch <= 8) return 81;
    if (patch === 9) return 88.0;
    if (patch === 11) return 94.1;
  }

  // 1.20 系
  if (major === 1 && minor === 20) {
    if (patch <= 1) return 15;
    if (patch === 2) return 18;
    if (patch <= 4) return 26;
    if (patch <= 6) return 41;
  }

  // 1.19 系
  if (major === 1 && minor === 19) {
    if (patch <= 3) return 10;
    if (patch === 4) return 12;
  }

  // 1.18 系
  if (major === 1 && minor === 18) {
    if (patch <= 1) return 8;
    if (patch === 2) return 9;
  }

  // 1.17
  if (major === 1 && minor === 17) return 7;

  // 1.16 系
  if (major === 1 && minor === 16) {
    if (patch === 1) return 5;
    if (patch >= 2 && patch <= 5) return 6;
  }

  // 1.15
  if (major === 1 && minor === 15) return 5;

  // 1.14
  if (major === 1 && minor === 14) return 4;

  // 1.13
  if (major === 1 && minor === 13) return 4;

  return 4;
}


// ===============================
// function タグフォルダ（1.20.7〜最新は function）
// ===============================
function getFunctionTagFolder(mc) {
  const numeric = mc.match(/\d+\.\d+(\.\d+)?/);
  if (!numeric) return "functions";

  const [major, minor, patch = 0] = numeric[0].split(".").map(Number);

  // 1.20.7 以上は全部 function
  if (
    (major === 1 && minor === 20 && patch >= 7) ||
    (major === 1 && minor >= 21) ||
    (major >= 26)
  ) {
    return "function";
  }

  return "functions";
}


// ===============================
// pack.mcmeta（min/max 対応）
// ===============================
function createPackMcmeta(description, packFormat) {
  // 1.21 以降は supported_formats が必須
  if (packFormat >= 48) {
    return {
      pack: {
        pack_format: packFormat,
        description: description,
        supported_formats: {
          min_inclusive: packFormat,
          max_inclusive: packFormat
        }
      }
    };
  }

  // 1.20 以前は従来形式
  return {
    pack: {
      pack_format: packFormat,
      description: description
    }
  };
}

