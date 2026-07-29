import { registry } from "@/service/Registry";
import { matchSizeUnit } from "./Utils";
const state = {
  size: "4",
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
      </div>
    </div>
    <template id="message"></template>
  `;
  //element
  const sizeEl = createSizeElement();
  const messageEl = createMessageElement();
  const unitEl = createUnitElement();
  element.querySelector("#size").replaceWith(sizeEl);
  element.querySelector("#message").replaceWith(messageEl);
  element.querySelector("#unit").replaceWith(unitEl);
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
  };
  //expose
  element.setSize = (size) => {
    const match = matchSizeUnit(size);
    if (match) {
      state.size = match[1] ?? 4;
      // state.unit = match[2] ?? 'Oz';
    } else {
      state.size = size;
    }
    const converter = registry.get("converter");
    let togr = Math.round(
      converter.convertStockValue(state.size, state.unit, "gr"),
    );
    handleWeightChange(isNaN(togr) ? 0 : togr);
    update();
  };
  element.get = () => {
    return `${state.size ?? 4}${state.unit?.toLowerCase() ?? "oz"}`;
  };
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

function createMessageElement() {
  const element = document.createElement("div");
  element.className = "text-danger";
  return element;
}
