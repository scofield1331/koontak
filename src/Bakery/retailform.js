let timer;
export class RetailForm {
  constructor(inventoryItem = null, options = null) {
    if (options) {
      Object.keys(options).forEach((key) => {
        this[key] = options[key];
      });
    }
    this.inventoryItem = inventoryItem;
    this.element = $("#retail-form");
    this.element.html(createElement());
    this.leftTable = this.element.find(".left .variations");
    this.rightTable = this.element.find(".right .variations");
    this.rows = {};
    this.cal = new Calculation(this.setting);
    this.default = false;
    this.initEvent();
  }
  updateTotalCost(totalCost) {
    Object.values(this.rows).forEach((row) => {
      row.updateCost();
      row.updateTooltip();
      row.updatePercent();
      row.updateRetailPrice();
      row.updateShopPrice();
      row.updateRetailer();
      row.updateProfit();
    });
  }
  initEvent() {
    this.element.on("click", "button.dubAttribute", (e) =>
      this.dubAttribute(e),
    );
    this.element.on("click", "button.delAttribute", (e) =>
      this.delAttribute(e),
    );
    this.element.on("click", "button.show-edit", (e) => this.showEdit(e));

    this.element.find("[name=priceChange]").val(0);
    this.element.on(
      "change",
      "[data-name=StockLocation], [data-name=StockRetailShop], [data-name=RetailSize], [data-name=RetailUnit],[data-name=Attribute], [data-name=FeePacking], [data-name=Markup], [data-name=UnitPrice], [data-name=ShipWeight], [data-name=FeeShipping]",
      () => {
        this.element.find("[name=priceChange]").val(1);
      },
    );
  }
  showEdit(e) {
    if ($(e.currentTarget).data("show")) {
      $(e.currentTarget).data("show", false);
      this.element.find(".adjust-form").hide();
    } else {
      $(e.currentTarget).data("show", true);
      this.element.find(".adjust-form").show();
    }
  }
  getStockLocation(val) {
    let output = val.replace(/[\W\s\._\-]+/g, "");
    if (output.length >= 2) {
      output = `${output[0]}-${output[1]}${output[2] ? output[2] : ""}`;
    }
    return output.toUpperCase();
  }
  getVariation(index) {
    return this.rows[index];
  }
  getFirstVariation() {
    const skus = Object.keys(this.rows);
    if (skus.length) return this.rows[skus[0]];
    return false;
  }
  setProduct(inventoryItem) {
    this.inventoryItem = inventoryItem;
    this.supplier = this.cal.pickSupplier(this.inventoryItem);
    if (!this.supplier) {
      this.element.find(".message").html("supplier not found");
    } else {
      this.element.find(".message").html("");
    }
  }
  load() {
    this.leftTable.empty();
    this.rightTable.empty();
    this.rows = {};
    let sequence = ["Custom", "Shop", "Recipe", "Bulk"];
    let skus = Object.keys(this.inventoryItem.Retail).sort((a, b) => {
      let retaila = this.inventoryItem.Retail[a];
      let retailb = this.inventoryItem.Retail[b];
      let ia = sequence.findIndex((s) => s == retaila.StockLocation);
      let ib = sequence.findIndex((s) => s == retailb.StockLocation);
      if (ia == ib) {
        return retaila.RetailSize < retailb.RetailSize ? -1 : 1;
      } else return ia < ib ? -1 : 1;
    });
    skus.forEach((sku) => {
      if (sku.toLowerCase() == "bulk" || sku.toLowerCase() == "recipe") {
        return;
      }
      let row = new Variation(
        this.inventoryItem.Retail[sku],
        sku,
        this.inventoryItem,
        this,
      );
      this.leftTable.append(row.getRowLeft());
      this.rightTable.append(row.getRowRight());
      row.update();
      this.rows[sku] = row;
    });
  }
  reIndex() {
    this.suppliersContainer.find(".supplier-row").each(function (i) {
      $(this)
        .find("select, input")
        .each(function (index) {
          var n = $(this).attr("data-name");
          $(this).attr("name", `SuppliersPricing[${i}][${n}]`);
          $(this).closest(".supplier-row").attr("data-id", i);
        });
    });
  }
  clear() {
    this.rows = {};
    this.inventoryItem = null;
    this.leftTable.empty();
    this.rightTable.empty();
  }
  getTotalCost() {
    console.log(this.supplier);
    return this.supplier?.Cost ?? 0;
  }
}

