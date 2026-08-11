import { OrderItem } from "./OrderItem.js";
export class Order {
  constructor(data = {}) {
    this.OrderId = data.OrderId ?? "";
    this.OrderStaff = data.OrderStaff ?? "";
    this.OrderDate = data.OrderDate ?? "";
    this.OrderTotal = data.OrderTotal ?? "";
    this.OrderDiscount = data.OrderDiscount ?? "";
    this.OrderReward = data.OrderReward ?? "";
    this.OrderCoupon = data.OrderCoupon ?? "";
    this.OrderCouponCode = data.OrderCouponCode ?? "";
    this.OrderStatus = data.OrderStatus ?? "Ordered";
    this.OrderLastUpDate = data.OrderLastUpDate ?? "";
    this.OrderDeliveryDate = data.OrderDeliveryDate ?? "";
    this.OrderLabelId = data.OrderLabelId ?? "";
    this.OrderLabelPrint = data.OrderLabelPrint ?? "";
    this.OrderTracking = data.OrderTracking ?? "";
    this.OrderCarrier = data.OrderCarrier ?? "usps";
    this.OrderCarrierService = data.OrderCarrierService ?? "ground";
    this.OrderShipWeightTotal = data.OrderShipWeightTotal ?? "";
    this.OrderCarrierFeeRetail = data.OrderCarrierFeeRetail ?? "";
    this.OrderCarrierFeeCost = data.OrderCarrierFeeCost ?? "";
    this.OrderRetailer = data.OrderRetailer ?? "";
    this.OrderNotes = data.OrderNotes ?? "";
    this.OrderAddressType = data.OrderAddressType ?? "";
    this.OrderPaymentType = data.OrderPaymentType ?? "";
    this.OrderPaid = data.OrderPaid ?? "";
    this.OrderItems = (data.OrderItems ?? []).map((item) =>
      item instanceof OrderItem ? item : new OrderItem(item),
    );
    this.OrderDateShow = data.OrderDateShow ?? "";
  }

  static fromJSON(json) {
    const data = json.Order ? json.Order : json;
    return new Order(data);
  }

  toJSON() {
    return { Order: { ...this } };
  }
}
