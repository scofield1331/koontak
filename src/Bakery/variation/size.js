import { registry } from "@/service/Registry";
import { matchSizeUnit } from "./Utils";
const state = {
  size: "",
  unit: "Oz",
};
export function createSizeStepElement({
  handleSizeChange,
  handleWeightChange,
}) {
  const element = document.createElement("div");
  element.className = `align-items-center mb-3 step step-weight`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col-12 col-md-1">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >Size</label
        >
      </div>
      <div class="col col-md-6 d-flex gap-2">
        <template id="size"></template>
        <template id="unit"></template>
        <div class="d-flex">
          <input
            type="text"
            class="form-control bg-light"
            style="width: 60px"
          />
          <label class="col-auto col-form-label fw-medium">Quantity</label>
        </div>
        <div class="d-flex">
          <input
            type="text"
            class="form-control bg-light"
            style="width: 60px"
          />
          <label class="col-auto col-form-label fw-medium">Time</label>
        </div>
      </div>
      <div class="col col-md-1"></div>
      <div class="col col-md-1">Percent (<template id="percent"></template>%)</div>
      <div class="col col-md-1">Weight (<template id="weight"></template>gr)</div>
      <div class="col col-md-1">Total <template id="cost"></template>$</div>
    </div>

    <template id="message"></template>
  `;
  //element
  const sizeEl = createSizeElement();
  const messageEl = createMessageElement();
  const unitEl = createUnitElement();
  const percentEl = createPercentElement();
  const weightEl = createWeightElement();
  const costEl = createCostElement();
  element.querySelector("#size").replaceWith(sizeEl);
  element.querySelector("#message").replaceWith(messageEl);
  element.querySelector("#unit").replaceWith(unitEl);
  element.querySelector("#percent").replaceWith(percentEl);
  element.querySelector("#weight").replaceWith(weightEl);
  element.querySelector("#cost").replaceWith(costEl);
  // event
  sizeEl.addEventListener("change", (e) => {
    state.size = e.target.value;
    const converter = registry.get("converter");
    let togr = Math.round(
      converter.convertStockValue(state.size, state.unit, "gr"),
    );
    handleWeightChange(isNaN(togr) ? 0 : togr);
    handleSizeChange(state);
  });
  // method
  const update = () => {
    sizeEl.value = state.size;
    unitEl.innerHTML = state.unit;
  };
  //public
  element.setSize = ({ RetailSize, RetailUnit }) => {
    state.size = RetailSize ?? 4;
    state.unit = RetailUnit ?? "oz";
    const converter = registry.get("converter");
    let togr = Math.round(
      converter.convertStockValue(state.size, state.unit, "gr"),
    );
    handleWeightChange(isNaN(togr) ? 0 : togr);
    update();
  };
  element.get = () => {
    return `${state.size ?? ""}${state.unit?.toLowerCase() ?? "oz"}`;
  };
  element.updatePercent = (percent) => {
    if (percent > 100) {
      alert("ratio exceed 100%");
      percentEl.classList.add("text-danger");
    } else {
      percentEl.classList.remove("text-danger");
    }
    percentEl.innerHTML = percent;
  }
  element.updateWeight = (weight) => {
    weightEl.innerHTML = weight;
  }
  element.updateCost = (cost) => {
    costEl.innerHTML = cost;
  }
  return element;
}

function createSizeElement() {
  const element = document.createElement("div");
  element.innerHTML = /* HTML */ `<input
    type="text"
    class="form-control bg-light"
    style="width: 60px"
  />`;
  return element.firstChild;
}
function createUnitElement() {
  const element = document.createElement("div");
  element.innerHTML = /* HTML */ `<label
    class="col-auto col-form-label fw-medium"
    >Oz</label
  >`;
  return element.firstChild;
}
function createPercentElement() {
  const element = document.createElement("span");
  return element
}
function createWeightElement() {
  const element = document.createElement("span");
  return element
}
function createCostElement() {
  const element = document.createElement("span");
  return element
}

function createMessageElement() {
  const element = document.createElement("div");
  element.className = "text-danger";
  return element;
}
