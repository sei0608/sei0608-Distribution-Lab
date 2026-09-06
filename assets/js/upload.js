document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("type");
  const loaderLabel = document.getElementById("loader-label");

  // Mod以外はローダーを非表示
  typeSelect.addEventListener("change", () => {
    loaderLabel.style.display = typeSelect.value === "mod" ? "" : "none";
  });

  document.getElementById("generate-btn").addEventListener("click", () => {
    const type = typeSelect.value;
    const id = document.getElementById("id").value.trim();
    const name = document.getElementById("name").value.trim();
    const tags = document.getElementById("tags").value.split(",").map(t => t.trim()).filter(t => t);
    const description = document.getElementById("description").value.trim();
    const mcVersion = document.getElementById("mc_version").value.trim();
    const loader = document.getElementById("loader").value.trim();
    const version = document.getElementById("version").value.trim();
    const releaseTag = document.getElementById("release_tag").value.trim();

    let fileName = "";
    let downloadUrl = "";

    if (type === "mod") {
      fileName = `${name}-${mcVersion}-${loader}-${version}.jar`;
      downloadUrl = `https://github.com/sei0608/mods/releases/download/${releaseTag}/${fileName}`;
    } else if (type === "datapack") {
      fileName = `${name}-${mcVersion}-${version}.zip`;
      downloadUrl = `https://github.com/sei0608/datapacks/releases/download/${releaseTag}/${fileName}`;
    } else if (type === "resourcepack") {
      fileName = `${name}-${mcVersion}-${version}.zip`;
      downloadUrl = `https://github.com/sei0608/resourcepacks/releases/download/${releaseTag}/${fileName}`;
    }

    const json = {
      id,
      name,
      author: "sei0608",
      tags,
      description,
      versions: [
        type === "mod"
          ? {
              mc_version: mcVersion,
              loader: loader,
              mod_version: version,
              file_name: fileName,
              download_url: downloadUrl
            }
          : type === "datapack"
          ? {
              mc_version: mcVersion,
              datapack_version: version,
              file_name: fileName,
              download_url: downloadUrl
            }
          : {
              mc_version: mcVersion,
              resourcepack_version: version,
              file_name: fileName,
              download_url: downloadUrl
            }
      ]
    };

    document.getElementById("result").value = JSON.stringify(json, null, 2);
  });
});
