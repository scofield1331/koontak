export class Supplier {
  constructor(data = {}) {
    this.Supplier = data.Supplier ?? '';
    this.SupplierSize = data.SupplierSize ?? '4';
    this.SupplierUnit = data.SupplierUnit ?? 'Oz';
    this.Cost = data.Cost ?? '';
    this.CostPick = data.CostPick ?? '';
    this.Freight = data.Freight ?? '';
    this.Currency = data.Currency ?? '';
    this.Purchase = data.Purchase ?? '';
    this.Ordered = data.Ordered ?? '';
    this.Link = data.Link ?? '';
    this.Lots = data.Lots ?? '';
    this.Tracking = data.Tracking ?? '';
    this.DatePurchase = data.DatePurchase ?? '';
    this.DateOrdered = data.DateOrdered ?? '';
    this.DateDelivery = data.DateDelivery ?? '';
    this.DateExpiration = data.DateExpiration ?? '';
    this.Carrier = data.Carrier ?? '';
    this.SupplierDiscount = data.SupplierDiscount ?? '';
  }

  toJSON() {
    return { ...this };
  }
}