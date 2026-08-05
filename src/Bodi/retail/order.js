import { getColor } from "./utils.js";
export function createOrderElement({ order, onShowClick }) {
  const orderElement = document.createElement("div");
  orderElement.className = `order order-log ${getColor(order.Order.OrderStatus)}`;
  orderElement.innerHTML = /* HTML */ `
    <div class="OrderDate" style="width: 150px;">${order.Order.OrderDate}</div>
    <template id="print"></template>
    <button class="update">Update</button>
    <template id="show"></template>
    <div class="OrderId">${order.Order.OrderId}</div>
  `;
  // element
  const printBtn = createPrintButton();
  orderElement.querySelector("#print").replaceWith(printBtn);
  const showBtn = createShowButton();
  orderElement.querySelector("#show").replaceWith(showBtn);
  //event
  printBtn.addEventListener("click", () => print(order));
  showBtn.addEventListener("click", () => onShowClick(order));
  return orderElement;
}

function createPrintButton() {
  const e = document.createElement("button");
  e.className = "print";
  e.textContent = "Print";
  return e;
}
function createShowButton() {
  const e = document.createElement("button");
  e.className = "show";
  e.textContent = "Show";
  return e;
}
function print(order) {
  const OrderItems = order.Order.OrderItems;
  const OrderDetails = {
    OrderDiscountType: '',
    OrderDiscountCoupon: order.Order.OrderDiscount,
    CouponCode: order.Order.OrderCoupon,
  };
  const form = $("#printFormOntheFly");
  form.find("[name=OrderDetails]").val(JSON.stringify(OrderDetails));
  form.find("[name=OrderItems]").val(JSON.stringify(OrderItems));
  form.find("[name=store]").val('BodiShop');
  form.submit();
  return;
}
