import { calculateSavg, calculateStockTotal, getDateExpiration, slugify } from './Util.js';
import { OrderItem } from '@/Object/OrderItem';
class ProductPopup {
    constructor(id) {
        this.id = id;

        this.state = {
            stock: 0,
            price: 0,
            expDate: '',
            avg: '',
            selectedKey: null,
            input: '',
            type: 'stock',
            firstSelect: 'stock',
            cellSelected: 'stock',
        };
        this.convert = new window.convertStockValueGlobal();
        this.render();
    }

    // call this every time clicks a product
    load(product, variation, row, type) {
        this.row = row;
        this.product = product;
        this.variation = variation;
        this.state.stock = calculateStockTotal(product);
        let retailBodiShop = window.inventoryListModel.cal.calculateRetailUniversal(product, variation, 'bodishop');
        this.state.price = retailBodiShop;
        let date = getDateExpiration(product);
        this.state.expDate = date && date.isValid() ? date.format('YYYY-MM') : '-';
        this.state.avg = calculateSavg(product);
        this.state.selectedKey = null;
        this.state.type = ['stock', 'avg', 'order'].includes(type) ? type : this.state.type;
        this.state.firstSelect = type;
        switch (this.state.type) {
            case 'order':
                this.state.input = this._applyAvgRule(this.state.avg);
                this.state.cellSelected = 'avg';
                break;
            case 'avg':
                this.state.input = this._applyAvgRule(this.state.avg);
                this.state.cellSelected = 'avg';
                break;
            default:
                this.state.cellSelected = 'stock';
                this.state.input = '';
        }

        this.$el.find('.popup__image').attr('src', `./../images/${slugify(this.product.category)}/${this.product.getImageName()}_1.jpg`);
        this.$el.find('.message').text('');
        this._updateDisplay();   // just refresh the values, no rebind
        this.show();
        window.inventoryListModel.chart.setUnit(this.variation.RetailUnit);
        window.inventoryListModel.chart.setSize(this.variation.RetailSize);
        window.inventoryListModel.chart.attach(row.find('.Avg').get(0));
    }

    show() { this.$el.show(); }
    hide() { this.$el.hide(); }

    bindEvents() {
        // these never get called again
        this.$el.on('click', '.popup-overlay', e => this._onOverLayClick(e));
        this.$el.on('click', '.numkey', this._onNumKey.bind(this));
        this.$el.on('click', '#btn-clear', this._onClear.bind(this));
        this.$el.on('click', '#btn-zero', this._onZero.bind(this));
        this.$el.on('click', '#btn-update', this._onUpdate.bind(this));
        this.$el.on('click', '#btn-close', () => this.hide());
        this.$el.on('click', '.cell-select', this._onCellSelect.bind(this));

    }
    _onOverLayClick(e) {
        const $popup = this.$el.find('.popup');
        if (!$popup.has($(e.target)).length &&
            (!$popup.is($(e.target)))
        ) {
            this.hide();
        }
    }
    _onCellSelect(e) {
        const key = $(e.currentTarget).data('key');
        this.state.type = key;
        this.state.cellSelected = key;
        switch (key) {
            case 'avg':
                let avg = this._applyAvgRule((Math.round(this.state.avg * 10) / 10));
                this.state.input = avg;
                this.state.type = this.state.subAvgType;
                break;
            case 'stock':
                this.state.input = '';
                break;
            default:
                this.state.input = '';
        }
        this._updateDisplay();
    }
    _onNumKey(e) {
        const v = $(e.currentTarget).data('val').toString();
        this.state.input += v;
        this.state.selectedKey = v;
        this._updateDisplay();
    }

    _onClear() {
        this.state.input = '';
        this.state.selectedKey = null;
        this._updateDisplay();
    }

    _onZero() {
        if (this.state.input.length < 4) this.state.input += '0';
        this._updateDisplay();
    }

