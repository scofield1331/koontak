import { registry } from "@/service/Registry";
//Bakery, Shop/Label/
export function createPromoTag(product, type = "ingredient", options) {
  const calculator = registry.get("calculator");
  let mainVariation =
    Calculation.getRetailsByStockLocation(product, "Shop")[0] ?? false;
  let price = 0;
  const state = {
    type: type,
    content: "",
  };
  if (mainVariation) {
    if (options.page == "ShopLabel") {
      price = calculator.calculateRetailUniversal(
        product,
        mainVariation,
        "bodishop",
      );
    } else if (options.page == "Bakery") {
      price = isNaN(mainVariation.RetailMarkup)
        ? 0
        : Number(mainVariation.RetailMarkup);
    }
  }
  const element = document.createElement("div");
  element.className = `label-card row-${product.category}`;
  element.innerHTML = String.raw`
        <div class="title">${product.Title?.ProductName ?? ""}</div>
        <div class="title">${product.Title?.Specification ?? ""}</div>
        <div class="price">${price.toFixed(2)}$  ${mainVariation ? `(${mainVariation.RetailSize} ${mainVariation.RetailUnit})` : ""}</div>
        <div class="ingredients benefits content"></div>
    `;
  const contentEl = element.querySelector(".content");
  element.updateType = (type) => {
    state.type = type;
    let content;
    if (type == "ingredient") {
      content = product.Ingredients ?? "";
    } else {
      content =
        product.Benefits &&
        Object.keys(product.Benefits)
          .map((key) => product.Benefits[key])
          .join("<br />");
    }
    contentEl.innerHTML = content;
    state.content = content;
  };
  element.updateVariation = () => {
    mainVariation =
      Calculation.getRetailsByStockLocation(product, "Shop")[0] ?? false;
    if (mainVariation) {
      if (options.page == "ShopLabel") {
        price = calculator.calculateRetailUniversal(
          product,
          mainVariation,
          "bodishop",
        );
      } else if (options.page == "Bakery") {
        price = isNaN(mainVariation.RetailMarkup)
          ? 0
          : Number(mainVariation.RetailMarkup);
      }
    }
    element.querySelector(".price").innerHTML =
      `${price.toFixed(2)}$  ${mainVariation ? `(${mainVariation.RetailSize} ${mainVariation.RetailUnit})` : ""}`;
  };
  element.serialize = () => {
    return {
      category: product.category ?? "",
      product: product.Product ?? "",
      productName: product.Title?.ProductName ?? "",
      specification: product.Title?.Specification ?? "",
      price: price.toFixed(2),
      size: mainVariation.RetailSize,
      unit: mainVariation.RetailUnit,
      content: state.content,
    };
  };
  element.updateType(type);
  return element;
}
