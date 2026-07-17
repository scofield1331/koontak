export class ProductList {
    products = {};
    totalCost;
    cachedCost = {};
    constructor(id, source) {
        this.element = $(`#${id}`);
        this.source = source;
        this.list = this.element.find('.product-list');
        this.search = this.element.find('.product-search');
        this.item = $('#product-list-item .item');
        this.init();
    }
    init() {
        let oldIndex;
        this.list.sortable({
            items: ".product-item",
            handle: ".move",
            start: function (e, ui) {
                oldIndex = ui.item.index();
            },
            update: (e, ui) => {
                const newIndex = ui.item.index();
                let tmp = this.products.splice(oldIndex, 1)[0];
                this.products.splice(newIndex, 0, tmp);
                this.triggerChangeEvent();
            }
        });
        this.list.on('change', '.sku-select', e => {
            const item = $(e.target).closest('.item');
            this.updateProductCost(item);
            this.updateProductItem(item);
            this.calculateTotalCost();
            this.updateTotalCost();
            this.triggerChangeEvent();
        });
        this.list.on('change', '.cost', e => {
            const item = $(e.target).closest('.item');
            this.updateProductItem(item);
            this.calculateTotalCost();
            this.updateTotalCost();
            this.triggerChangeEvent();
        });
        this.list.on('change', '.quantity', e => {
            const item = $(e.target).closest('.item');
            this.updateProductItem(item);
            this.calculateTotalCost();
            this.updateTotalCost();
            this.triggerChangeEvent();
        });
        this.list.on('click', '.add', e => this.save($(e.target).closest('.item')));
        this.list.on('click', '.delete', e => this.delete($(e.target).closest('.item')));
        this.list.on('click', '.inc', e => this.increase($(e.target).closest('.item')));
        this.list.on('click', '.dec', e => this.decrease($(e.target).closest('.item')));
        this.element.on('click', '.print-table', e => this.printTable());
        this.element.on('click', '.sequence', e => this.sequence());
    }
    sequence() {
        const rows = this.list.find('.product-item').get();
        const combined = this.products.map((p, i) => ({ p, row: rows[i] }));
        combined.sort((a, b) => a.p.ProductName.localeCompare(b.p.ProductName));
        combined.forEach(({ p, row }, i) => {
            this.products[i] = p;
            this.list.append(row);
        });
        this.list.append(this.list.find('.row:not(.product-item)'));
        this.triggerChangeEvent();
    }
    printTable() {
        let rowsHTML = '';
        this.products.forEach((p, i) => {
            rowsHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${p.ProductName}</td>
                    <td><code>${p.Sku}</code></td>
                    <td class="text-center">${p.Quantity}</td>
                    <td class="text-end">${parseFloat(p.Price).toFixed(2)}</td>
                </tr>`;
        });

        const printArea = `
        <table class="table table-bordered table-striped table-hover table-sm">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th class="text-center">Qty</th>
                    <th class="text-end">Price</th>
                </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
            <tfoot class="table-secondary fw-bold">
                <tr>
                    <td colspan="4" class="text-end">Total: </td>
                    <td class="text-center">${this.totalCost}</td>
                </tr>
            </tfoot>
        </table>`;
        const win = window.open('', '_blank');
        win.document.write(`
        <html>
            <head>
                <title>Product List</title>
                <link rel="stylesheet" href="../css/bootstrap.min.css" type="text/css">
            </head>
            <body class="p-4">
                <h4 class="mb-3">Product List</h4>
                ${printArea}
            </body>
        </html>
      `);
        win.document.close();
        win.onload = () => { win.print(); win.close(); };
    }
    increase(item) {
        const input = item.find('.quantity');
        let val = input.val();
        val = isNaN(val) ? 0 : Number(val);
        val += 1;
        input.val(val).trigger('change');
    }
    decrease(item) {
        const input = item.find('.quantity');
        let val = input.val();
        val = isNaN(val) ? 0 : Number(val);
        val -= 1;
        if (val < 1) return;
        input.val(val).trigger('change');
    }
    save(item) {
        item.addClass('product-item');
        const index = item.index();
        const productItem = this.getProductItem(item);
        this.products[index] = productItem;
        this.calculateTotalCost();
        this.updateTotalCost();
        this.addItem();
        this.triggerChangeEvent();
    }
    delete(item) {
        const index = item.index();
        this.products.splice(index, 1);
        item.remove();
        this.calculateTotalCost();
        this.updateTotalCost();
        this.triggerChangeEvent();
    }
    calculateTotalCost() {
        let totalCost = 0;
        this.list.find('.item').each((i, e) => {
            let sku = $(e).find('.sku-select').val();
            let productName = $(e).find('.product-name').val();
            let cost = $(e).find('.cost').val();
            let quantity = $(e).find('.quantity').val();
            cost = isNaN(cost) ? 0 : Number(cost);
            quantity = isNaN(quantity) ? 1 : Number(quantity);
            totalCost += cost * quantity;
        })
        totalCost = Math.round(totalCost * 100) / 100;
        if (this.totalCost !== undefined && this.totalCost != totalCost) {
            retailForm.updateSuppliersPricingCost(totalCost);
        }
        this.totalCost = totalCost;
    }
    updateProductItem(item) {
        const index = item.index();
        const productItem = this.getProductItem(item);
        this.products[index] = productItem;
    }
    getProductItem(item) {
        return {
            ProductName: item.find('.product-name').val().trim(),
            Sku: item.find('.sku-select').val().trim(),
            Quantity: item.find('.quantity').val().trim(),
            Price: item.find('.cost').val().trim(),
        };
    }
    set(productList) {
        this.list.empty();
        if (Array.isArray(productList)) {
            this.products = productList;
            productList.forEach(productItem => {
                this.addItem(productItem);
            })
            this.calculateTotalCost();
            this.updateTotalCost();
        } else {
            this.products = {};
            console.log('ProductList not valid');
        }
        this.addItem();
    }
    updateTotalCost() {
        this.element.find('.total').html(this.totalCost);
        retailForm.updateTotalCost(this.totalCost);
    }
    get() {
        let array = Object.values(this.products);
        return array;
    }
    getCost() {
        return this.totalCost;
    }
    findProduct(name) {
        for (var i = 0; i < this.source.length; i++) {
            if (this.source[i].label == name) {
                return this.source[i];
            }
        }
        return false;
    }
    findCost(productName, sku) {
        let cost = 0;
        if (this.cachedCost[sku]) {
            cost = this.cachedCost[sku];
        } else {
            let product = this.findProduct(productName);
            if (product) {
                for (var i = 0; i < product.retails.length; i++) {
                    if (product.retails[i].sku == sku) {
                        this.cachedCost[sku] = product.retails[i].cost;
                        cost = product.retails[i].cost;
                        break;
                    }
                }
            }
        }
        return cost;
    }
    renderSkuSelect(item, product) {
        item.find(".sku-select").empty();
        product.retails.forEach(retail => {
            const opt = $(`<option value="${retail.sku}" cost="${retail.cost}">${retail.sku}</option>`);
            item.find(".sku-select").append(opt);
        })
    }
    addItem(productItem = undefined) {
        let item = this.item.clone();
        if (productItem != undefined) {
            item.addClass('product-item');
            item.find('.product-name').val(productItem.ProductName);
            let product = this.findProduct(productItem.ProductName);
            if (product) {
                this.renderSkuSelect(item, product);
                item.find('.sku-select').val(productItem.Sku);
            } else {
                item.find(".sku-select").empty();
                const opt = $(`<option value="${productItem.Sku}" cost="${productItem.Cost}">${productItem.Sku}</option>`);
                item.find(".sku-select").append(opt);
            }
            if (productItem.Quantity) {
                item.find('.quantity').val(productItem.Quantity);
            }
            if (productItem.Price != undefined) {
            } else {
                productItem.Price = this.findCost(productItem.ProductName, productItem.Sku);
            }
            item.find('.cost').val(productItem.Price);
        }

        item.find(".product-name").autocomplete({
            source: this.source,
            select: (event, ui) => {
                event.preventDefault();
                var productName = ui.item.value;
                event.target.value = productName;
                event.target.setAttribute('inventory', ui.item.inventory);
                this.renderSkuSelect(item, ui.item);
                this.updateProductCost(item);
            }
        });
        this.list.append(item);
    }
    updateProductCost(e) {
        const productName = e.find('.product-name').val();
        const sku = e.find('.sku-select').val();
        const cost = this.findCost(productName, sku);
        e.find('.cost').val(cost);
        e.find('.quantity').val(1);
        e.find('.sku-select').val(sku);
    }

    triggerChangeEvent() {
        let data = this.get();
        this.element.trigger('custom-change', [{ name: 'ProductList', value: data }]);
    }
}