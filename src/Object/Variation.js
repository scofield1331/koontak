
export class Variation {
    constructor(data = {}, sku) {
        this.data = data;
        this.sku = sku;
        this.RetailUnit = data.RetailUnit ?? '';
        this.RetailSize = data.RetailSize ?? '1';
        this.Attribute = data.Attribute ?? '';
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

    get() {
        let data = {};
        data.RetailUnit = this.RetailUnit;
        data.RetailSize = this.RetailSize;
        data.Attribute = this.Attribute;
        data.StockRetailShop = this.StockRetailShop;
        data.StockLocation = this.StockLocation;
        data.UnitPrice = String(this.UnitPrice);
        data.Markup = String(this.Markup);
        data.RetailUnitPrice = this.RetailUnitPrice;
        data.RetailMarkup = String(this.RetailMarkup);
        data.UploadPrice = this.UploadPrice;
        data.UploadStock = this.UploadStock;
        data.Image = this.Image;
        data.Check = this.Check;
        return data;
    }
}