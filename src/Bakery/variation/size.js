import { registry } from "@/service/Registry";
const state = {
  size: "",
  unit: "Oz",
  quantity: '',
  time: '',
};
export function createSizeStepElement({
  handleSizeChange,
  handleWeightChange,
  handleTimeChange,
  handleQuantityChange,
}) {
  const element = document.createElement("div");
  element.className = `align-items-center mb-3 step step-weight`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col col-md-8 d-flex gap-1 px-1">
        <div class="d-flex flex-column col-md-2">
          <label class="col-auto col-form-label fw-bold"
            >Size (<template id="unit"></template>)</label
          >
          <template id="size"></template>
        </div>
        <div class="d-flex flex-column col-md-2">
          <label class="col-auto col-form-label fw-bold">Quantity</label>
          <template id="quantity"></template>
        </div>
        <div class="d-flex flex-column col-md-2">
          <label class="col-auto col-form-label fw-bold">Time</label>
          <template id="time"></template>
        </div>
        <div class="d-flex flex-column flex-fill">
          <label class="col-auto col-form-label fw-bold">SKU</label>
          <template id="sku"></template>
        </div>
      </div>
      <div class="col col-md-1 px-1">
        <label
          class="col-auto col-form-label fw-bold text-nowrap text-truncate w-100"
          >Percent (%)</label
        >
        <template id="percent"></template>
      </div>
      <div class="col col-md-1 px-1">
        <label
          class="col-auto col-form-label fw-bold text-nowrap text-truncate w-100"
          >Weight (gr)</label
        >
        <template id="weight"></template>
      </div>
      <div class="col col-md-1 px-1">
        <label
          class="col-auto col-form-label fw-bold text-nowrap text-truncate w-100"
          >Total ($)</label
        >
        <template id="cost"></template>
      </div>

      <template id="message"></template>
    </div>
  `;
  //element
  const sizeEl = createSizeElement();
  const messageEl = createMessageElement();
  const unitEl = createUnitElement();
  const percentEl = createPercentElement();
  const weightEl = createWeightElement();
  const costEl = createCostElement();
  const skuEl = createSkuElement();
  const qtyInput = Object.assign(document.createElement("input"), {
    type: "text",
    className: "form-control bg-light w-100",
  });
  const timeInput = Object.assign(document.createElement("input"), {
    type: "text",
    className: "form-control bg-light w-100",
  });
  element.querySelector("#size").replaceWith(sizeEl);
  element.querySelector("#message").replaceWith(messageEl);
  element.querySelector("#unit").replaceWith(unitEl);
  element.querySelector("#percent").replaceWith(percentEl);
  element.querySelector("#weight").replaceWith(weightEl);
  element.querySelector("#cost").replaceWith(costEl);
  element.querySelector("#sku").replaceWith(skuEl);
  element.querySelector("#quantity").replaceWith(qtyInput);
  element.querySelector("#time").replaceWith(timeInput);
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
  qtyInput.addEventListener("change", (e) => {
    state.quantity = e.target.value;
    handleQuantityChange(state);
  })
  timeInput.addEventListener("change", (e) => {
    state.time = e.target.value;
    handleTimeChange(state);
  })
  // method
  const update = () => {
    sizeEl.value = state.size;
    unitEl.innerHTML = state.unit;
    qtyInput.value = state.quantity;
    timeInput.value = state.time;
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
  element.setQuantity = ({ Purchase }) => {
    state.quantity = Purchase ?? '';
    update();
  };
  element.setTime = ({ TaskPoint }) => {
    state.time = TaskPoint ? TaskPoint * 60 : '';
    update();
  };
  element.get = () => {
    return `${state.size ?? ""}${state.unit?.toLowerCase() ?? "oz"}`;
  };
  element.updatePercent = (percent) => {
    if (percent > 100) {
      percentEl.classList.add("bg-danger-subtle");
    } else {
      percentEl.classList.remove("bg-danger-subtle");
    }
    percentEl.value = percent;
  };
  element.updateWeight = (weight) => {
    weightEl.value = weight;
  };
  element.updateCost = (cost) => {
    costEl.value = cost;
  };
  element.getQuantity = () => state.quantity;
  element.getTime = () => state.time;
  element.skuEl = skuEl;
  return element;
}

function createSizeElement() {
  const element = document.createElement("div");
  element.innerHTML = /* HTML */ `<input
    type="text"
    class="form-control bg-light w-100"
    style="width: 100px"
  />`;
  return element.firstChild;
}
function createSkuElement() {
  const element = document.createElement("div");
  element.innerHTML = /* HTML */ `<input
    type="text"
    class="form-control bg-light w-100"
  />`;
  return element.firstChild;
}
function createUnitElement() {
  const element = document.createElement("span");
  return element;
}
function createPercentElement() {
  const element = Object.assign(document.createElement("input"), {
    className: "form-control bg-light w-100",
  });
  return element;
}
function createWeightElement() {
  const element = Object.assign(document.createElement("input"), {
    className: "form-control bg-light w-100",
  });
  return element;
}
function createCostElement() {
  const element = Object.assign(document.createElement("input"), {
    className: "form-control bg-light w-100",
  });
  return element;
}

function createMessageElement() {
  const element = document.createElement("div");
  element.className = "text-danger";
  return element;
}
