export class UpdateLog {
    constructor(options = null) {
        if (options) {
            Object.keys(options).forEach(key => {
                this[key] = options[key];
            })
        }
    }
    init() {
        let self = this;
        $('#retailform').on('change', '.subcategories input[type=checkbox]', function (e) {
            if (self.page.item) {
                let cats = $(this).closest('.subcategories');
                let order = cats.data('order');
                let values = [];
                cats.find('input[type=checkbox]:checked').each((i, e) => {
                    values.push($(e).val());
                })
                let change = {
                    CategoryStoreAccount: {
                        [`${order}Sub`]: values
                    }
                };
                self.addLog(change);
            }
        })
        $('.rightBlock').on('change', "input[type!='checkbox'][class!='image']:not(.no-update), select, textarea", e => {
            if (this.page.getProduct()) {
                let name = $(e.target).attr('name');
                let value = $(e.target).val();
                let change = this.getChange(name, value);
                if (change) {
                    this.update(change);
                }
            }
        })
        $('.rightBlock').on('blur', ".editable", e => {
            if (this.page.getProduct()) {
                let name = $(e.target).attr('name');
                let value = $(e.target).html();
                let change = this.getChange(name, value);
                if (change) {
                    this.update(change);
                }
            }
        })
        $('.rightBlock').on('custom-change', ".update-trigger", (e, data) => {
            if (this.page.getProduct()) {
                let { name, value } = data;
                let change = this.getChange(name, value);
                let replace = $(e.target).data('replace');
                if (change) {
                    this.update(change, undefined, replace);
                }
            }
        })
    }
    getChange(name, value) {
        if (!name) return false;
        let patt = /(?:\[([^\[\]]*)\])/g;
        let matches = [...name.matchAll(patt)];
        let change, pointer;
        if (matches.length) {
            name = name.replace(patt, '');
            change = {
                [name]: {}
            };
            pointer = change[name];
            matches.forEach((match, i) => {
                const key = /^\d+$/.test(match[1]) ? Number(match[1]) : match[1];
                if (i == matches.length - 1) {
                    pointer[key] = value;
                } else {
                    const nextKey = matches[i + 1][1];
                    pointer[key] = /^\d+$/.test(nextKey) ? [] : {};
                    pointer = pointer[key];
                }
            });
        } else {
            change = {
                [name]: value
            };
        }
        return change;
    }
    update(change, item = undefined, replace = 0) {
        if (item == undefined) {
            item = this.page.getProduct();
        }
        let log = {
            'category': item.category,
            'product': item.Product,
            'datetime': moment().format('YYYY-MM-DD HH:mm:ss'),
            'replace': replace,
            'change': change
        }
        return new Promise(resolve => {
            $.ajax({
                method: 'POST',
                dataType: 'json',
                url: './dispatcher.php?action=update',
                contentType: 'application/json',
                data: JSON.stringify(log)
            }).then(rs => {
                if (rs.success) {
                    this.page.updateProduct(change, replace);
                    if (rs.Product && rs.Product != log.product) {
                        this.page.getProduct().Product = rs.Product;
                        $(this.page.activeRow).find('.product-item-i').html(rs.Product);
                    }
                } else {
                    alert(rs.error);
                }
                resolve(rs);
            });
        })
    }
}