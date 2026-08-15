import {
  findProduct,
  deepCompare,
  isLabelExist,
  defaultRecipeStep,
  findStepByLabel,
  findOptionByLabel,
} from "./Utils";
import { registry } from "@/service/Registry";

export function createStepElement({
  steps,
  recipeStep,
  handleSelect,
  source,
  handlePercentChange,
  getState,
  dynamicSteps,
  handleStepRemove,
}) {
  const element = document.createElement("div");
  let state = {
    steps: steps,
    step: "",
    key: "",
    cat: "",
    product: false,
    recipeStep: recipeStep,
    ingredient: "",
    value: "",
    percent: 0,
    costPerGram: 0,
    weight: 0,
    cost: 0,
  };
  element.className = `align-items-center mb-3 step step-cost`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col col-md-1">
        <template id="category-select"></template>
      </div>
      <div class="col col-md-6">
        <template id="product-select"></template>
      </div>
    </div>
    <span class="col-md-12 text-danger message"></span>
  `;
  const catSelect = createCategorySelectElement({
    dynamicSteps,
    steps: state.steps,
  });
  element.querySelector("#category-select").replaceWith(catSelect);
  const prodSelect = createProductSelectElement({
    dynamicSteps,
    steps: state.steps,
  });
  element.querySelector("#product-select").replaceWith(prodSelect);

  const pricePerGramInput = Object.assign(document.createElement("div"), {
    innerHTML: /* HTML */ ` <input
        type="text"
        class="form-control bg-light"
        readonly
      />
      <span class="tooltip-text"></span>`,
    className: "col col-md-1 tooltip-wrap",
  });
  const percentInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" />`,
    className: "col col-md-1",
  });
  const weightInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" readonly />`,
    className: "col col-md-1",
  });
  const priceInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" readonly />`,
    className: "col col-md-1",
  });
  const removeBtn = Object.assign(document.createElement("div"), {
    innerHTML: `<button>❌</button>`,
    className: "col col-md-1",
  });
  const imageEl = Object.assign(document.createElement("div"), {
    innerHTML: `<img class="img-thumbnail">`,
    className: "col col-md-1",
  });
  element
    .querySelector(".input")
    .append(
      pricePerGramInput,
      percentInput,
      weightInput,
      priceInput,
      removeBtn,
      imageEl,
    );

  // event
  removeBtn.addEventListener("click", (e) => {
    handleStepRemove(element);
  });
  prodSelect.addEventListener("change", (e) => {
    state.value = e.target.value;
    if (state.value) {
      state.recipeStep.Ingredient =
        e.target.options[e.target.selectedIndex].text;
    } else {
      state.recipeStep.Ingredient = "";
    }
    update({
      value: e.target.value,
      label: e.target.options[e.target.selectedIndex].text,
    });
    updateImage(e.target.options[e.target.selectedIndex].text);
    handleSelect(e, state.key);
  });
  catSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    if (state.steps[key]?.options) {
      state.key = key;
      state.step = state.steps[key];
      state.recipeStep.Format = state.step.source;
      prodSelect.update(state.step?.options);
    } else {
      alert(`options for {$step} are not found`);
    }
  });
  percentInput.querySelector("input").addEventListener("change", (e) => {
    state.percent = parseFloat(e.target.value);
    state.recipeStep.StepQuantity = (state.percent / 100).toFixed(2);
    handlePercentChange({ stepEl: element });
  });

  // method
  const rerenderStep = () => {
    prodSelect.update(state.step?.options);
    if (state.recipeStep) {
      const label = state.recipeStep.Ingredient;
      const value = isLabelExist(label, state.step.options);
      if (value) prodSelect.value = state.value;
    }
  };
  const updateCatSelect = () => {
    catSelect.value = state.key;
    prodSelect.update(state.step?.options);
  };
  const updateImage = (label) => {
    const opt = findOptionByLabel(label, state.step.options);
    if (opt.image) {
      imageEl.querySelector("img").src = encodeURI(
        `./icons/${state.key}/${opt.label}.webp`,
      );
    } else {
      imageEl.querySelector("img").src = "";
    }
  };
  const updateProduct = (product) => {
    if (product) {
      state.product = product;
      state.ingredient = product.Title?.ProductName ?? state.ingredient;
      let cal = registry.get("calculator");
      let converter = registry.get("converter");
      let supplier = cal.pickSupplier(product);
      let cost = cal.calculateCostAvgLast(product, "gr");
      let currency = supplier.Currency ? supplier.Currency : "usd";
      let moneyRate;
      let moneyRates = window.Calculation.getMoneyRates();
      switch (currency) {
        case "cad":
          moneyRate = moneyRates.cADUSDRate;
          break;
        case "eur":
          moneyRate = moneyRates.eURUSDRate;
          break;
        case "inr":
          moneyRate = moneyRates.iNRUSDRate;
          break;
        default:
          moneyRate = 1;
      }
      pricePerGramInput.querySelector("input").value = cost.toFixed(4);
      pricePerGramInput.querySelector(".tooltip-text").innerHTML = /* HTML */ `
        <div>Cost: ${supplier.Cost}</div>
        <div>discount: ${supplier.SupplierDiscount}</div>
        <div>size: ${supplier.SupplierSize}</div>
        <div>unit: ${supplier.SupplierUnit}</div>
        <div>
          toGr:
          ${converter.convertStockValue(
            supplier.SupplierSize,
            supplier.SupplierUnit,
            "gr",
          )}
        </div>
        <div>currency: ${currency}</div>
        <div>moneyrate: ${moneyRate}</div>
        <div>freight: ${supplier.Freight}</div>
        <div>
          formula: cost*(1-discount/100)/(size unit to gr)*moneyrate*(1+freight)
        </div>
      `;
      state.costPerGram = cost;
      element.updateWeightByRatio({ totalWeight: getState().totalWeight });
      element.updateCost();
    } else {
      element.clear();
    }
  };
  const update = ({ label }) => {
    let productName = label;
    let product = findProduct(productName, source[state.recipeStep.Format]);
    updateProduct(product);
  };

  element.updateWeightByRatio = ({ totalWeight }) => {
    let percent = isNaN(state.percent) ? 0 : state.percent;
    let weight = (totalWeight * percent) / 100;
    weightInput.querySelector("input").value = weight;
    state.weight = weight;
  };
  element.updateCost = () => {
    state.cost = state.costPerGram * state.weight;
    priceInput.querySelector("input").value = state.cost.toFixed(2);
  };
  const fillValue = () => {
    const rs = findStepByLabel(state.recipeStep.Ingredient, state.steps);
    state.percent = state.recipeStep.StepQuantity * 100;
    percentInput.querySelector("input").value = state.percent;
    if (rs) {
      const { key, step } = rs;
      state.key = key;
      state.step = step;
      updateCatSelect();
      let newValue;
      let label = state.recipeStep.Ingredient;
      const value = isLabelExist(label, state.step.options);
      if (value) {
        newValue = value;
      } else {
        newValue = "";
        element.querySelector(`.message`).innerHTML =
          `${label ?? ""} not found`;
      }
      state.value = newValue;
      update({ value, label });
      updateImage(label);
      prodSelect.value = newValue;
    } else {
      element.querySelector(`.message`).innerHTML =
        `${state.recipeStep.Ingredient ?? ""} not found`;
      return;
    }
  };
  element.clear = () => {
    state = { ...state, costPerGram: 0, weight: 0, cost: 0 };
    pricePerGramInput.querySelector("input").value = "";
    pricePerGramInput.querySelector(".tooltip-text").innerHTML = "";
    weightInput.querySelector("input").value = "";
    priceInput.querySelector("input").value = "";
  };
  element.getPercent = () => (isNaN(state.percent) ? 0 : state.percent);
  element.setPercent = (percent) => (state.percent = percent);
  element.setSteps = (steps) => {
    if (!deepCompare(state.step, steps[state.key])) {
      state.step = steps[state.key];
      rerenderStep();
    }
  };
  element.getCost = () => state.cost;
  element.get = () => state.value;
  element.getKey = () => state.key;
  element.getIngredient = () => state.ingredient;
  element.getFormat = () => state.product.category;
  element.getRecipeStep = () => state.recipeStep;
  //init
  if (!deepCompare(recipeStep, structuredClone(defaultRecipeStep))) {
    fillValue();
  }
  return element;
}

function createCategorySelectElement({ dynamicSteps, steps }) {
  const e = document.createElement("select");
  e.className = "form-select bg-light";
  e.innerHTML = /* HTML */ `<option value="">— select —</option>
    ${dynamicSteps &&
    dynamicSteps
      .map((step) =>
        steps[step]
          ? `<option value="${step}">${steps[step].label}</option>`
          : "",
      )
      .join()} `;
  return e;
}
function createProductSelectElement({}) {
  const e = document.createElement("select");
  e.className = "form-select bg-light";
  e.innerHTML = /* HTML */ `<option value="">— select —</option>`;

  e.update = (options) => {
    e.innerHTML = /* HTML */ `<option value="">— select —</option>
      ${options &&
      options
        .map(
          (option) =>
            `<option value="${option.value}">${option.label}</option>`,
        )
        .join()}`;
  };
  return e;
}
