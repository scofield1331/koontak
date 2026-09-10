import { createOrderListElement } from "./list.js";
import { Order } from "@/Object/Order.js";
import { getExclusiveProduct, soundAlert } from "./Service.js";
import { createStaffSelector } from "./staff.ts";
import { calculateProfit } from "./Utils.js";
import { registry } from "@/Service/Registry.js";
window.shopOrder = {};
window.shopOrder.components = {
  createOrderListElement,
  staffSelector: createStaffSelector(),
};
window.shopOrder.models = { Order };
window.shopOrder.services = { getExclusiveProduct, soundAlert, calculateProfit, registry };
