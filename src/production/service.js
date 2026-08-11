export async function loadInventory(inventory) {
  const response = await fetch(
    "../production/products-template.php?action=loadInventory",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventory: inventory,
      }),
    },
  );
  return response.json();
}
export async function updateProductionJson(list) {
  const response = await fetch(
    "../production/products-template.php?action=updateProductionJson",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        list: list,
      }),
    },
  );
  return response.json();
}
