export class Sku {
    constructor(id, { page }) {
        this.element = $(`#${id}`);
        this.list = this.element.find('.variations');
        this.init();
        this.page = page;
    }
    setVariations(variations) {
        this.list.empty();
        Object.keys(variations).forEach(sku => {
            this.list.append(`<input type="text" data-old="${sku}" value="${sku}">`);
        })
    }
    init() {
        this.list.on('change', 'input', e => {
            let oldsku = $(e.target).data('old');
            let newsku = $(e.target).val();
            if (!this.page.product) return;
            $.ajax({
                method: 'POST',
                dataType: 'json',
                url: './dispatcher.php?action=changeSku',
                data: {
                    'product': this.page.product.Product,
                    'old': oldsku,
                    'new': newsku
                }
            }).then(rs => {
                if (!rs.success) {
                    alert(rs.error);
                } else {
                    $(e.target).data('newsku');
                }
            });
        })
    }
}