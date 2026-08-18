import {
  findProduct,
  deepCompare,
  isLabelExist,
  defaultRecipeStep,
  findStepByLabel,
  findOptionByLabel,
  findRecipe,
} from "./Utils";
import { registry } from "@/service/Registry";

export function createStepElement({
  steps,
  recipeStep,
  handleSelect,
  source,
  recipes,
  handlePercentChange,
  getState,
  dynamicSteps,
  handleStepRemove,
  handleShapeChange,
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
    content: false,
  };
  element.className = `align-items-center mb-3 step step-cost`;
  element.innerHTML = /* HTML */ `
    <div class="row input align-items-center">
      <div class="col col-md-2 d-flex">
        <template id="category-select"></template>
        <template id="remove"></template>
      </div>
      <template id="content"></template>
    </div>
    <span class="col-md-12 text-danger message"></span>
  `;
  const catSelect = createCategorySelectElement({
    dynamicSteps,
    steps: state.steps,
  });
  const removeBtn = Object.assign(document.createElement("button"), {
    innerHTML: `❌`,
    className: "align-self-center",
  });
  const costContent = createCostStepElement({
    state,
    update,
    updateImage,
    handleSelect,
    handlePercentChange,
    stepEl: element,
  });
  const shapeContent = createShapeStepElement({
    state,
    stepEl: element,
    handleShapeChange,
  });
  const packageContent = createPackageStepElement({
    state,
    update,
    updateImage,
    handleSelect,
  });
  element.querySelector("#category-select").replaceWith(catSelect);
  element.querySelector("#remove").replaceWith(removeBtn);
  element.querySelector("#content").replaceWith(costContent);
  state.content = costContent;
  // event

  removeBtn.addEventListener("click", (e) => {
    handleStepRemove(element);
  });
  catSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    Object.assign(state.recipeStep, structuredClone(defaultRecipeStep));
    state.recipeStep.Type = key;
    state.key = key;
    if (key == "shape") {
      if (state.content !== shapeContent) {
        state.content.replaceWith(shapeContent);
        state.content = shapeContent;
      }
    } else {
      if (state.content !== costContent) {
        state.content.replaceWith(costContent);
        state.content = costContent;
      } else if (key == "packaging") {
        if (state.content !== packageContent) {
          state.content.replaceWith(packageContent);
          state.content = packageContent;
        }
      }
      if (state.steps[key]?.options) {
        state.step = state.steps[key];
        state.recipeStep.Format = state.step.source;
        state.content.prodSelect.update(state.step?.options);
      } else {
        alert(`options for {$step} are not found`);
      }
    }
  });

  // method
  const rerenderStep = (steps) => {
    if (state.recipeStep?.Type) {
      if (state.recipeStep.Type == "shape") {
        shapeContent.render(steps.shape, true);
      } else if (state.recipeStep.Type == "packaging") {
        if (!deepCompare(state.steps.packaging, steps.packaging)) {
          packageContent.prodSelect.update(steps.packaging.options);
          const label = state.recipeStep.Ingredient;
          const value = isLabelExist(label, steps.packaging.options);
          if (value) packageContent.prodSelect.value = state.value;
        }
      } else {
        if (
          !deepCompare(
            state.steps[state.recipeStep.Type],
            steps[state.recipeStep.Type] ?? [],
          )
        ) {
          costContent.prodSelect.update(steps[state.recipeStep.Type]?.options);
          const label = state.recipeStep.Ingredient;
          const value = isLabelExist(
            label,
            steps[state.recipeStep.Type]?.options,
          );
          if (value) costContent.prodSelect.value = state.value;
        }
      }
    }
    state.steps = steps;
    if (state.recipeStep.Type !== "shape") {
      updateImage(state.recipeStep.Ingredient, true);
    }
  };
  const updateCatSelect = () => {
    catSelect.value = state.key;
    state.content.prodSelect.update(state.step?.options);
  };
  function updateImage(label, reload = false) {
    const name = crypto.randomUUID();
    const opt = findOptionByLabel(label, state.steps[state.key].options);
    if (opt.image) {
      state.content.imageEl.querySelector("img").src = encodeURI(
        `./icons/${state.key}/${opt.label}.webp${reload ? `?t=${name}` : ""}`,
      );
    } else {
      state.content.imageEl.querySelector("img").src = "";
    }
  }
  const updatePackaging = (product) => {
    if (product) {
      state.product = product;
      state.ingredient = product.Title?.ProductName ?? state.ingredient;
      const skus = Object.keys(product.Retail);
      let cost = 0;
      if (skus.length) {
        let cal = registry.get("calculator");
        cost = cal.calculateCost(product, product.Retail[skus[0]]);
      }
      state.cost = cost;
      packageContent.priceInput.querySelector("input").value =
        state.cost.toFixed(2);
    } else {
      element.clear();
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
      costContent.pricePerGramInput.querySelector("input").value =
        cost.toFixed(4);
      costContent.pricePerGramInput.querySelector(".tooltip-text").innerHTML =
        /* HTML */ `
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
            formula: cost*(1-discount/100)/(size unit to
            gr)*moneyrate*(1+freight)
          </div>
        `;
      state.costPerGram = cost;
      element.updateWeightByRatio({ totalWeight: getState().totalWeight });
      element.updateCost();
    } else {
      element.clear();
    }
  };

  const updateRecipe = (recipe) => {
    if (recipe) {
      let costPerGram =
        recipe.Serving > 0 ? recipe.RecipeCost / recipe.Serving : 0;
      costContent.pricePerGramInput.querySelector("input").value =
        costPerGram.toFixed(3);
      state.costPerGram = costPerGram;
      element.updateWeightByRatio({ totalWeight: getState().totalWeight });
      element.updateCost();
    } else {
      element.clear();
    }
  };
  function update({ label }) {
    let productName = label;
    if (["base", "fusion"].includes(state.key)) {
      let recipe = findRecipe(productName, recipes);
      updateRecipe(recipe);
    } else if (state.key == "packaging") {
      let product = findProduct(productName, source[state.recipeStep.Format]);
      updatePackaging(product);
    } else {
      let product = findProduct(productName, source[state.recipeStep.Format]);
      updateProduct(product);
    }
  }
  // expose
  element.updateWeightByRatio = ({ totalWeight }) => {
    let percent = isNaN(state.percent) ? 0 : state.percent;
    let weight = (totalWeight * percent) / 100;
    costContent.weightInput.querySelector("input").value = weight;
    state.weight = weight;
  };
  element.updateCost = () => {
    state.cost = state.costPerGram * state.weight;
    costContent.priceInput.querySelector("input").value = state.cost.toFixed(2);
  };
  const fillValue = () => {
    catSelect.value = state.recipeStep?.Type ?? "";
    if (state.recipeStep.Type == "shape") {
      state.content.replaceWith(shapeContent);
      state.content = shapeContent;
      const value = state.recipeStep.Ingredient ?? "";
      state.value = value;
      state.key = "shape";
      try {
        const optionsEl = element.querySelector(`.shape-option.${value}`);
        optionsEl.querySelector("input").checked = true;
      } catch (error) {
        shapeContent
          .querySelectorAll('input[type="radio"]')
          .forEach((input) => {
            input.checked = false;
          });
        element.querySelector(`.message`).innerHTML = `${value} not found`;
      }
    } else {
      if (state.recipeStep.Type == "packaging") {
        state.content.replaceWith(packageContent);
        state.content = packageContent;
      } else {
        state.percent = state.recipeStep.StepQuantity * 100;
        state.content.percentInput.querySelector("input").value = state.percent;
      }
      const rs = findStepByLabel(state.recipeStep.Ingredient, state.steps);
      if (rs) {
        const { key, step } = rs;
        state.key = key;
        state.step = step;
        state.recipeStep.Type = key;
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
        state.content.prodSelect.value = newValue;
      } else {
        element.querySelector(`.message`).innerHTML =
          `${state.recipeStep.Ingredient ?? ""} not found`;
        return;
      }
    }
  };
  element.clear = () => {
    state.costPerGram = 0;
    state.weight = 0;
    state.cost = 0;
    costContent.pricePerGramInput.querySelector("input").value = "";
    costContent.pricePerGramInput.querySelector(".tooltip-text").innerHTML = "";
    costContent.weightInput.querySelector("input").value = "";
    costContent.priceInput.querySelector("input").value = "";
    packageContent.priceInput.querySelector("input").value = "";
  };
  element.getPercent = () => {
    return isNaN(state.percent) ? 0 : state.percent;
  };
  element.setPercent = (percent) => (state.percent = percent);
  element.setSteps = (steps) => {
    rerenderStep(steps);
  };
  element.getCost = () => state.cost;
  element.get = () => state.value;
  element.getKey = () => state.key;
  element.getIngredient = () => state.ingredient;
  element.getFormat = () => state.product.category;
  element.getRecipeStep = () => state.recipeStep;
  element.getState = () => state;
  //init
  if (!deepCompare(recipeStep, structuredClone(defaultRecipeStep))) {
    fillValue();
  }
  return element;
}

