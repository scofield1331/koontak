export async function uploadImage(key, name, file) {
  if (!file) {
    alert("file invalid");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", key);
  formData.append("name", name);
  try {
    const response = await fetch("./dispatcher.php?action=uploadSettingImage", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Upload error:", err);
  }
}

export function printRecipe(recipe) {
  var form = document.createElement("form");
  form.method = "POST";
  form.action = "./dispatcher.php?action=printRecipe";
  form.target = "_blank";
  form.style.display = "none";

  var input = document.createElement("input");
  input.type = "hidden";
  input.name = "recipe";
  input.value = JSON.stringify(recipe);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
