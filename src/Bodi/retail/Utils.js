import { registry } from "@/Service/Registry.js";
export function getColor(status) {
  var colorCss = "";
  if (status == "Ordered") {
    colorCss = "blue-bg";
  } else if (
    status == "Missingmail" ||
    status == "Returning" ||
    status == "Pending"
  ) {
    colorCss = "red-bg";
  } else if (status == "Shipped") {
    colorCss = "green-bg";
  } else if (status == "Cart") {
    colorCss = "orange-bg";
  } else if (status == "Delivered") {
    colorCss = "gray-bg";
  } else if (status == "Event") {
    colorCss = "purple-bg";
  }
  return colorCss;
}

export function getTotalPrice(orders) {
  return orders.reduce((total, order) => {
    const price = parseFloat(order.Order?.OrderPaid);
    return total + (isNaN(price) ? 0 : price);
  }, 0);
}

function findProductAndVariation(sku, products) {
  for (let p = 0; p < products.length; p++) {
    const product = products[p];
    const skus = Object.keys(product.Retail);
    if (skus.includes(sku)) {
      return { product, variation: product.Retail[sku] };
    }
  }
  return { product: null, variation: null };
}
export function calculateProfit({
  order,
  products,
}) {
  const calculator = registry.get("calulator");
  const items = order.OrderItems;
  let totalProfit = 0;
  items.forEach((item) => {
    const OrderQuantity = parseFloat(item.OrderQuantity);
    const { product, variation } = findProductAndVariation(
      item.OrderProductSKU,
      products,
    );
    if (product === null) {
      alert(
        `Product with SKU ${item.OrderProductSKU} not found in products list.`,
      );
      return;
    }
    console.log(product);
    let retailBodi = calculator.calculateRetailBodiNutritions(product, variation);
    let markuppromo = calculator.calculateMarkupUniversal(
      "promo",
      'bodishop',
      product,
      variation,
    );
    let markupexpense = calculator.calculateMarkupUniversal(
      "expense",
      'bodishop',
      product,
      variation,
    );
    let markupprofit = calculator.calculateMarkupUniversal(
      "profit",
      'bodishop',
      product,
      variation,
    );
    let markupworker = calculator.calculateMarkupUniversal(
      "worker",
      'bodishop',
      product,
      variation,
    );
    let profit;
    if (variation.RetailUnitPrice == FIX_PRICE) {
      profit = variation.RetailMarkup - retailBodi;
    } else {
      profit = markupworker + markupexpense + markuppromo + markupprofit;
    }
    profit = Math.round(profit * 100) / 100;
    totalProfit += profit * OrderQuantity;
  });

  return totalProfit;
}
