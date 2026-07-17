class SelectPopup {
    constructor(id) {
        this.id = id;

        this.state = {
            selected: 'avg',
            label: ''
        };
        this.render();
    }

    getValue() {
        return this.state.selected;
    }
    // call this every time clicks a product
    load(selector) {
        this.selector = selector;
        this.state.selected = this.selector.data('selected') ?? 'stock';
        this._update();
        this.show();
    }
    _update() {
        this.$el.find('.opt.sel').removeClass('sel');
        this.$el.find(`.opt[data-value="${this.state.selected}"]`).addClass('sel');
    }
    show() {
        this.$el.find('.overlay').addClass('on');
        this.$el.find('.modal').addClass('on');
    }
    hide() {
        this.$el.find('.modal').removeClass('on');
        this.$el.find('.overlay').removeClass('on');
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
        <div class="overlay">
            <div class="modal" id="modal">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <span class="modal-cancel cancel">Cancel</span>
                </div>
                <div id="opts">
                    <div class="opt opt-select" data-value="stock">
                        <span class="opt-label">Stock</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    <div class="opt opt-select" data-value="Avg">
                        <span class="opt-label">Buy by Avg Sales</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    <div class="opt opt-select" data-value="order">
                        <span class="opt-label">Order by Stocking</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    <div class="opt opt-select" data-value="retail-price">
                        <span class="opt-label">Price</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    <div class="opt opt-select" data-value="DateExpiration">
                        <span class="opt-label">Exp Date</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    <div class="opt opt-select" data-value="image">
                        <span class="opt-label">Image</span>
                        <div class="radio-ring">
                            <div class="radio-dot"></div>
                        </div>
                    </div>

                    
                    <div class="opt opt-action open-buy-list">
                        <span class="opt-label">* SUBMIT *</span>
                    </div>
                </div>
            </div>
        </div>
        `);
    }

    bindEvents() {
        this.$el.on('click', '.overlay', e => this._onOverLayClick(e));
        this.$el.on('click', '.cancel', e => this.hide());
        this.$el.on('click', '.opt-select', e => this._onOptionSelect(e));
        this.$el.on('click', '.open-buy-list', e => this._onBuyListClick(e));
    }
    _onBuyListClick(e) {
        window.inventoryListModel.orderSubmit();
        this.hide();
    }
    _onOptionSelect(e) {
        const val = $(e.currentTarget).data('value');
        this.state.selected = val;
        this.state.label = $(e.currentTarget).find('.opt-label').text();
        this._update();
        this.hide();
        this.selector.data('selected', this.state.selected).text(this.state.label).trigger('selectpopup-change', { value: this.state.selected });
    }
    _onOverLayClick(e) {
        const $modal = this.$el.find('.modal');
        if (!$modal.has($(e.target)).length &&
            (!$modal.is($(e.target)))
        ) {
            this.hide();
        }
    }
}

export default SelectPopup;
