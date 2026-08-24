import { createOrderListElement } from './list.js';
import { Order } from '@/Object/Order.js';
import { getExclusiveProduct, soundAlert } from './Service.js';
window.shopOrder = {};
window.shopOrder.components = { createOrderListElement}
window.shopOrder.models = { Order }
window.shopOrder.services = { getExclusiveProduct, soundAlert }