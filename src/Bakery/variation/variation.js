import { createPromoTagWrapper } from "@/Bodi/Shop/Label/PromoTagWrapper";
import { createStickerElement } from "./sticker";
import { Variation } from "@/Object/Variation";
import { createStepElement } from "./step";
import { createSizeStepElement } from "./size";
import { registry } from "@/service/Registry";
import { createShapeStepElement } from "./shape";
import { createTypeStepElement } from "./type";

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
  handleCostChange,
  handleSizeChange,
}) {
  const staticSteps = ["step1", "step2", "step3"];
  const dynamicSteps = Object.keys(steps).filter(
    (key) => !staticSteps.includes(key),
  );
  const defaultState = {
    step1: "0",
    step2: "0",
    step3: "0",
    sku: "",
    totalPercent: 0,
    totalWeight: 0,
    totalCost: 0,
    variation: false,
    steps: [],
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
    let totalPercent = [typeStepEl, step2El, ...state.stepEls].reduce(
      (total, step) => {
        return total + step.getPercent();
      },
      0,
    );
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
  const handleVariaztionSizeChange = (props) => {
    handleSizeChange(props);
    buildOutput();
    saveSkuChange({
      key: "size",
      value: sizeStepEl.get(),
    });
  };
  const handleShapeChange = (shape) => {
    state = stateReducer(state, {
      type: "changeStep",
      payload: shape,
      key: "step3",
    });
    buildOutput();
    saveSkuChange({
      key: "step3",
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
    if (state.totalCost != state.supplier?.Cost) {
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
    let newSku = element.querySelector(".output input").value;
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
  const handleFill = ({ key, value }) => {
    state = stateReducer(state, { type: "changeStep", payload: value, key });
  };
  const handlePercentChange = ({ stepEl }) => {
    let totalPercent = Array.from(
      element.querySelectorAll(".step-cost"),
    ).reduce((total, step) => {
      return total + step.getPercent();
    }, 0);
    stepEl.updateWeightByRatio({ totalWeight: state.totalWeight });
    stepEl.updateCost();
    state = stateReducer(state, {
      type: "updatePercent",
      payload: totalPercent,
    });
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
  //method
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
      <div class="container-fluid">
        <template id="size-step"></template>
        <template id="shape-step"></template>
      </div>
      <div class="container-fluid">
        <div class="row">
          <div class="col col-md-1"></div>
          <div class="col col-md-6"></div>
          <div class="col col-md-1"></div>
          <div class="col col-md-1">
            Percent (<span class="percent">${state.totalPercent}</span>%)
          </div>
          <div class="col col-md-1">
            Weight (<span class="weight">${state.totalWeight}</span>gr)
          </div>
          <div class="col col-md-1">
            Total <span class="cost">${state.totalCost}</span>$
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <template id="type-step"></template>
        <template id="type2-step"></template>
      </div>
      <div class="container-fluid py-3 steps"></div>
      <template id="add-item"></template>
      <hr class="my-3" />

      <div class="row align-items-center">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >Output</label
        >
        <div class="col output">
          <input
            type="text"
            class="form-control bg-light"
            readonly=""
            placeholder="selections will appear here…"
          />
          <span class="text-danger message"></span>
        </div>
      </div>
      <div class="mt-2 actions">
        <p class="text-danger message mt-2"></p>
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
    let costEl = element.querySelector(".cost");
    costEl.innerHTML = state.totalCost.toFixed(2);
  };
  const updatePercent = () => {
    let percentEl = element.querySelector(".percent");
    if (state.totalPercent > 100) {
      alert("ratio exceed 100%");
      percentEl.classList.add("text-danger");
    } else {
      percentEl.classList.remove("text-danger");
    }
    percentEl.innerHTML = state.totalPercent;
  };
  const updateWeight = () => {
    let weightEl = element.querySelector(".weight");
    weightEl.innerHTML = state.totalWeight;
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
    handleSizeChange: handleVariaztionSizeChange,
    handleWeightChange,
  });
  const shapeStepEl = createShapeStepElement({
    step: steps.step3,
    handleShapeChange,
  });
  const typeStepEl = createTypeStepElement({
    step: steps.step1,
    key: "step1",
    recipes,
    handleSelect,
    handlePercentChange,
    getState,
  });
  const step2El = createTypeStepElement({
    step: steps.step2,
    key: "step2",
    recipes,
    handleSelect,
    handlePercentChange,
    getState,
  });
  const addItemBtn = createAddItemButton();
  element.querySelector("#size-step").replaceWith(sizeStepEl);
  element.querySelector("#shape-step").replaceWith(shapeStepEl);
  element.querySelector("#type-step").replaceWith(typeStepEl);
  element.querySelector("#type2-step").replaceWith(step2El);
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
      value: "",
      source,
      dynamicSteps,
      handleSelect,
      handlePercentChange,
      handleStepRemove,
      getState,
    });
    state.stepEls.push(newStep);
    element.querySelector(".steps").append(newStep);
  });
  promoTagWrapper.addEventListener("click", (e) => {
    promoTagWrapper.print();
  });
  //method
  const toSku = (skuObj) => {
    const size = sizeStepEl.get();
    const shape = shapeStepEl.get();
    const type = typeStepEl.get();
    const step2 = step2El.get();
    const steps = state.stepEls
      .map((e) => e.get())
      .filter((v) => v.trim() != "");
    return `Bake.${size}.${shape}.${type}.${step2}${steps.length ? `.${steps.join(".")}` : ""}`.replaceAll(
      ".0",
      "",
    );
  };
  const buildOutput = () => {
    let output = toSku(state);
    element.querySelector(".output input").value = output;
  };
  const createDynamicSteps = ({ values }) => {
    const stepEls = values.map((value) =>
      createStepElement({
        steps,
        value,
        source,
        dynamicSteps,
        handleSelect,
        handlePercentChange,
        handleStepRemove,
        getState,
      }),
    );
    return stepEls;
  };
  const clean = () => {
    state = { ...state, ...defaultState };
    element.querySelectorAll("select").forEach((e) => (e.value = "0"));
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
  const loadVariation = ({ sku, variation }) => {
    state.sku = sku;
    element.querySelector(".output input").value = sku;
    const [result, msg] = validate(sku);
    if (!result) {
      messageEl.innerHTML = msg;
      return;
    }
    const [cat, size, shape, type, step2, ...steps] = sku.split(".");
    sizeStepEl.setSize(size);
    shapeStepEl.setValue(shape);
    typeStepEl.fillValue({ value: type, handleFill });
    step2El.fillValue({ value: step2, handleFill });
    //state stepEls
    state.stepEls = createDynamicSteps({ values: steps });
    updateSteps();
  };
  element.set = (product) => {
    clean();
    const retail = product.Retail;
    const calculator = registry.get("calculator");
    state.supplier = calculator.pickSupplier(product);
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
    loadVariation({ sku, variation });
  };
  element.setSteps = (steps) => {
    state.steps = steps;
    shapeStepEl.setSteps(steps.step3 ?? []);
    element.getSteps().forEach(step => step.setSteps(steps));
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
  element.getSteps = () => [typeStepEl, step2El, ...state.stepEls??[]];
  return element;
}

function createAddItemButton() {
  const btn = document.createElement("button");
  btn.className = "btn btn-default";
  btn.innerHTML = "Add item";
  return btn;
}