class Variation {
  retailPrice = 0;
  profit = 0;
  constructor(variation, index, product, form) {
    this.retailForm = form;
    this.index = index;
    this.product = product;
    this.variation = variation;
    this.tempVariation = Object.assign({}, this.variation);
    this.template = "variation";
    this.element = $($("#" + this.template).html());
    this.rowLeft = $("#retail-left .variation").clone();
    this.rowRight = $("#retail-right .variation").clone();
    this.addIndex();
  }
  addIndex() {
    let form = this.element;
    let index = this.index;
    form.data("index", index);
    form.attr("index", index);
    form
      .find("input[data-name=StockRetail]")
      .attr("name", `Retail[${index}][StockRetail]`);
    form
      .find("input[data-name=StockRetailShop]")
      .attr("name", `Retail[${index}][StockRetailShop]`);
    form
      .find("input[data-name=StockLocation]")
      .attr("name", `Retail[${index}][StockLocation]`);
    form
      .find("input[data-name=StockShelve]")
      .attr("name", `Retail[${index}][StockShelve]`);
    form
      .find("input[data-name=RetailSize]")
      .attr("name", `Retail[${index}][RetailSize]`);
    form
      .find("input[data-name=RetailUnit]")
      .attr("name", `Retail[${index}][RetailUnit]`);
    form
      .find("[data-name=Attribute]")
      .attr("name", `Retail[${index}][Attribute]`);
    form
      .find("[data-name=UnitPrice]")
      .attr("name", `Retail[${index}][UnitPrice]`);
    form.find("[data-name=SKU]").attr("name", `Retail[${index}][SKU]`);
    form
      .find("[data-name=FeePacking]")
      .attr("name", `Retail[${index}][FeePacking]`);
    form
      .find("[data-name=FeeShipping]")
      .attr("name", `Retail[${index}][FeeShipping]`);
    form
      .find("input[data-name=ShipWeight]")
      .attr("name", `Retail[${index}][ShipWeight]`);
    form
      .find("input[data-name=Markup]")
      .attr("name", `Retail[${index}][Markup]`);
    form.find("input.variationImage").attr("name", `Retail[${index}][Image]`);
    this.element.on("input", "[data-name=StockShelve]", (e) => {
      let val = $(e.currentTarget).val();
      $(e.currentTarget).val(this.retailForm.getStockLocation(val));
    });
    this.rowLeft.on("input", ".percent", (e) => this.onPercentInput(e));
    this.rowLeft.on("change", ".percent", (e) => this.onDataChange());
    this.rowRight.on("input", ".retail", (e) => this.onRetailPriceInput(e));
    this.rowRight.on("change", ".retail", (e) => this.onDataChange());
    // this.rowLeft.on("input", ".profit", (e) => this.onProfitInput(e));
    // this.rowLeft.on("change", ".profit", (e) => this.onDataChange());
    this.rowRight.on("input", ".shipweight", (e) => this.onShipweightInput(e));
    this.rowRight.on("change", ".shipweight", (e) => this.onDataChange(e));
  }
  onPercentInput(e) {
    let markup = $(e.target).val();
    this.variation.RetailMarkup = markup;
    this.variation.RetailUnitPrice = PERCENT_MARKUP;
    this.updateRetailPrice();
    this.updateShopPrice();
    this.updateRetailer();
    this.updateProfit();
  }
  onRetailPriceInput(e) {
    let retailPrice = $(e.target).val();
    this.retailPrice = isNaN(retailPrice) ? 0 : Number(retailPrice);
    this.variation.RetailMarkup = retailPrice;
    this.variation.RetailUnitPrice = FIX_PRICE;
    this.updatePercent();
    this.updateProfit();
    this.updateShopPrice();
    this.updateRetailer();
  }
  onProfitInput(e) {
    // let profit = $(e.target).val();
    // this.profit = isNaN(profit) ? 0 : Number(profit);
    // const cost = Number(this.retailForm.supplier.Cost);
    // this.retailPrice = this.profit + cost;
    // this.percent = ((this.retailPrice - cost) / this.retailPrice) * 100;
    // this.variation.RetailMarkup = this.retailPrice;
    // this.variation.RetailUnitPrice = FIX_PRICE;
    // this.rowRight.find(".retail").val(this.retailPrice.toFixed(2));
    // this.rowLeft.find(".percent").val(this.percent.toFixed(2));
    // this.updateShopPrice();
    // this.updateRetailer();
  }
  onShipweightInput(e) {
    let shipweight = $(e.target).val();
    this.shipweight = isNaN(shipweight) ? 0 : Number(shipweight);
    this.variation.ShipWeight = shipweight;
    this.updateShopPrice();
    this.updateRetailer();
  }
  saveJson() {
    let change = this.retailForm.page.updateLog.getChange(
      `Retail[${this.index}]`,
      this.variation,
    );
    if (change) {
      this.retailForm.element.find(".message").html(/* HTML */ `
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      `);
      this.retailForm.page.updateLog.update(change).then((rs) => {
        if (rs.success) {
          this.retailForm.element.find(".message").html("");
        } else {
          this.retailForm.element.find(".message").html(rs.error);
        }
      });
    }
    this.updateTooltip();
    this.retailForm.page.handleVariationChange();
  }
  onDataChange() {
    clearTimeout(timer);
    timer = setTimeout(this.saveJson.bind(this), 300);
  }
  updateTooltip() {
    const variation = this.variation;
    this.rowLeft
      .find(".percent")
      .closest(".tooltip-wrap")
      .find(".tooltip-text")
      .html(/* HTML */ `
        <div>RetailUnitPrice: ${variation.RetailUnitPrice}</div>
        <div>RetailMarkup: ${variation.RetailMarkup}</div>
        ${this.variation.RetailUnitPrice == PERCENT_MARKUP
          ? /* HTML */ ` <div>formula: percent = RetailMarkup</div> `
          : this.variation.RetailUnitPrice == FIX_PRICE
            ? /* HTML */ `
                <div>cost: ${this.retailForm.supplier.Cost}</div>
                formula: (RetailMarkup - cost)/RetailMarkup
              `
            : `undefined`}
      `);

    this.rowRight
      .find(".retail")
      .closest(".tooltip-wrap")
      .find(".tooltip-text")
      .html(/* HTML */ `
        <div>RetailUnitPrice: ${variation.RetailUnitPrice}</div>
        <div>RetailMarkup: ${variation.RetailMarkup}</div>
        <div>cost: ${this.retailForm.supplier?.Cost}</div>
        ${this.variation.RetailUnitPrice == PERCENT_MARKUP
          ? /* HTML */ `
              <div>formula: retail = cost / (1 - RetailMarkup / 100)</div>
            `
          : this.variation.RetailUnitPrice == FIX_PRICE
            ? /* HTML */ ` formula: retail = RetailMarkup `
            : `undefined`}
      `);
  }
  updatePercent() {
    let percent = this.getPercent();
    this.rowLeft.find(".percent").val(percent.toFixed(2));
  }
  updateRetailPrice() {
    let retail = this.getRetail();
    this.rowRight.find(".retail").val(retail.toFixed(2));
  }
  updateShopPrice() {
    let retail = this.variation;
    let product = this.product;
    let cal = this.retailForm.cal;
    let shopPrice = cal
      .calculateRetailUniversal(product, retail, "bodishop")
      .toFixed(2);
    this.rowRight.find(".shopprice").val(shopPrice);
  }
  updateRetailer() {
    let retail = this.variation;
    let product = this.product;
    let cal = this.retailForm.cal;
    let retailPrice = cal
      .calculateRetailUniversal(product, retail, "bodiretailer")
      .toFixed(2);
    this.rowRight.find(".retailer").val(retailPrice);
  }
  updateProfit() {
    const bodiprofit = this.getBodiProfit();
    const retailprofit = this.getRetailProfit();
    this.rowLeft.find(".bodi-profit").html(bodiprofit.toFixed(2));
    this.rowLeft.find(".retail-profit").html(retailprofit.toFixed(2));
  }
  updateCost() {
    this.rowLeft.find(".total-cost").html(this.retailForm.supplier?.Cost ?? 0);
  }

