import { registry } from "@/service/Registry";

export function createStickerElement({ setting }) {
  const element = document.createElement("div");
  element.id = "sticker";
  const state = {
    product: null,
    variation: null,
    sku: null,
  };
  element.addEventListener("click", (e) => {
    if (
      e.target.classList.contains(".ingredientsTable") ||
      element.querySelector(".ingredientsTable").contains(e.target)
    ) {
      element.print({ rotate: 1 });
    }
  });
  const render = ({ product, variation, sku }) => {
    const m = setting.Bakery_Goodies
      ? setting.Bakery_Goodies.replace("M", "")
      : 0;
    const expdate = !isNaN(m)
      ? moment().add(m, "month").format("YYYY-MM-DD")
      : "none";
    element.innerHTML = /* HTML */ ` <div
      class="ingredientsTable cursor-pointer"
      style="background: #FFF; border: 2px solid; text-align: center; width: 300px; padding: 0px 6px; margin: auto;"
    >
      <div class="content_row">
        <div class="content">
          <div
            class="product_name"
            style="margin: 2px 5px; text-transform: uppercase; font-weight: bold;"
          >
            ${product.Title?.ProductName}
          </div>
          <div
            class="product_specification"
            style="margin: 0px 5px; text-transform: uppercase; font-weight: bold;"
          >
            ${product.Title?.Specification}
          </div>
        </div>
      </div>
      <hr />
      <div class="content_row sku">
        <div class="barcode">
          <canvas id="ingredients_barcode" width="40" height="40"></canvas>
        </div>
        <div class="content">
          <div class="variation">
            <div
              class="product_price"
              style="font-weight: bold; font-weight: bold; font-size: 14px; margin: 0px 5px;"
            >
              <span class="StockShelve"></span>
            </div>
            <div style="margin:0 5px">
              <div class="product_content_size">
                <div>
                  <span class="size">${variation.RetailSize}</span>
                  <span class="unit">${variation.RetailUnit}</span>
                </div>
              </div>
              <div class="product_exp_date" style="margin: 0px 5px;">
                Exp date: ${expdate ?? moment().format("YYYY-MM-DD")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="content_row">
        <div class="content ingredient">
          <span>INGREDIENT:</span>
          <span class="product_ingredient"> ${product.Ingredients} </span>
        </div>
      </div>
    </div>`;

    try {
      let canvas = bwipjs.toCanvas("ingredients_barcode", {
        bcid: "datamatrix",
        text: sku,
        scaleX: 1,
        scaleY: 1,
        height: 20,
        width: 20,
        includetext: true,
        textxalign: "center",
      });
    } catch (e) {
      console.log(e);
    }
  };
  element.set = (props) => {
    Object.assign(state, props);
    render(props);
  };
  element.clear = () => {
    element.innerHTML = "";
  };
  element.updateVariation = ({ sku, variation, Ingredients }) => {
    state.variation = variation;
    state.sku = sku;
    element.querySelector(".size").textContent = variation.RetailSize;
    element.querySelector(".unit").textContent = variation.RetailUnit;
    if (Ingredients !== undefined)
      element.querySelector(".product_ingredient").textContent = Ingredients;
    try {
      let canvas = bwipjs.toCanvas("ingredients_barcode", {
        bcid: "datamatrix",
        text: sku,
        scaleX: 1,
        scaleY: 1,
        height: 20,
        width: 20,
        includetext: true,
        textxalign: "center",
      });
    } catch (e) {
      console.log(e);
    }
  };
  element.print = (config = {}, checkInput = undefined) => {
    let form = createPrintIngredientsForm();
    form = $(form);
    let { product, variation, sku } = state;
    let products = [];
    products.push({
      product: product.Product,
      format: product.category,
    });
    form.find("[name=config]").val(JSON.stringify(config));
    form.find("[name=print_price]").val(1);
    form.find("[name=print_product_sku]").val(2);
    form.find("[name=products]").val(JSON.stringify(products));
    form.find("[name=ProductName]").val(product.Title.ProductName);
    form.find("[name=Specification]").val(product.Title.Specification);
    const cal = registry.get("calculator");
    let supplier = cal.pickLastSupplierIgnoreStock(product);
    let expdate = supplier.DateExpiration;
    form.find("input[name=exp]").val(`Exp Date: ${expdate}`);
    form
      .find("input[name=size]")
      .val(`${variation.RetailSize} ${variation.RetailUnit}`);
    form.find("input[name=bartext]").val(state.sku);
    form.find("[name=StockShelve]").val(variation.StockShelve);
    let price = cal.calculateRetailUniversal(product, variation, "bodishop");
    form.find("input[name=price]").val(`$${price}`);
    let regex = new RegExp("^.-.$");
    form
      .find("input[name=StockLocation]")
      .val(regex.test(variation.StockLocation) ? variation.StockLocation : "");
    if (checkInput !== undefined) {
      doCheck(form, checkInput, product);
    } else {
      form.find("[name=product_ingredients]").val(product.Ingredients);
      if (variation.Check?.Usage) {
        form.find("[name=product_usage]").val(product.Usage);
        form.find("[name=print_product_usage_row]").val(1);
        form.find("[name=print_product_usage]").val(1);
        form.find("[name=print_product_usage_title]").val(1);
      }
    }
    form.submit();
  };
  return element;
}

