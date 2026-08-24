import { createPromoTagWrapper } from "@/Bodi/Shop/Label/PromoTagWrapper";
import { createStickerElement } from "./sticker";
import { Variation } from "@/Object/Variation";
import { createStepElement } from "./step";
import { createSizeStepElement } from "./size";
import { registry } from "@/service/Registry";
import { defaultRecipeStep, isSkuExist, findSupplier } from "./Utils";

// reducer
const stateReducer = (state, action) => {
  if (action.type == "changeStep") {
    state = { ...state, [action.key]: action.payload };
  } else if (action.type == "updatePercent") {
    state = { ...state, totalPercent: action.payload };
  } else if (action.type == "updateWeight") {
    state = { ...state, totalWeight: action.payload };
  } else if (action.type == "updateCost") {
    state = { ...state, totalCost: action.payload };
  } else if (action.type == "updateVariation") {
    state = { ...state, variation: action.payload };
  }
  return state;
};
export function createVariationElement({
  setting,
  steps,
  recipes,
  source,
  handleSaveVariation,
  handleSaveQuantity,
  handleSaveTime,
  handleCostChange,
  handleSizeChange,
  products,
}) {
  const staticSteps = [];
  const dynamicSteps = Object.keys(steps).filter(
    (key) => !staticSteps.includes(key),
  );
  const defaultState = {
    base: "0",
    fusion: "0",
    shape: "0",
    sku: "",
    totalPercent: 0,
    totalWeight: 0,
    totalCost: 0,
    variation: false,
    steps: [],
    recipe: false,
    stepEls: [],
    max: 5,
    product: false,
  };
  dynamicSteps.forEach((key) => (defaultState[key] = 0));
  let state = { ...defaultState, steps };
  //handle
  const handleStepRemove = (step) => {
    const index = state.stepEls.indexOf(step);
    if (index !== -1) {
      state.stepEls.splice(index, 1);
      step.remove();
    } else {
      alert("index not found, can't delete");
      return;
    }
    let totalPercent = [...state.stepEls].reduce((total, step) => {
      return total + step.getPercent();
    }, 0);
    state = stateReducer(state, {
      type: "updatePercent",
      payload: totalPercent,
    });
    buildOutput();
    updatePercent();
    calculateCost();
    updateCost();
    saveSkuChange({
      key: step.getKey(),
      value: step.get(),
    });
  };
  const handleVariationSizeChange = (props) => {
    handleSizeChange(props);
    buildOutput();
    calculateCost();
    updateCost();
    saveSkuChange({
      key: "size",
      value: props.size,
    });
  };
  const handleShapeChange = (shape) => {
    state = stateReducer(state, {
      type: "changeStep",
      payload: shape,
      key: "shape",
    });
    buildOutput();
    saveSkuChange({
      key: "shape",
      value: shape,
    });
  };
  const handleSelect = (e, key) => {
    const name = e.target.getAttribute("data-name");
    let messageEl = e.target.closest(".step").querySelector(".message");
    messageEl.innerHTML = "";
    state[name] = e.target.value;
    buildOutput();
    calculateCost();
    updateCost();
    saveSkuChange({
      key: key,
      value: e.target.value,
    });
  };
  const saveCostChange = async () => {
    let totalCost = state.totalCost;
    if (totalCost != state.supplier?.Cost) {
      element.querySelector(".actions .message").innerHTML = /* HTML */ `
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      `;
      const rs = await handleCostChange(state);
      if (!rs.success) {
        element.querySelector(".actions .message").innerHTML = rs.error;
      } else {
        element.querySelector(".actions .message").innerHTML = "";
      }
    }
  };
  const saveSkuChange = ({ key, value }) => {
    let newSku = sizeStepEl.skuEl.value;
    element.querySelector(".actions .message").innerHTML = /* HTML */ `
      <div class="spinner-border" role="status">
        <span class="sr-only"></span>
      </div>
    `;
    const data = { oldSku: state.sku, newSku, key, value, state };
    state.sku = newSku;
    handleSaveVariation(data).then((rs) => {
      if (rs.success) {
        element.querySelector(".actions .message").innerHTML = "";
        if (rs.variation) {
          sticker.updateVariation({
            sku: newSku,
            variation: rs.variation,
            Ingredients: rs.Ingredients,
          });
        }
        if (rs.Ingredients) {
          promoTagWrapper.updateIngredients();
        }
      } else {
        element.querySelector(".actions .message").innerHTML = rs.message;
      }
    });
  };
  const handlePercentChange = ({ stepEl }) => {
    calculateTotalPercent();
    stepEl.updateWeightByRatio({ totalWeight: state.totalWeight });
    stepEl.updateCost();
    updatePercent();
    calculateCost();
    updateCost();
    saveCostChange();
  };
  const handleWeightChange = (weight) => {
    state = stateReducer(state, {
      type: "updateWeight",
      payload: weight,
    });
    updateWeight();
  };
  const handleQuantityChange = ({ quantity, size }) => {
    showLoading();
    handleSaveQuantity({ quantity, size }).then((rs) => {
      if (rs.success) {
        hideLoading();
      } else {
        element.querySelector(".actions .message").innerHTML = rs.message;
      }
    });
  };
  const handleTimeChange = ({ time }) => {
    showLoading();
    handleSaveTime({ sku: state.sku, time }).then((rs) => {
      if (rs.success) {
        hideLoading();
      } else {
        element.querySelector(".actions .message").innerHTML = rs.message;
      }
    });
  };
  //method
  const showLoading = () => {
    element.querySelector(".actions .message").innerHTML = /* HTML */ `
      <div class="spinner-border" role="status">
        <span class="sr-only"></span>
      </div>
    `;
  };
  const hideLoading = () => {
    element.querySelector(".actions .message").innerHTML = "";
  };
  const calculateTotalPercent = () => {
    let totalPercent = Array.from(
      element.querySelectorAll(".step-cost"),
    ).reduce((total, step) => {
      return total + step.getPercent();
    }, 0);
    state = stateReducer(state, {
      type: "updatePercent",
      payload: totalPercent,
    });
  };
  const updateSteps = () => {
    element.querySelector(".steps").innerHTML = "";
    element.querySelector(".steps").append(...state.stepEls);
  };
  const calculateCost = () => {
    let totalCost = Array.from(element.querySelectorAll(".step-cost")).reduce(
      (total, step) => {
        return total + step.getCost();
      },
      0,
    );
    state = stateReducer(state, {
      type: "updateCost",
      payload: totalCost,
    });
  };
  const getState = () => state;
  const createWrapperElement = ({ steps }) => {
    const element = document.createElement("div");
    element.innerHTML = /* HTML */ `
      <div class="row mb-3">
        <div class="col-md-12">
          <div id="product-list" class="card update-trigger" data-replace="1">
            <div
              class="card-header"
              style="display: flex; justify-content: space-between;"
            >
              <span>
                <span>Product List</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid py-3 steps"></div>
      <div class="mb-2">
        <template id="add-item"></template>
      </div>
      <div class="container-fluid border border-1 border-dark">
        <template id="size-step"></template>
      </div>
      <div class="row align-items-center">
        <div class="col output">
          <span class="text-danger message"></span>
        </div>
      </div>
      <div class="mt-2 actions">
        <p class="text-danger message mt-2"></p>
      </div>
      <div class="card">
        <div class="card-header">
          <span>Label</span>
        </div>
      </div>
      <div class="row">
        <div class="mt-2 col-md-6 d-flex justify-content-center">
          <div class="col-auto">
            <div class="sticker"></div>
          </div>
        </div>
        <div class="mt-2 label col-md-6"></div>
      </div>
    `;
    return [element];
  };
  const updateCost = async () => {
    sizeStepEl.updateCost(state.totalCost.toFixed(2));
  };
  const updatePercent = () => {
    sizeStepEl.updatePercent(state.totalPercent);
  };
  const updateWeight = () => {
    sizeStepEl.updateWeight(state.totalWeight);
    Array.from(element.querySelectorAll(".step-cost")).forEach((step) => {
      step.updateWeightByRatio({ totalWeight: state.totalWeight });
      step.updateCost();
    });
  };
  //element
  const element = document.getElementById("create-variation");
  const [html] = createWrapperElement({ steps });
  element.append(html);
  const sizeStepEl = createSizeStepElement({
    handleSizeChange: handleVariationSizeChange,
    handleTimeChange: handleTimeChange,
    handleQuantityChange: handleQuantityChange,
    handleWeightChange,
  });
  const addItemBtn = createAddItemButton();
  element.querySelector("#size-step").replaceWith(sizeStepEl);
  element.querySelector("#add-item").replaceWith(addItemBtn);

  const promoTagWrapper = createPromoTagWrapper({ page: "Bakery" });
  promoTagWrapper.classList.add("cursor-pointer");
  const sticker = createStickerElement({ setting });
  element.querySelector(".label").appendChild(promoTagWrapper);
  element.querySelector(".sticker").appendChild(sticker);

  const messageEl = element.querySelector(".output .message");
  //event
  addItemBtn.addEventListener("click", (e) => {
    const newStep = createStepElement({
      steps,
      recipeStep: structuredClone(defaultRecipeStep),
      source,
      recipes,
      dynamicSteps,
      handleSelect,
      handlePercentChange,
      handleStepRemove,
      getState,
      handleShapeChange,
    });
    state.stepEls.push(newStep);
    element.querySelector(".steps").append(newStep);
  });
  promoTagWrapper.addEventListener("click", (e) => {
    promoTagWrapper.print();
  });
  //method
  const toSku = () => {
    const size = sizeStepEl.get();
    const steps = state.stepEls
      .map((e) => e.get())
      .filter((v) => v.trim() != "");
    let skus = ["Bake", size, ...steps].filter((v) => v != false && v !== "0");
    if (skus.length > state.max) {
      skus = skus.slice(0, state.max);
    }
    return skus.join(".");
  };
  const buildOutput = () => {
    sizeStepEl.skuEl.classList.remove("is-invalid");
    element.querySelector(".output .message").innerHTML = "";
    let output = toSku(state);
    sizeStepEl.skuEl.value = output;
    const splitOutput = output.split(".");
    if (splitOutput.length >= 5) {
      const rs = isSkuExist(output, state.product.Product, products);
      if (rs) {
        state.max = splitOutput.length + 1;
        sizeStepEl.skuEl.classList.add("is-invalid");
        element.querySelector(".output .message").innerHTML =
          `SKU ${output} exists in product ${rs.Product}`;
      } else {
        state.max = splitOutput.length;
        sizeStepEl.skuEl.classList.remove("is-invalid");
        element.querySelector(".output .message").innerHTML = "";
      }
    }
  };
  const createDynamicSteps = ({ recipeSteps }) => {
    const stepEls = recipeSteps.map((recipeStep) =>
      createStepElement({
        steps,
        recipeStep,
        source,
        recipes,
        dynamicSteps,
        handleSelect,
        handlePercentChange,
        handleStepRemove,
        getState,
        handleShapeChange,
      }),
    );
    return stepEls;
  };
  const clean = () => {
    state = { ...state, ...defaultState };
    element.querySelectorAll("select").forEach((e) => (e.value = ""));
    element
      .querySelectorAll('input:not([type="radio"])')
      .forEach((e) => (e.value = ""));
    element.querySelectorAll(".message").forEach((e) => (e.innerHTML = ""));
    element.querySelectorAll(".step-cost").forEach((e) => e.setPercent(0));
  };
  const validate = (sku) => {
    if (!/^Bake./.test(sku)) {
      return [false, ""];
    }
    return [true, ""];
  };
  const loadVariation = ({ sku, variation, supplier }) => {
    state.sku = sku;
    sizeStepEl.skuEl.value = sku;
    const [result, msg] = validate(sku);
    if (!result) {
      messageEl.innerHTML = msg;
      return;
    }
    const skulength = sku.split(".").length;
    state.max = skulength > state.max ? skulength : state.max;
    sizeStepEl.setSize(variation);
    sizeStepEl.setQuantity(supplier);
    sizeStepEl.setTime(variation);
    const [...steps] = state.recipe;
    state.stepEls = createDynamicSteps({ recipeSteps: steps });
    updateSteps();

    calculateTotalPercent();
    updatePercent();
    calculateCost();
    updateCost();
  };
  //expose
  element.set = (product) => {
    clean();
    state.product = product;
    const retail = product.Retail;
    const calculator = registry.get("calculator");
    state.supplier = calculator.pickSupplier(product);
    state.recipe = [...product.Recipe];
    promoTagWrapper.clear();
    promoTagWrapper.add(product);
    if (typeof retail !== "object") {
      alert("retail invalid");
      return;
    }
    const skus = Object.keys(retail).filter(
      (sku) => !["Bulk", "Recipe", "Delivery"].includes(sku),
    );
    let sku, variation;
    if (skus.length) {
      variation = retail[skus[0]];
      sku = skus[0];
    } else {
      variation = new Variation();
      sku = "Bake.";
      product.Retail[sku] = variation.get();
    }
    state = stateReducer(state, {
      type: "updateCost",
      payload: isNaN(variation.Markup) ? 0 : parseFloat(variation.Markup),
    });
    state = stateReducer(state, {
      type: "updateVariation",
      payload: variation,
    });
    sticker.set({ product, variation, sku });
    updatePercent();
    const supplier = findSupplier(product.Suppliers);
    loadVariation({ sku, variation, supplier });
  };
  element.setSteps = (steps) => {
    state.steps = steps;
    element.getSteps().forEach((step) => step.setSteps(steps));
  };
  element.buildOutput = buildOutput;
  element.clean = clean;
  element.clear = () => {
    element.clean();
    promoTagWrapper.clear();
    sticker.clear();
  };
  element.getDynamicSteps = () => dynamicSteps;
  element.updateLabel = () => {
    promoTagWrapper.updateVariation();
  };
  element.getSteps = () => [...(state.stepEls ?? [])];
  element.buildRecipe = () => {
    return element.getSteps().map((step, i) => {
      const recipeStep = { ...defaultRecipeStep, ...step.getRecipeStep() };
      recipeStep.Step = i + 1;
      return recipeStep;
    });
  };
  return element;
}

function createAddItemButton() {
  const btn = document.createElement("button");
  btn.className = "btn btn-default";
  btn.innerHTML = "Add item";
  return btn;
}
