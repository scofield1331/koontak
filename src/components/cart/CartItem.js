export class CartItem {
    constructor(data = {}) {
        this.name       = data.name       ?? '';
        this.image      = data.image      ?? '';
        this.product    = data.product    ?? '';
        this.format     = data.format     ?? '';
        this.retailsize = data.retailsize ?? '';
        this.retailunit = data.retailunit ?? '';
        this.shipweight = data.shipweight ?? 0;
        this.price      = data.price      ?? 0;
        this.count      = data.count      ?? 1;
        this.sku      = data.sku      ?? '';
    }

    static createFromProduct(product, sku, count) {
        const retail = product.Retail[sku];
        if (!retail) {
            throw new Error(`SKU "${sku}" not found for product "${product.Product}"`);
        }
        const calculator = Component.registry.get('calculator');
        return new CartItem({
            name:       `${product.Product} (${retail.RetailSize} ${retail.RetailUnit})`,
            image:      `/images/${product.category}/${product.getImageName()}_1.jpg`,
            product:    product.Product,
            format:     product.category,
            retailsize: retail.RetailSize,
            retailunit: retail.RetailUnit,
            shipweight: retail.ShipWeight,
            price:      calculator.calculateRetailUniversal(product, retail, 'equine'),
            count:      count,
            sku:        sku,
        });
    }

    toJSON() {
        return {
            name: this.name,
            image: this.image,
            product: this.product,
            format: this.format,
            retailsize: this.retailsize,
            retailunit: this.retailunit,
            shipweight: this.shipweight,
            price: this.price,
            count: this.count,
            sku: this.sku,
        };
    }
}