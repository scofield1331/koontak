const state = {
  shape: "ball",
};
export function createShapeStepElement({ step, handleShapeChange }) {
  const element = document.createElement("div");
  element.className = `align-items-center mb-3 step step-weight`;
  element.innerHTML = /* HTML */ `
    <div class="row input">
      <div class="col col-md-1">
        <label
          class="col-auto col-form-label text-secondary fw-medium"
          style="min-width:64px"
          >Shape</label
        >
      </div>
      <div class="col col-md-6 d-flex gap-2">
        <div class="d-flex gap-3 options">
          ${step.options
            .map((option) => {
              return /* HTML */ `<label
                class="shape-option m-0 cursor-pointer ${option.value}"
              >
                <input
                  type="radio"
                  name="shape"
                  value="${option.value}"
                  class="d-none no-update"
                />
                <div class="card text-center px-2 py-2">
                  <div class="shape-option__icon">
                    <img src="${option.image}" alt="${option.image}" />
                  </div>
                  <div class="shape-option__label mt-1">${option.label}</div>
                </div>
              </label>`;
            })
            .join("")}
        </div>
      </div>
      <template id="message"></template>
    </div>
  `;
  //element
  const messageEl = createMessageElement();
  element.querySelector("#message").replaceWith(messageEl);
  // event
  element.querySelector(".options").addEventListener("change", (e) => {
    messageEl.innerHTML = '';
    if (e.target.name === "shape") {
      state.shape = e.target.value;
      handleShapeChange(e.target.value);
    }
  });
  // method
  //expose
  element.setValue = (value) => {
    messageEl.innerHTML = '';
    try {
      const optionsEl = element.querySelector(`.shape-option.${value}`);
      optionsEl.querySelector("input").checked = true;
    } catch (error) {
      document.querySelectorAll('input[name="shape"]').forEach((input) => {
        input.checked = false;
      });
      messageEl.innerHTML = `${value} not found`;
    }
  };
  element.get = () => state.shape;
  return element;
}

function createMessageElement() {
  const element = document.createElement("div");
  element.className = "text-danger";
  return element;
}