function createCategorySelectElement({ dynamicSteps, steps }) {
  const e = document.createElement("select");
  e.className = "form-select bg-light align-self-center";
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
function createProductSelectElement() {
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

function createCostStepElement({
  state,
  update,
  updateImage,
  handleSelect,
  handlePercentChange,
  stepEl,
}) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "contents";
  const prodSelectEl = document.createElement("div");
  prodSelectEl.classList = "col col-md-5 px-2";
  const prodSelect = createProductSelectElement();
  prodSelectEl.append(prodSelect);

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
    className: "col col-md-1 px-2",
  });
  const weightInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" readonly />`,
    className: "col col-md-1 px-2",
  });
  const priceInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" readonly />`,
    className: "col col-md-1 px-2",
  });
  const imageEl = Object.assign(document.createElement("div"), {
    innerHTML: `<img class="img-thumbnail">`,
    className: "col col-md-1 px-2",
  });
  wrapper.append(
    prodSelectEl,
    pricePerGramInput,
    percentInput,
    weightInput,
    priceInput,
    imageEl,
  );

  //event
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
  percentInput.querySelector("input").addEventListener("change", (e) => {
    state.percent = parseFloat(e.target.value);
    state.recipeStep.StepQuantity = (state.percent / 100).toFixed(2);
    handlePercentChange({ stepEl: stepEl });
  });

  //public
  wrapper.prodSelect = prodSelect;
  wrapper.weightInput = weightInput;
  wrapper.percentInput = percentInput;
  wrapper.imageEl = imageEl;
  wrapper.pricePerGramInput = pricePerGramInput;
  wrapper.priceInput = priceInput;
  return wrapper;
}

