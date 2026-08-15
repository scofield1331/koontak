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
