import { uploadImage } from "./request";
import { isExistInConfig } from "./variation/Utils";
const loadingEl = createLoadingEl();
const elementIds = new WeakMap();
let counter = 0;

function getElementId(el) {
  if (!elementIds.has(el)) {
    elementIds.set(el, ++counter);
  }
  return elementIds.get(el);
}

export class JsonConfigEditor {
  /**
   * @param {string|HTMLElement} target  - CSS selector or DOM element to mount into
   * @param {object}             config  - Initial config object
   */
  constructor({
    target,
    config,
    handleSave,
    handleShowSetting,
    recipeList,
    source,
    dynamicSteps,
  }) {
    this._root =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this._root)
      throw new Error(`JsonConfigEditor: target "${target}" not found`);
    this.intialData = config;
    this._state = JSON.parse(JSON.stringify(config));
    this.isShow = false;
    this._root.style.display = "none";
    this.handleSave = handleSave;
    this.handleShowSetting = handleShowSetting;
    this.recipeList = recipeList;
    this.source = source;
    this.dynamicSteps = dynamicSteps;
    this.config = config;
    this.pendingChange = {};
    this.pendingDelete = [];
    this._render();
  }
  toggle() {
    if (this.isShow) {
      this.isShow = false;
      this._root.style.display = "none";
    } else {
      this.isShow = true;
      this._root.style.display = "block";
    }
    return this.isShow;
  }
  // ─── Public API ────────────────────────────────────────────────────────────

  /** Returns a deep copy of the current config. */
  getConfig() {
    return JSON.parse(JSON.stringify(this._state));
  }
  setConfig(data) {
    this.intialData = data;
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  _render() {
    this._root.append(this._createElement());
    let oldIndex, newIndex;
    $(this._root)
      .find(".options")
      .sortable({
        handle: ".bi-arrows-move",
        tolerance: "pointer",
        start: (event, ui) => {
          oldIndex = ui.item.index();
        },
        update: (event, ui) => {
          newIndex = ui.item.index();
          this.handleMoveOption({
            oldIndex,
            newIndex,
            optionEl: ui.item.get(0),
          });
        },
      });
  }

  _createElement() {
    const div = document.createElement("div");
    div.className =
      "json-config-editor vh-100 d-flex flex-column overflow-hidden";
    div.innerHTML = /* HTML */ ` <div
        class="d-flex align-items-center justify-content-between mb-3"
      >
        <span class="fw-medium cursor-pointer back">
          <i class="bi bi-chevron-left"></i>Back
        </span>
        <div class="d-flex gap-2">
          <span class="message"></span>
          <button class="btn btn-sm btn-danger" data-action="refresh">
            <i class="bi bi-x-lg me-1"></i>Discard change
          </button>
          <button class="btn btn-sm btn-primary" data-action="save">
            <i class="bi bi-download me-1"></i>Save JSON
          </button>
        </div>
      </div>

      <div class="steps flex-1 overflow-auto" data-region="steps"></div>

      <div
        data-region="toast"
        class="alert alert-success py-2 px-3 small d-none d-flex align-items-center gap-2 mt-2 mb-0"
      >
        <i class="bi bi-check-circle"></i> Saved
      </div>`;
    //event
    div
      .querySelector('[data-action="refresh"]')
      .addEventListener("click", (e) => {
        this.handleRefresh();
      });
    div.querySelector(".back").addEventListener("click", (e) => {
      this.handleShowSetting();
    });
    div.querySelector('[data-action="save"]').addEventListener("click", (e) => {
      const btn = e.currentTarget;
      div.querySelector(".message").innerHTML = /* HTML */ `
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      `;
      // btn.disabled = true;
      this.handleSave(this._state, this.pendingChange, this.pendingDelete).then(
        (rs) => {
          btn.disabled = false;
          if (rs.success) {
            div.querySelector(".message").innerHTML = "saved";
            this.pendingChange = {};
            this.pendingDelete = [];
          } else {
            div.querySelector(".message").innerHTML = rs.error;
          }
        },
      );
    });
    div
      .querySelector(".steps")
      .append(
        ...Object.entries(this._state.steps).map(([key, step]) =>
          this.createCardElement({ key, step }),
        ),
      );
    div.querySelector(".steps").append(
      this.createPackageElement({
        key: "packages",
        packages: this._state.packages,
      }),
    );
    return div;
  }

  createCardElement({ key, step }) {
    const div = document.createElement("div");
    let isOpen = true;
    div.className = "card mb-2";
    div.innerHTML = /* HTML */ ` <div
        class="card-header d-flex align-items-center gap-2 py-2 px-3"
        style="cursor:pointer"
        data-action="toggle-card"
      >
        <i
          class="bi bi-chevron-down text-secondary"
          style="font-size:12px;transition:transform .15s;"
        ></i>
        <code
          class="badge bg-light text-secondary border fw-normal"
          style="font-size:11px"
          >${key}</code
        >
        <input
          class="form-control form-control-sm border-0 bg-transparent fw-medium ps-1"
          style="box-shadow:none"
          data-action="edit-label"
          value="${this._esc(step.label)}"
          placeholder="Step label"
        />
      </div>

      <div class="card-body py-2 px-3" style="display: block">
        <div class="row gx-2 mb-1">
          <div class="col-auto" style="width: 24px"></div>
          <div class="col-4">
            <span class="text-muted" style="font-size:11px">value</span>
          </div>
          <div class="col">
            <span class="text-muted" style="font-size:11px">label</span>
          </div>
        </div>

        <div class="options"></div>

        <button class="btn btn-primary" data-action="add-option">
          <i class="bi bi-plus me-1"></i>Add option
        </button>
      </div>`;
    div
      .querySelector(".options")
      .append(
        ...step.options.map((opt) =>
          this.createOptionElement({ group: "steps", key, opt }),
        ),
      );
    div
      .querySelector('[data-action="add-option"]')
      .addEventListener("click", (e) => {
        this.handleAddOption({ group: "steps", key, card: div });
      });
    div
      .querySelector('[data-action="toggle-card"]')
      .addEventListener("click", (e) => {
        if (e.target.tagName == "INPUT") return;
        div.toggle({ target: e.currentTarget });
      });
    div
      .querySelector('[data-action="edit-label"]')
      .addEventListener("change", (e) => {
        this.handleLabelChange({ key, target: e.currentTarget });
      });
    div.refresh = () => {
      step = this._state.steps[key];
      div.querySelector(".options").innerHTML = "";
      div.querySelector('[data-action="edit-label"]').value = step.label;
      div
        .querySelector(".options")
        .append(
          ...step.options.map((opt) =>
            this.createOptionElement({ group: "steps", key, opt }),
          ),
        );
    };
    div.toggle = ({ target }) => {
      if (isOpen) {
        isOpen = false;
        target.querySelector(".bi-chevron-down").style.transform =
          "rotate(-90deg)";
        div.querySelector(".card-body").style.display = "none";
      } else {
        isOpen = true;
        target.querySelector(".bi-chevron-down").style.transform = "rotate(0)";
        div.querySelector(".card-body").style.display = "block";
      }
    };
    div.getObject = () => this._state.steps[key];
    return div;
  }
  createPackageElement({ key, packages }) {
    const div = document.createElement("div");
    let isOpen = true;
    div.className = "card mb-2";
    div.innerHTML = /* HTML */ ` <div
        class="card-header d-flex align-items-center gap-2 py-2 px-3"
        style="cursor:pointer"
        data-action="toggle-card"
      >
        <i
          class="bi bi-chevron-down text-secondary"
          style="font-size:12px;transition:transform .15s;"
        ></i>
        <code
          class="badge bg-light text-secondary border fw-normal"
          style="font-size:11px"
          >${key}</code
        >
      </div>

      <div class="card-body py-2 px-3" style="display: block">
        <div class="row gx-2 mb-1">
          <div class="col-auto" style="width: 24px"></div>
          <div class="col-4">
            <span class="text-muted" style="font-size:11px">value</span>
          </div>
          <div class="col">
            <span class="text-muted" style="font-size:11px">label</span>
          </div>
        </div>

        <div class="options"></div>

        <button class="btn btn-primary" data-action="add-option">
          <i class="bi bi-plus me-1"></i>Add option
        </button>
      </div>`;
    div
      .querySelector(".options")
      .append(
        ...packages.options.map((opt) =>
          this.createOptionElement({ group: "packages", key, opt }),
        ),
      );
    // package event
    div
      .querySelector('[data-action="add-option"]')
      .addEventListener("click", (e) => {
        this.handleAddOption({ group: "packages", key, card: div });
      });
    div
      .querySelector('[data-action="toggle-card"]')
      .addEventListener("click", (e) => {
        if (e.target.tagName == "INPUT") return;
        div.toggle({ target: e.currentTarget });
      });
    div.refresh = () => {
      const packages = this._state.packages;
      div.querySelector(".options").innerHTML = "";
      div
        .querySelector(".options")
        .append(
          ...packages.options.map((opt) =>
            this.createOptionElement({ group: "packages", key, opt }),
          ),
        );
    };
    div.toggle = ({ target }) => {
      if (isOpen) {
        isOpen = false;
        target.querySelector(".bi-chevron-down").style.transform =
          "rotate(-90deg)";
        div.querySelector(".card-body").style.display = "none";
      } else {
        isOpen = true;
        target.querySelector(".bi-chevron-down").style.transform = "rotate(0)";
        div.querySelector(".card-body").style.display = "block";
      }
    };
    div.getObject = () => this._state.packages;
    return div;
  }

  createOptionElement({ group, key, opt }) {
    const div = document.createElement("div");
    div.className = "row gx-2 mb-1 align-items-center";
    div.innerHTML = /* HTML */ ` <div class="col-auto">
        <span
          class="btn-sm btn-link text-secondary p-0 cursor-pointer"
          data-action="move-option"
          aria-label="Remove"
        >
          <i class="bi bi-arrows-move"></i>
        </span>
      </div>
      <div class="col-4">
        <input
          class="form-control form-control-sm"
          data-action="edit-option"
          data-field="value"
          value="${this._esc(opt.value)}"
          placeholder="Value"
        />
      </div>
      <div class="col-4">
        <input
          class="form-control form-control-sm"
          data-action="edit-option"
          data-field="label"
          value="${this._esc(opt.label)}"
          placeholder="Label"
        />
      </div>
      <template id="image"></template>
      <div class="col-auto">
        <span
          class="btn-sm btn-link text-secondary p-0 cursor-pointer"
          data-action="delete-option"
          aria-label="Remove"
        >
          <i class="bi bi-x-lg" style="font-size:13px"></i>
        </span>
      </div>`;
    const imageEl = createImageElement({ key, option: opt });
    div.querySelector("#image").replaceWith(imageEl);
    //option event
    div
      .querySelector('[data-action="delete-option"]')
      .addEventListener("click", (e) => {
        this.handleRemoveOption({ group, key, optionEl: div });
      });
    div.querySelectorAll('[data-action="edit-option"]').forEach((input) =>
      input.addEventListener("change", (e) => {
        this.handleEditOption({ group, key, optionEl: div, inputEl: e.target });
      }),
    );
    div
      .querySelectorAll('[data-action="edit-option"][data-field="value"]')
      .forEach((input) =>
        input.addEventListener("input", (e) => {
          if (isExistInConfig(e.target.value, this._state)) {
            e.target.classList.add("is-invalid");
          } else {
            e.target.classList.remove("is-invalid");
          }
        }),
      );
    imageEl.querySelector("input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      const name = div.querySelector('[data-field="label"]').value;
      this.handleEditOption({ group, optionEl: div, inputEl: e.target });
      imageEl.append(loadingEl);
      const res = await uploadImage(key, name, file);
      loadingEl.remove();
      if (res.success) {
        imageEl.querySelector(".preview").src = URL.createObjectURL(file);
      } else {
        alert(res.error);
      }
    });
    let source;
    if (["step1", "step2"].includes(key)) {
      source = this.recipeList;
    } else if (this.dynamicSteps.includes(key)) {
      source = this.source[this.config.steps[key].source] ?? [];
    } else if (key == "packages") {
      source = this.source[this.config.packages.source] ?? [];
    } else {
      source = [];
    }
    $(div)
      .find('[data-field="label"]')
      .autocomplete({
        source,
        select: (event, ui) => {
          const target = event.target;
          const value = ui.item.value;
          const val = value.replace(" ", "").slice(0, 4);
          if (isExistInConfig(val, this._state)) {
            target
              .closest(".row")
              .querySelector('[data-action="edit-option"]')
              .classList.add("is-invalid");
          }
          target
            .closest(".row")
            .querySelector('[data-action="edit-option"]').value = val;
          target
            .closest(".row")
            .querySelector('[data-action="edit-option"]')
            .dispatchEvent(new Event("change"));
        },
      });
    div.getOption = () => opt;
    div.getKey = () => key;
    return div;
  }
  handleRefresh() {
    this._state = JSON.parse(JSON.stringify(this.intialData));
    this.pendingChange = {};
    this.pendingDelete = [];
    this._root.querySelectorAll(".card").forEach((e) => e.refresh());
  }
  handleLabelChange({ key, target }) {
    this._state.steps[key].label = target.value;
  }
  handleImageChange({ key }) {
    this._state.steps[key].image = true;
  }
  handleRemoveOption({ key, optionEl }) {
    let opt = optionEl.getOption();
    this.pendingDelete.push({
      key: key,
      label: opt.label,
    });
    let cardEl = optionEl.closest(".card");
    console.log(cardEl, cardEl.getObject());
    const obj = cardEl.getObject();
    let idx = obj.options.indexOf(opt);
    obj.options.splice(idx, 1);
    optionEl.remove();
  }
  handleAddOption({ group, key, card }) {
    let opt = { value: "", label: "" };
    card.getObject().options.push(opt);
    card
      .querySelector(".options")
      .append(this.createOptionElement({ group, key, opt }));
  }
  handleEditOption({ key, optionEl, inputEl }) {
    let opt = optionEl.getOption();
    let field = inputEl.dataset.field;
    switch (field) {
      case "image":
        opt[field] = true;
        break;
      case "label": {
        const oldLabel = opt.label;
        const newLabel = inputEl.value;
        if (newLabel != oldLabel) {
          if (!this.pendingChange[getElementId(optionEl)]) {
            this.pendingChange[getElementId(optionEl)] = {
              key: key,
              oldLabel: oldLabel,
              newLabel: newLabel,
            };
          } else {
            this.pendingChange[getElementId(optionEl)] = {
              ...this.pendingChange[getElementId(optionEl)],
              newLabel: newLabel,
            };
          }
        }
        opt.label = newLabel;
        break;
      }
      default:
        opt[field] = inputEl.value;
    }
  }
  handleMoveOption({ oldIndex, newIndex, optionEl }) {
    let key = optionEl.getKey();
    let [temp] = this._state.steps[key].options.splice(oldIndex, 1);
    this._state.steps[key].options.splice(newIndex, 0, temp);
  }

  _esc(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

function createImageElement({ key, option }) {
  const div = document.createElement("div");
  div.classList = "col-2";
  div.innerHTML = /* HTML */ ` <label class="cursor-pointer"
      ><span class="btn btn-default">image</span>
      <input
        class="d-none"
        data-action="edit-image"
        data-field="image"
        type="file"
      />
    </label>
    <img
      class="preview"
      ${option.image
        ? `src=${encodeURI(`./icons/${key}/${option.label}.webp`)}`
        : ""}
    />`;
  return div;
}

function createLoadingEl() {
  const div = document.createElement("div");
  div.classList = "spinner-border";
  div.innerHTML = /* HTML */ ` <span class="sr-only"></span>`;
  return div;
}
