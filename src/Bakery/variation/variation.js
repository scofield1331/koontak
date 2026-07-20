import { createPromoTagWrapper } from "@/Bodi/Shop/Label/PromoTagWrapper";
import { createStickerElement } from "./sticker";
import { Variation } from "@/Object/Variation";
import { createStepElement, createStep3Element } from "./step";

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
  };
  dynamicSteps.forEach((key) => (defaultState[key] = 0));
  let state = { ...defaultState, steps };
  //handle
  const handleSelect = (e) => {
    const name = e.target.getAttribute("data-name");
    let messageEl = e.target.closest(".step").querySelector(".message");
    messageEl.innerHTML = "";
    state[name] = e.target.value;
    buildOutput();
    calculateCost();
    updateCost();
    saveSkuChange({
      key: name,
      value: e.target.value,
    });
  };
  const saveCostChange = async () => {
    if (state.totalCost != state.variation?.Markup) {
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
  const handleWeightChange = (weight) => {
    state = stateReducer(state, {
      type: "updateWeight",
      payload: weight,
    });
    updateWeight();
  };
  //method
  const getState = () => state;
  const createSteps = ({ steps }) => {
    return Object.keys(steps).map((key) => {
      let props = {
        step: steps[key],
        key,
        recipes,
        source: source[steps[key].source] ?? [],
        dynamicSteps,
        handleSelect,
        handlePercentChange,
        handleWeightChange,
        getState,
      };
      return key == "step3"
        ? createStep3Element(props)
        : createStepElement(props);
    });
  };
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
      <div class="container-fluid py-3 steps"></div>

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
    element.querySelector(".steps").append(...createSteps({ steps }));
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

  const element = document.getElementById("create-variation");
  const [html] = createWrapperElement({ steps });
  element.append(html);
  const promoTagWrapper = createPromoTagWrapper({ page: "Bakery" });
  promoTagWrapper.classList.add("cursor-pointer");
  const sticker = createStickerElement({ setting });
  element.querySelector(".label").appendChild(promoTagWrapper);
  element.querySelector(".sticker").appendChild(sticker);

  const messageEl = element.querySelector(".output .message");
  //event
  promoTagWrapper.addEventListener("click", (e) => {
    promoTagWrapper.print();
  });
  //method
  const toSku = (skuObj) => {
    const arr = staticSteps
      .map((key) => (skuObj[key] !== undefined ? skuObj[key] : 0))
      .concat(
        dynamicSteps.map((key) =>
          skuObj[key] !== undefined ? skuObj[key] : 0,
        ),
      );
    return `Bake.${arr.join(".")}`.replace(/(\.0)*$/, "");
  };
  const buildOutput = () => {
    let output = toSku(state);
    element.querySelector(".output input").value = output;
  };
  const fillValues = (steps, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      element
        .querySelector(`.step.${key}`)
        .fillValue({ key, value, handleFill });
    }
    calculateCost();
    updateCost();
  };
  const clean = () => {
    state = { ...state, ...defaultState };
    element.querySelectorAll("select").forEach((e) => (e.value = "0"));
    element.querySelectorAll("input").forEach((e) => (e.value = ""));
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
    let key = ["cat", ...staticSteps, ...dynamicSteps];
    const splitedSku = sku.split(".");
    const skuObj = Object.fromEntries(
      key.map((key, i) => [key, splitedSku[i] ?? "0"]),
    );
    delete skuObj.cat;
    fillValues(state.steps, skuObj);
  };
  element.set = (product) => {
    clean();
    const retail = product.Retail;
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
      sku = "Bake.0.0.0.0.0.0";
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
    let stepEls = createSteps({ steps });
    element.querySelector(".steps").innerHTML = "";
    element.querySelector(".steps").append(...stepEls);

    let key = [...staticSteps, ...dynamicSteps];
    const skuObj = Object.fromEntries(
      key.map((key, i) => [key, state[key] ?? 0]),
    );
    fillValues(state.steps, skuObj);
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
  return element;
}
