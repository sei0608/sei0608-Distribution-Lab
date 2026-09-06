document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generate-btn");
  const result = document.getElementById("result");

  btn.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const id = document.getElementById("id").value.trim();
    const mcVersion = document.getElementById("mc_version").value.trim();
    const dpVersion = document.getElementById("dp_version").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !id || !mcVersion || !dpVersion) {
      result.value = "必要な項目が入力されていません。";
      return;
    }

    // pack_format 自動判定
    const packFormat = getPackFormat(mcVersion);

    // pack.mcmeta
    const packMcmeta = {
      pack: {
        pack_format: packFormat,
        description: description
      }
    };

    // データパック構成（フォルダ構造＋空のmcfunction）
    const output = `
=== pack.mcmeta ===
${JSON.stringify(packMcmeta, null, 2)}

=== フォルダ構成 ===
${name}/
└─ data/
   └─ ${id}/
      └─ functions/
         ├─ load.mcfunction
         └─ tick.mcfunction

=== load.mcfunction（空） ===

=== tick.mcfunction（空） ===
`;

    result.value = output;
  });
});

// MCバージョン → pack_format 自動変換
function getPackFormat(mc) {
  if (mc.startsWith("1.20")) return 18;
  if (mc.startsWith("1.19")) return 15;
  if (mc.startsWith("1.18")) return 9;
  if (mc.startsWith("1.17")) return 7;
  if (mc.startsWith("1.16")) return 6;
  if (mc.startsWith("1.15")) return 5;
  if (mc.startsWith("1.14")) return 4;
  return 18; // デフォルト
}
