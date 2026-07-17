import { findProduct } from "../variation/Utils";

export function createnewProductModal({ products }) {
  const div = document.createElement("div");
  div.innerHTML = /* HTML */ ` <div
    class="modal fade"
    id="newProductModal"
    tabindex="-1"
    aria-labelledby="newProductModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="newProductModalLabel">
            New Product
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form id="newProductForm" class="row g-3">
            <div class="mb-3">
              <label for="newProductInput" class="form-label">Product</label>
              <input
                type="email"
                class="form-control"
                id="newProductInput"
                placeholder="Product"
                name="Product"
              />
              <span class="message text-danger"></span>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <div class="spinner-border loader" role="status" style="display: none">
            <span class="visually-hidden">Loading...</span>
          </div>
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button type="button" class="btn btn-primary add">Add</button>
        </div>
      </div>
    </div>
  </div>`;

  const element = div.firstElementChild;
  let i;
  const handleInput = (e = undefined) => {
    const target = e == undefined ? element.querySelector("input") : e.target;
    element.querySelector(".message").innerHTML = "";
    element.querySelector("input").classList.remove("bg-danger");
    clearTimeout(i);
    i = setTimeout(() => {
      if (findProduct(target.value, products)) {
        element.querySelector(".message").innerHTML =
          `${target.value} already exist, try another`;
      }
    }, 100);
  };
  element.querySelector("input").addEventListener("input", handleInput);
  element.querySelector("input").addEventListener("keyup", handleInput);
  element.handleInput = handleInput;
  return element;
}
