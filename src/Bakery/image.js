
export class Image {
    path = Date.now();
    active = false;
    note = '';
    sequence = 0;
    constructor(parent, { image, page }) {
        this.parent = parent;
        this.page = page;
        if (image) {
            if (image.path) this.path = image.path;
            if (image.active) this.active = image.active;
            if (image.note) this.note = image.note;
            if (image.sequence) this.sequence = image.sequence;
        }
        this.element = $('#image').children().clone();
        this.init();
    }
    init() {
        this.element.find('.active input').change(e => {
            this.active = $(e.target).prop('checked');
            this.parent.triggerChangeEvent();
        })
        this.element.find('.note textarea').change(e => {
            this.note = $(e.target).val();
            this.parent.triggerChangeEvent();
        })
        this.element.find('.open-note').click(e => {
            this.element.find('.note').toggle('show');
        })
        this.element.find('.delete').click(e => {
            this.parent.delete(this);
            this.remove();
        })
        this.element.find('.image-input').change(e => {
            this.element.find('.loading').show();
            this.parent.upload(this, e.target.files[0]).then(resp => {
                this.element.find('.loading').hide();
                if (resp.success) {
                    this.element.find('.thumb-image').attr('src', URL.createObjectURL(e.target.files[0]));
                } else {
                    alert(resp.error);
                }
            });
        })
    }
    update() {
        let product = this.page.getProduct();
        this.element.find('.active input').prop('checked', this.active);
        this.element.find('.note textarea').val(this.note);
        this.element.find('.thumb-image').attr('src', `../Bakery/images/${product.getImageName()}_${this.path}.jpg?time=` + new Date())
    }
    getElement() {
        return this.element;
    }
    remove() {
        this.element.remove();
    }
    getPath() {
        return this.path;
    }
    setPath(path) {
        this.path = path;
    }
    getData() {
        return {
            path: this.path,
            active: this.active,
            note: this.note,
            sequence: this.sequence,
        }
    }
    setSequence(sequence) {
        this.sequence = sequence;
    }

}