    _onUpdate() {
        switch (this.state.cellSelected) {
            case 'avg':
                this.state.input = this.state.input || '0';
                this._addToCart();
                break;
            case 'stock':
                const promise = this._updateStock();
                switch (this.state.firstSelect) {
                    case 'avg':
                    case 'order':
                        promise.then(response => {
                            this.$el.find('[data-key="avg"]').trigger('click');
                        });
                        break;
                    default:
                        promise.then(response => {
                            this.hide();
                        });
                }
                break;
            default:
                alert(`${this.state.type} not found`);
                this.hide();
        }
    }
    _addToCart() {
        this.$el.find('.update').prop('disabled', true);
        this.$el.find('.message').text('update avg...');
        const product = this.product;
        const newValue = this.state.input;
        const row = $(this.row);
        const sku = this.variation.sku;
        const orderPrice = window.inventoryListModel.cal.calculateRetailUniversal(product, this.variation, 'bodishop')
        const orderCost = window.inventoryListModel.cal.calculateCost(product, this.variation);
        let ReqData = {
            product: product.Product,
            format: product.category,
            sku: sku,
            qty: newValue,
            OrderPrice: orderPrice ?? 0,
            OrderCost: orderCost ?? 0
        };
        $.ajax({
            method: 'POST',
            dataType: 'json',
            url: './shop/products-template.php?action=addtoCart',
            async: false,
            data: ReqData
        }).done(response => {
            this.$el.find('.update').prop('disabled', false);
            if (response.success) {
                this._updateOrder();
                this.hide();
            } else {
                this.$el.find('.message').text(response.err);
            }
        });
    }
    _updateOrder() {
        this.row.find('.Delivery').text(this.state.input);
        if (!this.product.OrderItem) {
            this.product.OrderItem = new OrderItem().toJSON();
        }
        this.product.OrderItem.OrderQuantity = this.state.input;
        this.row.data('item', this.product.toJSON());
        this.hide();
    }
    _updateStock() {
        this.state.stock = this.state.input || 0;
        this.$el.find('.update').prop('disabled', true);
        this.$el.find('.message').text('update stock...');
        const product = this.product;
        const variation = this.variation;
        let stockRetailShop, RetailSize, RetailUnit, convertedToGr;
        stockRetailShop = isNaN(this.state.stock) ? 0 : parseFloat(this.state.stock);
        RetailSize = variation.RetailSize;
        RetailUnit = variation.RetailUnit;
        convertedToGr = this.convert.convertStockValue(RetailSize, RetailUnit, 'gr') * stockRetailShop;
        convertedToGr = Math.round(convertedToGr * 100) / 100;
        return new Promise(resolve => {
            $.ajax({
                method: 'POST',
                dataType: 'json',
                url: '../Bodi/shop/products-template.php?action=updateRetail',
                data: {
                    category: product.category,
                    product: product.Product,
                    sku: variation.sku,
                    StockRetailShop: isNaN(convertedToGr) ? 0 : convertedToGr
                }
            }).done(response => {
                this.$el.find('.update').prop('disabled', false);
                if (response.success) {
                    this.$el.find('.message').text('Successfully updated Stock');
                    this.row.find('.ShopBagOZ').text(this.state.stock);
                    variation.StockRetailShop = convertedToGr;
                    product.Retail[variation.sku] = variation.toJSON();
                    this.row.data('variation', variation.toJSON());
                    this.row.data('item', product.toJSON());
                } else {
                    this.$el.find('.message').text(response.error);
                }
                resolve(response);
            })
        })
    }
    _applyAvgRule(raw) {
        const n = parseFloat(raw);
        return n < 4 ? 4 : Math.ceil(n);
    }

    _updateDisplay() {
        this.$el.find('#product-name').text(`${this.product.Product} - ${this.variation.RetailSize} ${this.variation.RetailUnit}`);
        this.$el.find('.stock').text(Math.round(this.state.stock));
        this.$el.find('.price').text((Math.round(this.state.price * 100) / 100).toFixed(2));
        this.$el.find('.avg').text(Math.round(this.state.avg * 10) / 10);
        this.$el.find('.expDate').text(this.state.expDate);
        this.$el.find('.input').text(this.state.input);

        this.$el.find('.numkey').each((_, el) => {
            $(el).toggleClass('selected',
                $(el).data('val').toString() === this.state.selectedKey
            );
        });
        this.$el.find('.cell-select').removeClass('active');
        this.$el.find(`.cell-select[data-key="${this.state.cellSelected}"]`).addClass('active');
    }

    render() {
        if ($(`#${this.id}`).length) {
            this.$el = $(`#${this.id}`);
        } else {
            this.$el = $(`<div id="${this.id}"></div>`);
            $('body').append(this.$el);
            this.bindEvents();
        }
        this.$el.html(String.raw`
        <div class="popup-overlay">
            <div class="popup">

            <button class="popup__close" id="btn-close">&times;</button>
            <p class="popup__name" id="product-name">${this.product?.Product}</p>

            <div class="popup__info">
                <div class="popup__info-cell cell-select" data-key="stock">
                <span class="popup__info-label">Stock</span>
                <span class="popup__info-value stock">${this.state.stock}</span>
                </div>
                <div class="popup__info-cell cell-select" data-key="avg">
                <span class="popup__info-label">Buy</span>
                <span class="popup__info-value avg">0</span>
                </div>
                <div class="popup__info-cell">
                <span class="popup__info-label">Price</span>
                <span class="popup__info-value price">${this.state.price}</span>
                </div>
                <div class="popup__info-cell">
                <span class="popup__info-label">Exp</span>
                <span class="popup__info-value expDate">${this.state.expDate}</span>
                </div>
            </div>

            <div class="input-wrap">
                <span class="input"></span>
            </div>

            <div class="popup__body">
                <img class="popup__image" src="product.jpg" alt="product" />
                <div class="popup__numpad">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                    <button class="popup__key numkey" data-val="${n}">${n}</button>
                `).join('')}
                    <button class="popup__action" id="btn-clear">clear</button>
                    <button class="popup__key numkey" data-val="0">0</button>
                    <button class="popup__action popup__action--confirm update" id="btn-update">update</button>
                </div>
            </div>
            <p class="popup__status message" id="status-msg"></p>
            <div id="chart"></div>
            </div>
        </div>
        `);
        this.$el.hide();         // start hidden
    }
}
export default ProductPopup;