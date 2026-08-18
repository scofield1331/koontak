import { UpdateLog } from "./updatelog";
import { RetailForm } from "./retailform";
import { Images } from "./images";
import { createVariationElement } from "./variation/variation";
import { createLeftElement } from "./left/left";
import { BakeryProduct } from "../Object/BakeryProduct";
import { Recipe } from "../Object/Recipe";
import { createRightElement } from "./right/right";
import { createnewProductModal } from "./left/modal";
import { JsonConfigEditor } from "./setting";
import { registry } from "@/service/Registry";
import { renameKeyKeepPositionAndRef } from "@/service/Object";
import "./css/sticker.css";
import "./css/page.css";
import "./css/create-variation.css";

export class Page {
  activeRow = null;
  product = null;
  getProduct() {
    return this.product;
  }
  load() {
    this.left = createLeftElement({
      loadProduct: this.loadProduct.bind(this),
      hideProductList: this.hideProductList.bind(this),
      showProductList: this.showProductList.bind(this),
      handleShowSetting: this.handleShowSetting.bind(this),
      handleNewProductClick: this.handleNewProductClick.bind(this),
    });
    this.right = createRightElement({
      handleDeleteProduct: this.handleDeleteProduct.bind(this),
    });
    const wrapper = document.createElement("div");
    wrapper.id = "ListingData";
    wrapper.className = "row";
    wrapper.appendChild(this.left);
    wrapper.appendChild(this.right);
    const pageEl = document.getElementById("page");
    pageEl.append(wrapper);

    this.convert = new convertStockValueGlobal();
    this.loadInventory();
  }
  loadInventory() {
    let loadUrl = "./dispatcher.php?action=load";
    $.ajax({
      method: "GET",
      dataType: "json",
      url: loadUrl,
    }).done((response) => {
      this.setting = response.setting;
      registry.register(
        "calculator",
        new Calculation(this.setting, response.suppliers),
      );
      registry.register("converter", this.convert);
      this.bakerySetting = response.config;
      this.steps = response.config.steps;
      this.recipeList = response.recipeList;
      this.sourceLabel = response.sourceLabel;
      this.cal = new Calculation(response.setting);
      this.data = response.products.map(
        (product) =>
          new BakeryProduct({ ...product, category: "Bakery_Goodies" }),
      );
      this.source = {};
      for (const category in response.source) {
        const element = response.source[category];
        this.source[category] = response.source[category].map(
          (product) => new BakeryProduct({ ...product, category: category }),
        );
      }
      this.recipes = response.recipes.map((recipe) => new Recipe(recipe));
      this.updateLog = new UpdateLog({
        page: this,
      });
      this.initGui();
      this.retailForm = new RetailForm(null, {
        setting: this.setting,
        convert: this.convert,
        page: this,
      });
      this.images = new Images("images", { page: this });
    });
  }
  insertProduct(product) {
    let product_name =
      product.Product.length > 30
        ? product.Product.slice(0, 30) + "..."
        : product.Product;
    let td = $($("#product-row").html());
    td.find(".product-item-i").data("product", product.Product);
    td.find(".product-item-i").html(product_name);
    td.data("item", product);
    td.find("#eachProduct").data("itemData", product);
    if (
      !product.StoreListingASIN ||
      !Array.isArray(product.StoreListingASIN.bodi4life) ||
      product.StoreListingASIN.bodi4life[0] != "Active"
    )
      td.find("#eachProduct").addClass("strike");
    this.$elementForm.find("#ProductList tbody ").append(td);
    return td;
  }
  hideProductList() {
    $("#ProductList").addClass("d-none");
    $(".rightBlock").removeClass("d-none");
  }
  showProductList() {
    $("#ProductList").removeClass("d-none");
    $(".rightBlock").addClass("d-none");
  }
  setNewProductEvent() {
    $("#newProductModal").on("click", ".add", (e) => {
      $(this.newProductModal).find(".loader").show();
      const product = $("#newProductInput").val().trim();
      if (!product) {
        alert("product name empty");
        return;
      }
      const formData = $("#newProductForm").serialize();
      $.ajax({
        method: "POST",
        dataType: "json",
        url: "./dispatcher.php?action=addProduct",
        data: formData,
      }).done((response) => {
        $(this.newProductModal).find(".loader").hide();
        if (response.success) {
          const product = new BakeryProduct({
            ...response.product,
            category: "Bakery_Goodies",
          });
          this.data.unshift(product);
          this.left.insert({ product });
          const modalInstance = bootstrap.Modal.getInstance(
            this.newProductModal,
          );
          modalInstance.hide();
        } else {
          this.newProductModal
            .querySelector("input")
            .classList.add("bg-danger");
          this.newProductModal.querySelector(".message").innerHTML =
            response.message;
        }
      });
    });
  }
  //////////////////
  initGui() {
    this.newProductModal = createnewProductModal({ products: this.data });
    document.body.appendChild(this.newProductModal);
    var self = this;
    var $elementForm = $($("#listing-form-template").html());
    this.$elementForm = $elementForm;
    $("#inventory").append($elementForm);
    var prods = this.data.sort(function (a, b) {
      return a.Product.toLowerCase().localeCompare(b.Product.toLowerCase());
    });
    this.left.updateList({
      products: prods,
    });
    this.updateLog.init();

    $("#amazon_link").click(function (event) {
      event.preventDefault();
      var URL = $("#amazon_link").attr("data-hreflink");
      const d = new Date();
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
      var cDate = `${da} ${mo} ${ye}`;
      $("#amazon_UpdatedOn").val(cDate);
      var win = window.open(URL, "_blank");
      if (win) {
        //Browser has allowed it to be opened
        win.focus();
      } else {
        //Browser has blocked it
        alert("Please allow popups");
      }
    });
    $("#ebay_link").click(function (event) {
      event.preventDefault();
      var URL = $("#ebay_link").attr("data-hreflink");
      const d = new Date();
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
      var cDate = `${da} ${mo} ${ye}`;
      $("#ebay_UpdatedOn").val(cDate);

      var win = window.open(URL, "_blank");
      if (win) {
        //Browser has allowed it to be opened
        win.focus();
      } else {
        //Browser has blocked it
        alert("Please allow popups");
      }
    });
    $("#etsy_link").click(function (event) {
      event.preventDefault();
      var URL = $("#etsy_link").attr("data-hreflink");
      const d = new Date();
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
      var cDate = `${da} ${mo} ${ye}`;
      $("#etsy_UpdatedOn").val(cDate);

      var win = window.open(URL, "_blank");
      if (win) {
        //Browser has allowed it to be opened
        win.focus();
      } else {
        //Browser has blocked it
        alert("Please allow popups");
      }
    });
    this.setNewProductEvent();
    this.variationCreate = createVariationElement({
      handleSaveVariation: this.handleSaveVariation.bind(this),
      handleCostChange: this.handleCostChange.bind(this),
      steps: this.steps,
      recipes: this.recipes,
      source: this.source,
      setting: this.setting,
      handleSizeChange: this.handleSizeChange.bind(this),
      products: this.data,
      product: this.product,
    });
    this.config = new JsonConfigEditor({
      target: "#setting",
      config: this.bakerySetting,
      recipeList: this.recipeList,
      source: this.sourceLabel,
      dynamicSteps: this.variationCreate.getDynamicSteps(),
      handleSave: this.handleSaveConfig.bind(this),
      handleShowSetting: this.handleShowSetting.bind(this),
    });
  }
  async handleCostChange({ totalCost }) {
    const cost = Math.round((totalCost) * 100) / 100;
    const calculator = registry.get("calculator");
    const supplier = calculator.pickSupplier(this.product);
    if (!supplier) {
      alert("supplier not found");
      throw new Error("supplier not found");
    }
    supplier.Cost = cost;
    const updateData = {};
    if (this.product.SuppliersPricing.length) {
      updateData.SuppliersPricing = this.product.SuppliersPricing;
    } else {
      updateData.Suppliers = this.product.Suppliers;
    }
    const recipe = this.variationCreate.buildRecipe() ?? [];
    updateData.Recipe = recipe;
    this.product.Recipe = recipe;
    let rs = await this.updateLog.update(updateData, this.product, 0);
    if (rs.success) {
      this.retailForm.updateTotalCost(cost);
    } else {
      alert(rs.error);
    }
    return rs;
  }
  handleSaveVariation({ oldSku, newSku, key, value, state }) {
    let updateData = {};
    const calculator = registry.get("calculator");
    const supplier = calculator.pickSupplier(this.product);
    if (!supplier) {
      alert("supplier not found");
      throw new Error("supplier not found");
    }
    const isCostChanged = state.totalCost != supplier?.Cost;
    const cost = Math.round(state.totalCost * 100) / 100;
    if (this.product) {
      renameKeyKeepPositionAndRef(this.product.Retail, oldSku, newSku);
      if (key == "size") {
        this.product.Retail[newSku].RetailSize = value;
        this.product.Retail[newSku].RetailUnit = "oz";
        this.product.Retail[newSku].ShipWeight = value;
      }
      if (isCostChanged) {
        supplier.Cost = cost;
      }
      updateData.Retail = this.product.Retail;
      let keys = [...this.variationCreate.getDynamicSteps()];
      console.log(key, keys);
      if (keys.includes(key)) {
        const recipe = this.variationCreate.buildRecipe();
        this.product.Recipe = recipe;
        updateData.Recipe = this.product.Recipe;
        let ingredients = this.variationCreate
          .getSteps()
          .map((step) => step.getIngredient())
          .filter((v) => v && !["none", "0"].includes(v.toLowerCase()));
        updateData.Ingredients = ingredients.join(", ");
      }
      if (this.product.SuppliersPricing.length) {
        updateData.SuppliersPricing = this.product.SuppliersPricing;
      } else {
        updateData.Suppliers = this.product.Suppliers;
      }
      return new Promise((resolve) => {
        this.updateLog.update(updateData, this.product, 1).then((rs) => {
          if (rs.success) {
            this.retailForm.load();
            rs.variation = updateData.Retail[newSku];
            rs.sku = newSku;
            if (updateData.Ingredients !== undefined) {
              rs.Ingredients = updateData.Ingredients;
            }
            if (isCostChanged) {
              this.retailForm.updateTotalCost(cost);
            }
            this.handleVariationChange();
          } else {
            alert(rs.error);
          }
          resolve(rs);
        });
      });
    }
  }
  handleSizeChange({ size, unit }) {
    const calculator = registry.get("calculator");
    const supplier = calculator.pickSupplier(this.product);
    if (!supplier) {
      alert("supplier not found");
      throw new Error("supplier not found");
    }
    supplier.SupplierSize = size;
    supplier.SupplierUnit = unit;
  }
  handleVariationChange() {
    this.variationCreate.updateLabel();
  }
  async handleSaveConfig(config, pendingChange, penddingDelete) {
    const response = await fetch("./dispatcher.php?action=saveSetting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: config,
        change: pendingChange,
        delete: penddingDelete
      }),
    });
    const json = response.json();
    json.then((rs) => {
      if (rs.success) {
        this.bakerySetting = JSON.parse(JSON.stringify(config));
        this.steps = this.bakerySetting.steps;
        this.config.setConfig(this.steps);
        this.variationCreate.setSteps(this.steps);
      }
    });
    return json;
  }
  async handleDeleteProduct() {
    let result = false;
    if (this.product) {
      if (confirm(`delete ${this.product.Product}?`)) {
        const response = await fetch("./dispatcher.php?action=deleteProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product: this.product.Product }),
        });
        result = await response.json();
        if (result.success) {
          this.activeRow.remove();
          this.clearForm();
          const index = this.data.findIndex((p) => p === this.product);
          if (index !== -1) this.data.splice(index, 1);
          this.activeRow = undefined;
          this.product = undefined;
        } else {
          alert(result.error);
        }
      }
    } else {
      alert("no product selected");
    }
    return result;
  }
  handleShowSetting() {
    let isShow = this.config.toggle();
    this.right.toggle(!isShow);
  }
  handleNewProductClick() {
    this.newProductModal.handleInput();
  }
  //end initgui
  clearForm() {
    this.right.clear();
    this.retailForm.clear();
    this.variationCreate.clear();
    this.images.clear();
  }
  updateProduct(change, replace) {
    if (replace) {
      Object.assign(this.product, change);
    } else {
      deepMerge(this.product, change);
    }
  }
  loadProduct(product, element) {
    this.clearForm();
    this.activeRow = element;
    this.product = product;
    const response = product;
    this.right.update({
      product,
    });
    response.inventory = product.category;

    this.retailForm.setProduct(this.product);
    this.retailForm.load();
    $("tr.border-tr").removeClass("border-tr");
    $(this.activeRow).addClass("border-tr");
    this.images.set(product.Images);
    this.variationCreate.clean();
    this.variationCreate.set(product);
  }
}

function deepMerge(target, source) {
  for (const key in source) {
    if (Array.isArray(source[key])) {
      target[key] = target[key] ? [...target[key]] : [];
      source[key].forEach((val, i) => {
        if (val !== undefined) target[key][i] = val;
      });
    } else if (source[key] && typeof source[key] === "object") {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

function findLabel(steps, key, value) {
  if (steps[key]) {
    for (let index = 0; index < steps[key].options.length; index++) {
      if (steps[key].options[index].value == value) {
        return steps[key].options[index].label;
      }
    }
  }
  return false;
}
