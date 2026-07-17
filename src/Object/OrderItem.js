export class OrderItem {
    constructor(data = {}) {
        this.OrderProduct = data.OrderProduct ?? "";
        this.OrderProductID = data.OrderProductID ?? "";
        this.OrderProductSKU = data.OrderProductSKU ?? "";
        this.OrderFormat = data.OrderFormat ?? "";
        this.OrderAttribute = data.OrderAttribute ?? "";
        this.OrderShipWeight = data.OrderShipWeight ?? "";
        this.OrderQuantity = data.OrderQuantity ?? 0;
        this.OrderQuantityMissing = data.OrderQuantityMissing ?? "";
        this.OrderPrice = data.OrderPrice ?? "0";
        this.OrderItemDiscount = data.OrderItemDiscount ?? "0";
        this.OrderCost = data.OrderCost ?? "0";
        this.OrderSubCategory = data.OrderSubCategory ?? "";
        this.OrderTaskPoint = data.OrderTaskPoint ?? "0";
        this.OrderDeliveryDate = data.OrderDeliveryDate ?? "";
        this.OrderStatus = data.OrderStatus ?? "";
    }

    // Serialization
    toJSON() {
        return {
            OrderProduct: this.OrderProduct,
            OrderProductID: this.OrderProductID,
            OrderProductSKU: this.OrderProductSKU,
            OrderFormat: this.OrderFormat,
            OrderAttribute: this.OrderAttribute,
            OrderShipWeight: this.OrderShipWeight,
            OrderQuantity: this.OrderQuantity,
            OrderQuantityMissing: this.OrderQuantityMissing,
            OrderPrice: this.OrderPrice,
            OrderItemDiscount: this.OrderItemDiscount,
            OrderCost: this.OrderCost,
            OrderSubCategory: this.OrderSubCategory,
            OrderTaskPoint: this.OrderTaskPoint,
            OrderDeliveryDate: this.OrderDeliveryDate,
            OrderStatus: this.OrderStatus,
        };
    }
}