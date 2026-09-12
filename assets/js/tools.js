document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("pack-type");
  const descInput = document.getElementById("pack-description");
  const formatInput = document.getElementById("pack-format");
  const resultArea = document.getElementById("result");
  const btn = document.getElementById("generate-btn");

  btn.addEventListener("click", () => {
    const type = typeSelect.value;
    const description = descInput.value || "";
    const packFormat = parseInt(formatInput.value, 10) || 1;

    let json;

    // 1.21 以降は min_format / max_format
    if (packFormat >= 48) {
      json = {
        pack: {
          description: description,
          min_format: packFormat,
          max_format: packFormat
        }
      };
    } else {
      json = {
        pack: {
          pack_format: packFormat,
          description: description
        }
      };
    }

    resultArea.value = JSON.stringify(json, null, 2);
  });
});
