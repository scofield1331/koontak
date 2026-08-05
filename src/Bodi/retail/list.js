import { createOrderElement } from './order.js';
export function createOrderListElement({ orders, onShowClick, onNewOrderClick }) {
  const orderListElement = document.createElement('div');
  orderListElement.classList.add('order-list');
  const newOrderBtn = createNewOrderButton(onNewOrderClick);
  orderListElement.appendChild(newOrderBtn);
  const list = document.createElement('div');
  orderListElement.appendChild(list);
  orders.forEach((order, index) => {   
    const orderElement = createOrderElement({ order, onShowClick });
    list.appendChild(orderElement);
  });
  return orderListElement;
}

function createNewOrderButton(onClick) {
  const button = document.createElement('button');
  button.textContent = 'New Order';
  button.addEventListener('click', onClick);
  return button;
}