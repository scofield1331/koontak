
export class ShopVariation {
    constructor(data = {}, sku) {
        this.data = data;
        this.sku = sku;
        this.RetailUnit = data.RetailUnit ?? '';
        this.RetailSize = data.RetailSize ?? '1';
        this.Attribute = data.Attribute ?? '';
        this.StockRetail = data.StockRetail ?? '';
        this.StockRetailShop = data.StockRetailShop ?? '1';
        this.StockLocation = data.StockLocation ?? '';
        this.UnitPrice = parseFloat(data.UnitPrice) || 0;
        this.Markup = parseFloat(data.Markup) || 0;
        this.RetailUnitPrice = data.RetailUnitPrice ?? '';
        this.RetailMarkup = parseFloat(data.RetailMarkup) || 0;
        this.UploadPrice = data.UploadPrice ?? false;
        this.UploadStock = data.UploadStock ?? false;
        this.Image = data.Image ?? '';
        this.Check = data.Check ?? [];
    }

    toJSON() {
        let data = this.data;
        this.data.RetailUnit = this.RetailUnit;
        this.data.RetailSize = this.RetailSize;
        this.data.Attribute = this.Attribute;
        this.data.StockRetail = this.StockRetail;
        this.data.StockRetailShop = this.StockRetailShop;
        this.data.StockLocation = this.StockLocation;
        this.data.UnitPrice = String(this.UnitPrice);
        this.data.Markup = String(this.Markup);
        this.data.RetailUnitPrice = this.RetailUnitPrice;
        this.data.RetailMarkup = String(this.RetailMarkup);
        this.data.UploadPrice = this.UploadPrice;
        this.data.UploadStock = this.UploadStock;
        this.data.Image = this.Image;
        this.data.Check = this.Check;
        return data;
    }
}