function createPrintIngredientsForm() {
  // Avoid creating duplicates
  const existing = document.getElementById("printRotateStickerForm");
  if (existing) return existing;

  const fields = {
    products: "",
    input: "1",
    ProductName: "",
    Specification: "",
    bartext: "",
    exp: "",
    serving: "",
    size: "",
    attribute: "",
    price: "",
    StockLocation: "",
    StockShelve: "",
    product_usage: "",
    product_ingredients: "",
    product_nutritional: "",
    product_benefits: "",
    print_product_name_row: "1",
    print_product_content_row: "1",
    print_product_serving_row: "0",
    print_product_usage_row: "0",
    print_product_ingredient_row: "0",
    print_product_nutritional_row: "0",
    print_product_name: "1",
    print_product_specification: "1",
    print_price: "1",
    print_product_content: "1",
    print_product_exp_date: "1",
    print_product_usage: "0",
    print_product_usage_title: "0",
    print_product_serving_title: "0",
    print_product_serving: "0",
    print_product_ingredients_title: "1",
    print_product_ingredients: "1",
    print_product_nutritional: "0",
    print_product_nutritional_title: "0",
    print_product_benefits_title: "0",
    print_product_benefits: "0",
    print_product_sku: "2",
    ingredients_font_size: "13",
    ingredients_width: "2",
    ingredients_font_family: "Arial",
    config: "[]",
  };

  const form = document.createElement("form");
  form.id = "printIngredientsTableFrm";
  form.target = "_blank";
  form.method = "post";
  form.action = "../php/Sticker/index.php?action=printStickerManager";
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  return form;
}

// Helper: set values on the form (only for keys that exist as fields)
function setPrintIngredientsFormValues(form, values = {}) {
  Object.entries(values).forEach(([name, value]) => {
    const el = form.elements.namedItem(name);
    if (el) el.value = value;
  });
}

// Helper: submit the form
function submitPrintIngredientsForm(values = {}) {
  const form = createPrintIngredientsForm();
  setPrintIngredientsFormValues(form, values);
  form.submit();
}

function doCheck(form, check, product) {
  if (check.Serving) {
    let serving = self.productHelper.getServing(product);
    form.find("[name=serving]").val(serving);
    form.find("[name=print_product_serving_title]").val(1);
    form.find("[name=print_product_serving]").val(1);
    form.find("[name=print_product_content_row]").val(1);
  } else {
    form.find("[name=print_product_serving_title]").val(0);
    form.find("[name=print_product_serving]").val(0);
    form.find("[name=print_product_content_row]").val(0);
  }
  if (check.Title) {
    form.find("[name=print_product_name_row]").val(1);
    form.find("[name=print_product_name]").val(1);
    form.find("[name=print_product_specification]").val(1);
  } else {
    form.find("[name=print_product_name_row]").val(0);
    form.find("[name=print_product_name]").val(0);
    form.find("[name=print_product_specification]").val(0);
  }
  if (check.Usage) {
    form.find("[name=print_product_serving_row]").val(1);
    form.find("[name=print_product_usage_title]").val(1);
    form.find("[name=print_product_usage]").val(1);
    form.find("[name=product_usage]").val(product.Usage);
  } else {
    form.find("[name=print_product_serving_row]").val(0);
    form.find("[name=print_product_usage_title]").val(0);
    form.find("[name=print_product_usage]").val(0);
  }
  if (check.Ingredient) {
    form.find("[name=product_ingredients]").val(product.Ingredients);
    form.find("[name=print_product_usage_row]").val(1);
    form.find("[name=print_product_ingredients_title]").val(1);
    form.find("[name=print_product_ingredients]").val(1);
  } else {
    form.find("[name=print_product_usage_row]").val(0);
    form.find("[name=print_product_ingredients_title]").val(0);
    form.find("[name=print_product_ingredients]").val(0);
  }
}
