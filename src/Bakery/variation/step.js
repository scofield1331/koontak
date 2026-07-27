import { isExist, findRecipe, findProduct } from "./Utils";
import { registry } from "@/service/Registry";
import { matchSizeUnit } from "./Utils";

export function createStepElement({
  step,
  key,
  handleSelect,
  recipes,
  source,
  handlePercentChange,
  getState,
  dynamicSteps
}) {
  const element = document.createElement("div");
  let state = {
    percent: 0,
    costPerGram: 0,
    weight: 0,
    cost: 0,
  };
  element.className = `align-items-center mb-3 step step-cost ${key}`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col col-md-1">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >${step.label}</label
        >
      </div>
      <div class="col col-md-6">
        <select class="form-select bg-light" data-name="${key}">
          <option value="0">— select —</option>
          ${step.options &&
          step.options
            .map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`,
            )
            .join()}
        </select>
      </div>
    </div>
    <span class="col-md-12 text-danger message"></span>
  `;
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
  element
    .querySelector(".input")
    .append(pricePerGramInput, percentInput, weightInput, priceInput);

  // event
  element.querySelector("select").addEventListener("change", (e) => {
    update({
      value: e.target.value,
      label: e.target.options[e.target.selectedIndex].text,
    });
    handleSelect(e);
  });
  percentInput.querySelector("input").addEventListener("change", (e) => {
    state.percent = parseFloat(e.target.value);
    handlePercentChange({ stepEl: element });
  });

  // method
  const updateRecipe = (recipe) => {
    if (recipe) {
      let costPerGram =
        recipe.Serving > 0 ? recipe.RecipeCost / recipe.Serving : 0;
      pricePerGramInput.querySelector("input").value = costPerGram.toFixed(3);
      pricePerGramInput.querySelector(".tooltip-text").innerHTML = /* HTML */ `
        <div>RecipeCost: ${recipe.RecipeCost}</div>
        <div>Serving: ${recipe.Serving}</div>
        <div>formula: RecipeCost/Serving</div>
      `;
      state.costPerGram = costPerGram;
      element.updateWeightByRatio({ totalWeight: getState().totalWeight })
      element.updateCost();
    } else {
      element.clear();
    }
  };
  const updateProduct = (product) => {
    if (product) {
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
      element.updateWeightByRatio({ totalWeight: getState().totalWeight })
      element.updateCost();
      state.costPerGram = cost;
    } else {
      element.clear();
    }
  };
  const update = ({ value, label }) => {
    if (["step1", "step2"].includes(key)) {
      let recipename = label;
      let recipe = findRecipe(recipename, recipes);
      updateRecipe(recipe);
    } else if (dynamicSteps.includes(key)) {
      let productName = label;
      let product = findProduct(productName, source);
      updateProduct(product);
    }
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
  element.fillValue = ({ value, handleFill }) => {
    let newValue;
    let label = isExist(value, step.options);
    if (label) {
      newValue = value;
    } else {
      newValue = "0";
      element.querySelector(`.message`).innerHTML = `${value ?? ''} not found`;
    }
    update({ value, label });
    element.querySelector("select").value = newValue;
    handleFill({ key, value: newValue });
  };
  element.clear = () => {
    state = { ...state, costPerGram: 0, weight: 0, cost: 0 };
    pricePerGramInput.querySelector("input").value = "";
    pricePerGramInput.querySelector(".tooltip-text").innerHTML = "";
    weightInput.querySelector("input").value = "";
    priceInput.querySelector("input").value = "";
  };
  element.getPercent = () => (isNaN(state.percent) ? 0 : state.percent);
  element.setPercent = (percent) => state.percent = 0;
  element.getCost = () => state.cost;
  element.getKey = () => key;
  return element;
}

export function createStep3Element({
  step,
  key,
  handleSelect,
  handleWeightChange,
}) {
  const element = document.createElement("div");
  element.className = `align-items-center mb-3 step step-weight ${key}`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col col-md-1">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >${step.label}</label
        >
      </div>
      <div class="col col-md-6">
        <select class="form-select bg-light" data-name="${key}">
          <option value="0">— select —</option>
          ${step.options &&
          step.options
            .map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`,
            )
            .join()}
        </select>
      </div>
    </div>
    <span class="col-md-12 text-danger message"></span>
  `;
  // event
  element.querySelector("select").addEventListener("change", (e) => {
    handleSelect(e);
  });

  element.fillValue = ({ value, handleFill }) => {
    let newValue;
    let label = isExist(value, step.options);
    if (label) {
      newValue = value;
    } else {
      newValue = "0";
      element.querySelector(`.message`).innerHTML = `${value ?? ''} not found`;
    }
    element.querySelector("select").value = newValue;
    handleFill({ key, value: newValue });
  };
  element.getKey = () => key;
  return element;
}