  getRowLeft() {
    return this.rowLeft;
  }
  getRowRight() {
    return this.rowRight;
  }
  getBodiProfit() {
    let retail = this.variation;
    let product = this.product;
    let cal = this.retailForm.cal;
    let retailBodi = cal.calculateRetailBodiNutritions(product, retail);
    let cost = cal.calculateCost(product, retail);
    let FeePacking = retail.FeePacking;
    let FeePackingAuto = cal.getFeePacking(product.category, retail);
    if (
      FeePacking < 0 ||
      FeePacking === "" ||
      FeePacking == undefined ||
      isNaN(FeePacking)
    ) {
      FeePacking = FeePackingAuto;
    }
    let bodiprofit = retailBodi - cost - FeePacking;
    return bodiprofit;
  }
  getRetailProfit() {
    let retail = this.variation;
    let product = this.product;
    let cal = this.retailForm.cal;
    let retailBodi = cal.calculateRetailBodiNutritions(product, retail);
    let shop = "bodishop";
    let markuppromo = cal.calculateMarkupUniversal(
      "promo",
      shop,
      product,
      retail,
    );
    let markupexpense = cal.calculateMarkupUniversal(
      "expense",
      shop,
      product,
      retail,
    );
    let markupprofit = cal.calculateMarkupUniversal(
      "profit",
      shop,
      product,
      retail,
    );
    let markupworker = cal.calculateMarkupUniversal(
      "worker",
      shop,
      product,
      retail,
    );
    let retailprofit;
    if (retail.RetailUnitPrice == FIX_PRICE) {
      retailprofit = retail.RetailMarkup - retailBodi;
    } else {
      retailprofit = markupworker + markupexpense + markuppromo + markupprofit;
    }
    return retailprofit;
  }
  update() {
    let retail = this.variation;
    const bodiprofit = this.getBodiProfit();
    const retailprofit = this.getRetailProfit();

    this.rowLeft.attr("index", this.index);
    this.rowLeft.find(".total-cost").html(this.retailForm.supplier?.Cost ?? 0);
    this.rowLeft.find(".bodi-profit").html(bodiprofit.toFixed(2));
    this.rowLeft.find(".retail-profit").html(retailprofit.toFixed(2));
    this.rowRight.attr("index", this.index);
    this.rowRight.find(".shipweight").val(retail.ShipWeight);
    this.updateTooltip();
    this.updatePercent();
    this.updateRetailPrice();
    this.updateShopPrice();
    this.updateRetailer();
    this.updateProfit();
  }

