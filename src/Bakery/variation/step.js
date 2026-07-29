import { isExist, findProduct, findStep, deepCompare } from "./Utils";
import { registry } from "@/service/Registry";

export function createStepElement({
  steps,
  value,
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
    value: value,
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
  const catSelect = createCategorySelectElement({ dynamicSteps, steps: state.steps });
  element.querySelector("#category-select").replaceWith(catSelect);
  const prodSelect = createProductSelectElement({ dynamicSteps, steps: state.steps });
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
  element
    .querySelector(".input")
    .append(
      pricePerGramInput,
      percentInput,
      weightInput,
      priceInput,
      removeBtn,
    );

  // event
  removeBtn.addEventListener("click", (e) => {
    handleStepRemove(element);
  });
  prodSelect.addEventListener("change", (e) => {
    state.value = e.target.value;
    state.ingredient = e.target.options[e.target.selectedIndex].text;
    update({
      value: e.target.value,
      label: e.target.options[e.target.selectedIndex].text,
    });
    handleSelect(e, state.key);
  });
  catSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    if (state.steps[key]?.options) {
      state.key = key;
      state.step = state.steps[key];
      state.cat = state.step.source;
      prodSelect.update(state.step?.options);
    } else {
      alert(`options for {$step} are not found`);
    }
  });
  percentInput.querySelector("input").addEventListener("change", (e) => {
    state.percent = parseFloat(e.target.value);
    handlePercentChange({ stepEl: element });
  });

  // method
  const rerenderStep = () => {
    prodSelect.update(state.step?.options);
    if (state.value) {
      prodSelect.value = state.value;
    }
  };
  const updateCatSelect = () => {
    catSelect.value = state.key;
    prodSelect.update(state.step?.options);
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
      element.updateWeightByRatio({ totalWeight: getState().totalWeight });
      element.updateCost();
      state.costPerGram = cost;
    } else {
      element.clear();
    }
  };
  const update = ({ label }) => {
    let productName = label;
    let product = findProduct(productName, source[state.cat]);
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
    const rs = findStep(state.value, state.steps);
    if (rs) {
      const { key, step } = rs;
      state.key = key;
      state.step = step;
      state.cat = step.source;
      updateCatSelect();
      let newValue;
      let label = isExist(value, step.options);
      if (label) {
        newValue = value;
      } else {
        newValue = "0";
        element.querySelector(`.message`).innerHTML =
          `${value ?? ""} not found`;
      }
      update({ value, label });
      prodSelect.value = newValue;
    } else {
      element.querySelector(`.message`).innerHTML = `${value ?? ""} not found`;
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
  //init
  if (value) {
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
