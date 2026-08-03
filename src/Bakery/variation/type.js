import {
  findRecipe,
  deepCompare,
  isLabelExist,
  defaultRecipeStep,
} from "./Utils";

export function createTypeStepElement({
  step,
  key,
  handleSelect,
  recipes,
  handlePercentChange,
  getState,
}) {
  const element = document.createElement("div");
  let state = {
    step: step,
    value: "",
    recipeStep: structuredClone(defaultRecipeStep),
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
          >${state.step.label}</label
        >
      </div>
      <div class="col col-md-6">
        <select class="form-select bg-light" data-name="${key}">
          <option value="">— select —</option>
          ${state.step.options &&
          state.step.options
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
    handleSelect(e, key);
  });
  percentInput.querySelector("input").addEventListener("change", (e) => {
    state.percent = parseFloat(e.target.value);
    state.recipeStep.StepQuantity = (state.percent / 100).toFixed(2);
    handlePercentChange({ stepEl: element });
  });

  // method
  const rerenderStep = () => {
    element.querySelector("label").innerHTML = state.step.label;
    element.querySelector("select").innerHTML = /* HTML */ `<option value="0">
        — select —
      </option>
      ${state.step.options &&
      state.step.options
        .map(
          (option) =>
            `<option value="${option.value}">${option.label}</option>`,
        )
        .join()}`;
    if (state.value) {
      element.querySelector("select").value = state.value;
    }
  };
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
      element.updateWeightByRatio({ totalWeight: getState().totalWeight });
      element.updateCost();
    } else {
      element.clear();
    }
  };
  const update = ({ value, label }) => {
    let recipename = label;
    let recipe = findRecipe(recipename, recipes);
    state.value = value;
    if (recipe) {
      state.recipeStep.Ingredient = recipename;
      state.recipeStep.Format = recipe.RecipeFormat;
    } else {
      state.recipeStep.Ingredient = '';
      state.recipeStep.Format = '';
    }
    updateRecipe(recipe);
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
  element.fillValue = ({ recipeStep, handleFill }) => {
    state.recipeStep = recipeStep
      ? { ...state.recipeStep, ...recipeStep }
      : structuredClone(defaultRecipeStep);
    state.percent = state.recipeStep.StepQuantity * 100;
    percentInput.querySelector("input").value = state.percent;
    const label = state.recipeStep.Ingredient;
    const value = isLabelExist(label, state.step.options);
    let newValue;
    if (value) {
      newValue = value;
    } else {
      newValue = "";
      element.querySelector(`.message`).innerHTML = `${label ?? ""} not found`;
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
  element.setPercent = (percent) => (state.percent = 0);
  element.setSteps = (steps) => {
    if (!deepCompare(state.step, steps[key])) {
      state.step = steps[key];
      rerenderStep();
    }
  };
  element.getPercent = () => (isNaN(state.percent) ? 0 : state.percent);
  element.getCost = () => state.cost;
  element.getKey = () => key;
  element.get = () => state.value;
  element.getIngredient = () => state.recipeStep.Ingredient;
  element.getFormat = () => state.recipeStep.Format;
  element.getRecipeStep = () => state.recipeStep;
  return element;
}
