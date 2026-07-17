import $ from "jquery";
import { findProduct } from "./Util";
import { createPromoTag } from "./PromoTag";

export function renderPromoTagWrapper(list) {
  const promoTag = createPromoTagWrapper();
  document.querySelector(".right").append(promoTag);
  list &&
    list.forEach((item) => {
      findProduct(item.product, item.format).then((product) => {
        promoTag.add(product);
      });
    });

  $(".list").on("change", ".check", (e) => handleCheck(e, promoTag));
  $(".clear-check").on("click", (e) => promoTag.clear());
  $(".bulk-check").on("click", (e) => handleBulkCheck(e, promoTag));
}
function handleBulkCheck(e, element) {
  const check = $(e.target).prop("checked");
  if (!check) {
    element.clear();
  }
}
function handleCheck(e, element) {
  let row = $(e.target).closest(".item");
  let productName = row.attr("product");
  let format = row.attr("format");
  findProduct(productName, format).then((product) => {
    if (!product) {
      alert(`product ${productName} not found`);
      return;
    }
    let check = $(e.target);
    if (check.prop("checked")) {
      element.add(product);
    } else {
      element.remove(product);
    }
  });
}
export function createPromoTagWrapper(options = { page: 'ShopLabel' }) {
  let state = {
    list: {},
    type: "ingredient",
  };
  // Wrap in a container
  const container = document.createElement("div");
  container.id = "PromoTag";
  if (options.page == 'ShopLabel') {
    const action = document.createElement("div");
    action.className = "action";
    // Button
    const btn = document.createElement("button");
    btn.textContent = "print";

    // Radio: Benefits (checked)
    const label1 = document.createElement("label");
    const radio1 = document.createElement("input");
    radio1.type = "radio";
    radio1.name = "option";
    radio1.value = "benefits";
    label1.appendChild(radio1);
    label1.appendChild(document.createTextNode(" Benefits"));

    // Radio: Ingredients
    const label2 = document.createElement("label");
    const radio2 = document.createElement("input");
    radio2.type = "radio";
    radio2.name = "option";
    radio2.checked = true;
    radio2.value = "ingredients";
    label2.appendChild(radio2);
    label2.appendChild(document.createTextNode(" Ingredients"));

    action.appendChild(btn);
    action.appendChild(label2);
    action.appendChild(label1);
    container.appendChild(action);
    $(btn).on("click", (e) => {
      container.print();
    });
    $(radio1).on("change", (e) => {
      if ($(e.target).prop("checked")) {
        state.type = "benefit";
        Object.keys(state.list).forEach((productName) =>
          state.list[productName].updateType(state.type),
        );
      }
    });
    $(radio2).on("change", (e) => {
      if ($(e.target).prop("checked")) {
        state.type = "ingredient";
        Object.keys(state.list).forEach((productName) =>
          state.list[productName].updateType(state.type),
        );
      }
    });
  }
  // list
  const list = document.createElement("list");
  list.className = "list";

  container.appendChild(list);
  container.updateIngredients = () => {
    Object.keys(state.list).forEach((productName) => {
      state.list[productName].updateType('ingredient');
    });
  };
  container.updateVariation = () => {
    Object.keys(state.list).forEach((productName) => {
      state.list[productName].updateVariation();
    });
  };
  container.add = (product) => {
    const promoTag = createPromoTag(product, state.type, options);
    state.list[product.Product] = promoTag;
    list.append(promoTag);
  };
  container.remove = (product) => {
    if (state.list[product.Product]) {
      state.list[product.Product].remove();
      delete state.list[product.Product];
    }
  };
  container.clear = () => {
    Object.keys(state.list).forEach((productName) => {
      state.list[productName].remove();
      delete state.list[productName];
    });
  };
  container.print = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action =
      "../Bodi/shop/Label/shoplabel-template.php?action=printPromoTag";
    form.target = "_blank";
    let data = Object.keys(state.list).map((productName) =>
      state.list[productName].serialize(),
    );
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  };
  return container;
}
