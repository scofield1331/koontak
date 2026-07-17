export function createLeftTopElement({ showProductList, handleShowSetting, handleNewProductClick }) {
  const element = document.createElement("div");
  element.className = "d-flex justify-content-between";
  element.innerHTML = /* HTML */ `
    <div>
      <a href="#" class="show-product-list d-inline d-md-none"
        >[product list]</a
      >
      <a href="#" class="new-product" data-bs-toggle="modal" data-bs-target="#newProductModal"
        >[new product]</a
      >
    </div>
    <button class="btn btn-default show-setting">setting</button>
  `;

  $(element)
    .find(".show-product-list")
    .on("click", (e) => {
      showProductList();
    });
  $(element)
    .find(".show-setting")
    .on("click", (e) => {
      handleShowSetting();
    });
  $(element)
    .find(".new-product")
    .on("click", (e) => {
      handleNewProductClick();
    });

  return element;
}
