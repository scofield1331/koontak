import { findProduct, findOptionByLabel } from "./Utils";
import { registry } from "@/service/Registry";
const state = {
  packages: [],
  value: '',
};
export function createPackageElement({
  packages,
  source,
  handlePackageChange,
}) {
  state.packages = packages;
  const element = document.createElement("div");
  element.className = `align-items-center mb-3`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col-12 col-md-1 align-self-start">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >Package</label
        >
      </div>
      <div class="col col-md-6 d-flex gap-2 align-self-start">
        <select class="form-select bg-light">
          <option value="">— select —</option>
          ${state.packages.options &&
          state.packages.options
            .map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`,
            )
            .join()}
        </select>
        <template id="value"></template>
      </div>
      <img class="preview img-thumbnail img-sm" />
    </div>
    <template id="message"></template>
  `;
  //element
  const valueEl = createValueElement();
  const messageEl = createMessageElement();
  element.querySelector("#value").replaceWith(valueEl);
  element.querySelector("#message").replaceWith(messageEl);
  // event
  element.querySelector("select").addEventListener("change", (e) => {
    const cal = registry.get("calculator");
    const packageName = e.target.options[e.target.selectedIndex].text;
    const product = findProduct(packageName, source.Packaging ?? []);
    const skus = Object.keys(product.Retail);
    let cost = 0;
    if (skus.length) {
      product.category = 'Packaging';
      cost = cal.calculateCost(product, product.Retail[skus[0]]);
    }
    state.value = e.target.value;
    state.cost = cost;
    updateCost();
    const opt = findOptionByLabel(packageName, packages.options);
    if (opt?.image) {
      element.querySelector(".preview").src = encodeURI(
        `./icons/packages/${opt.label}.webp`,
      );
    }
    handlePackageChange(state.cost);
  });
  // method
  const updateCost = () => {
    valueEl.value = state.cost;
  };
  const renderPackages = () => {
    element.querySelector("select").innerHTML = /* HTML */ `<option value="0">
        — select —
      </option>
      ${state.packages.options &&
      state.packages.options
        .map(
          (option) =>
            `<option value="${option.value}">${option.label}</option>`,
        )
        .join()}`;
    if (state.value) {
      element.querySelector("select").value = state.value;
    }
  };
  //expose
  element.setPackages = (packages) => {
    state.packages = packages;
    renderPackages();
  };
  return element;
}

function createValueElement() {
  const element = document.createElement("div");
  element.innerHTML = /* HTML */ `<input
    type="text"
    class="form-control bg-light"
    style="width: 60px"
  />`;
  return element.firstChild;
}

function createMessageElement() {
  const element = document.createElement("div");
  element.className = "text-danger";
  return element;
}