function createShapeStepElement({ state, handleShapeChange }) {
  const element = document.createElement("div");
  element.classList = "col-md-10 d-flex gap-3 options overflow-auto";

  // event

  element.addEventListener("change", (e) => {
    state.value = e.target.value;
    state.recipeStep.Ingredient = state.value;
    handleShapeChange(e.target.value);
  });
  // public
  element.render = (step, reload = false) => {
    const name = crypto.randomUUID();
    element.innerHTML = /* HTML */ `${step.options
      .map((option) => {
        return /* HTML */ `<label
          class="shape-option m-0 cursor-pointer ${option.value}"
        >
          <input
            type="radio"
            name="shape-${name}"
            value="${option.value}"
            class="d-none no-update"
          />
          <div
            class="card text-center px-2 py-2 d-flex justify-content-between h-100"
          >
            <div class="shape-option__icon">
              <img
                src="./icons/shape/${option.label}.webp${reload
                  ? `?t=${name}`
                  : ""}"
                alt="${option.value}"
              />
            </div>
            <div class="shape-option__label mt-1">${option.label}</div>
          </div>
        </label>`;
      })
      .join("")}`;
  };
  // init
  element.render(state.steps.shape);
  return element;
}

function createPackageStepElement({
  state,
  update,
  updateImage,
  handleSelect,
}) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "contents";
  const prodSelectEl = document.createElement("div");
  prodSelectEl.classList = "col col-md-5 px-2";
  const prodSelect = createProductSelectElement();
  prodSelectEl.append(prodSelect);

  const pricePerGramInput = Object.assign(document.createElement("div"), {
    className: "col col-md-1 tooltip-wrap",
  });
  const percentInput = Object.assign(document.createElement("div"), {
    className: "col col-md-1 px-2",
  });
  const weightInput = Object.assign(document.createElement("div"), {
    className: "col col-md-1 px-2",
  });
  const priceInput = Object.assign(document.createElement("div"), {
    innerHTML: `<input type="text" class="form-control bg-light" readonly />`,
    className: "col col-md-1 px-2",
  });
  const imageEl = Object.assign(document.createElement("div"), {
    innerHTML: `<img class="img-thumbnail">`,
    className: "col col-md-1 px-2",
  });
  wrapper.append(
    prodSelectEl,
    pricePerGramInput,
    percentInput,
    weightInput,
    priceInput,
    imageEl,
  );

  //event
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

  //public
  wrapper.prodSelect = prodSelect;
  wrapper.weightInput = weightInput;
  wrapper.percentInput = percentInput;
  wrapper.imageEl = imageEl;
  wrapper.pricePerGramInput = pricePerGramInput;
  wrapper.priceInput = priceInput;
  return wrapper;
}
