import { createOrderElement } from "./order.js";
import { getTotalPrice } from "./Utils.js";
export function createOrderListElement({
  orders,
  onShowClick,
  onNewOrderClick,
}) {
  const orderListElement = document.createElement("div");
  orderListElement.classList.add("order-list");
  orderListElement.innerHTML = /* HTML */ `
    <div>
      <div class="list-header">
        <template id="new-order"></template>
        <template id="total"></template>
      </div>
    </div>
  `;
  const newOrderBtn = createNewOrderButton(onNewOrderClick);
  const total = getTotalPrice(orders);
  console.log(total);
  const totalElement = createTotalElement(Math.round(total * 100) / 100);
  orderListElement.querySelector("#new-order").replaceWith(newOrderBtn);
  orderListElement.querySelector("#total").replaceWith(totalElement);
  const list = document.createElement("div");
  orderListElement.appendChild(list);
  orders.forEach((order, index) => {
    const orderElement = createOrderElement({ order, onShowClick });
    list.appendChild(orderElement);
  });
  return orderListElement;
}

function createNewOrderButton(onClick) {
  const button = document.createElement("button");
  button.className = "new-order";
  button.textContent = "New Order";
  button.addEventListener("click", onClick);
  return button;
}

function createTotalElement(total) {
  const div = document.createElement("div");
  div.className = "total";
  div.textContent = `Total Sale: $${total}`;
  return div;
}
