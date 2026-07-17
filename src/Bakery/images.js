import { Image } from "./image";
export class Images {
  updateTimeout = 0;
  path = 0;
  constructor(id, { page }) {
    this.page = page;
    this.element = $(`#${id}`);
    this.element.html(createElement());
    this.imageContainer = this.element.find(".product_image");
    this.images = [];
    this.init();
  }
  init() {
    this.element.find(".add").click((e) => this.addImage());

    this.imageContainer.sortable({
      handle: ".move",
      tolerance: "pointer",
      start: (event, ui) => {
        this.oldIndex = ui.item.index();
      },
      update: (event, ui) => {
        let oldIndex = ui.helper;
        this.newIndex = ui.item.index();
        this.refreshSequence();
        this.triggerChangeEvent();
      },
    });
  }
  clear() {
    this.imageContainer.empty();
    this.images = [];
  }
  set(images) {
    this.clear();
    if (Array.isArray(images)) {
      images.forEach((arr, index) => {
        if (arr.path > this.path) this.path = arr.path;
        let image = new Image(this, { image: arr, page: this.page });
        this.images.push(image);
        image.update();
        this.imageContainer.append(image.getElement());
      });
      this.resetPath();
    } else {
      console.log("Images invalid");
    }
  }
  get() {
    let data = this.images.map((image, i) => {
      return image.getData();
    });
    return data;
  }
  addImage() {
    let image = new Image(this, { page: this.page });
    this.path++;
    image.setPath(this.path);
    this.images.push(image);
    this.imageContainer.append(image.getElement());
  }
  triggerChangeEvent() {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      let data = this.get();
      this.element
        .find(".update-trigger")
        .trigger("custom-change", [{ name: "Images", value: data }]);
    }, 500);
  }
  delete(image) {
    this.images = this.images.filter((e) => e !== image);
    this.resetPath();
    // this.refreshSequence();
    this.triggerChangeEvent();
    this.ajaxDelete(image);
  }
  resetPath() {
    let paths = this.images.map((image) => image.getPath());
    this.path = paths.length ? Math.max(...paths) : 0;
  }
  ajaxDelete(image) {
    let product = this.page.getProduct();
    var reportFormItem;
    reportFormItem =
      "&ImageDelete=" + image.getPath() + "&Product=" + product.Product;
    $.ajax({
      method: "POST",
      dataType: "json",
      url: "./dispatcher.php?action=imageDelete",
      data: reportFormItem,
    }).done((response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  }
  upload(image, file) {
    // this.refreshSequence();
    this.triggerChangeEvent();
    return new Promise((resolve) => {
      try {
        let product = this.page.getProduct();
        if (product) {
          let imgForm = new FormData();
          imgForm.append("Product", product.Product);
          imgForm.append(image.getPath(), file);
          $.ajax({
            method: "POST",
            dataType: "json",
            url: "./dispatcher.php?action=saveImage",
            data: imgForm,
            async: true,
            cache: false,
            contentType: false,
            enctype: "multipart/form-data",
            processData: false,
          }).done((response) => {
            resolve(response);
          });
        } else {
          alert("No product selected");
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }
  setActivatedImage(image) {
    this.activatedImage = image;
  }
  refreshSequence() {
    if (this.oldIndex !== undefined && this.newIndex !== undefined) {
      this.images.splice(
        this.newIndex,
        0,
        this.images.splice(this.oldIndex, 1)[0],
      );
      this.oldIndex = undefined;
      this.newIndex = undefined;
    }
    this.images.forEach((image, i) => {
      image.setSequence(i);
    });
  }
}
function createElement() {
  return /* HTML */ ` <div
      class="update-trigger"
      data-replace="1"
      style="margin-top: 30px; margin-bottom: 30px;"
    >
      <div class="card">
        <div class="card-header">
          <span>LISTING IMAGES</span>
          <button class="add btn btn-default">add</button>
        </div>
        <div class="card-body row product_image"></div>
      </div>
    </div>
    <div class="d-none" id="image">
      <div class="image col-md-3">
        <div class="loading text-center" style="display: none">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="move">move</div>
        <img class="thumb-image" />
        <div class="options">
          <label class="active"> <input type="checkbox" /> Active </label>
          <button class="open-note btn btn-default">Note</button>
          <label class="ShowBrowse btn btn-default"
            >upload
            <input
              type="file"
              class="image image-input"
              accept="image/*"
              capture="environment"
              style="display:none;"
            />
          </label>
          <button class="delete btn btn-danger">del</button>
        </div>
        <div class="note p-1" style="display: none">
          <textarea class="w-100" placeholder="note"></textarea>
        </div>
      </div>
    </div>`;
}