  getPercent() {
    let variation = this.variation;
    const supplier = this.retailForm.supplier;
    let percent = 0;
    if (variation.RetailUnitPrice == PERCENT_MARKUP) {
      percent = isNaN(variation.RetailMarkup)
        ? 0
        : Number(variation.RetailMarkup);
    } else if (variation.RetailUnitPrice == FIX_PRICE) {
      if (!supplier.Cost) return 0;
      let retailPrice = variation.RetailMarkup;
      percent = ((retailPrice - supplier.Cost) / retailPrice) * 100;
    }
    this.percent = percent;
    return percent;
  }
  getRetail() {
    let variation = this.variation;
    let supplier = this.retailForm.supplier;
    let retail = 0;
    if (variation.RetailUnitPrice == PERCENT_MARKUP) {
      let markup = isNaN(variation.RetailMarkup)
        ? 0
        : Number(variation.RetailMarkup);
      if (!supplier.Cost) return 0;
      if (markup == 100) markup = 0;
      retail = supplier.Cost / (1 - markup / 100);
    } else if (variation.RetailUnitPrice == FIX_PRICE) {
      retail = isNaN(variation.RetailMarkup)
        ? 0
        : Number(variation.RetailMarkup);
    }
    this.retailPrice = retail;
    return retail;
  }
}
function createElement() {
  return /* HTML */ `
    <div class="col-md-12">
      <div class="w-100 d-flex tables">
        <table class="table ammount-list left border-end-0 mb-1">
          <thead>
            <th>cost</th>
            <th>bodi profit</th>
            <th>retail profit</th>
            <th>Percent</th>
          </thead>
          <tbody class="variations"></tbody>
        </table>
        <table class="table ammount-list right border-start-0 mb-1">
          <thead>
            <th>Retail</th>
            <th>Shop price</th>
            <th>shipweight</th>
            <th>Online price</th>
          </thead>
          <tbody class="variations"></tbody>
        </table>
      </div>
    </div>
    <div class="d-none">
      <table id="retail-left" class="d-none">
        <tr class="variation">
          <td class="align-middle">
            <div class="d-flex align-items-center">
              <span class="text-value total-cost"></span>
            </div>
          </td>
          <td class="align-middle">
            <div class="d-flex align-items-center">
              <span class="text-value bodi-profit"></span>
            </div>
          </td>
          <td class="align-middle">
            <div class="d-flex align-items-center">
              <span class="text-value retail-profit"></span>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1">
              <div class="tooltip-wrap">
                <input
                  type="number"
                  class="percent form-control d-inline no-update"
                />
                <span class="tooltip-text"></span>
              </div>
              %
            </div>
          </td>
        </tr>
      </table>
      <table id="retail-right" class="d-none">
        <tr class="variation">
          <td>
            <div class="d-flex align-items-center gap-1">
              <div class="tooltip-wrap">
                <input
                  type="number"
                  class="retail form-control d-inline no-update"
                />
                <span class="tooltip-text"></span>
              </div>
              $
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1">
              <input
                type="number"
                class="shopprice form-control d-inline no-update"
              />
              $
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1">
              <input
                type="number"
                class="shipweight form-control d-inline no-update"
              />
              oz
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1">
              <input class="retailer form-control d-inline no-update" /> $
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="text-danger message"></div>
  `;
}
