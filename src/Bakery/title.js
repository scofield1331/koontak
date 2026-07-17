function createElement() {
    return `
    <div class="form-row"  style="background-color: #FCFBE0">
        <div>
            <span>Title Ideas</span>
            <div class="title-idea update-trigger" data-replace="1">
                <div class="titles"></div>
                <button class="add">add</button>
            </div>
        </div>
    </div>`;
}
export class Title {
    constructor(id) {
        this.element = $(`#${id}`);
        this.init();
    }
    init() {
        this.element.html(createElement());
        this.titles = this.element.find('.titles');
        this.input = $(`<input class="title no-update" name="Title[][ProductName]">`);
        this.element.find('.add').click(e => this.addInput());
        this.element.on('change', '.title', e => this.triggerChangeEvent());
    }
    set(titles) {
        this.titles.empty();
        if (Array.isArray(titles)) {
            titles.forEach((title, index) => {
                let input = this.input.clone();
                input.val(title);
                this.titles.append(input);
            })
        } else {
            console.log('Title must be array of ProductName');
        }
    }
    get() {
        let data = this.titles.find('.title').map((i, e) => {
            return $(e).val().trim();
        }).get();
        data = data.filter(title => title != '');
        return data;
    }
    addInput() {
        let input = this.input.clone();
        this.titles.append(input);
    }
    triggerChangeEvent() {
        let data = this.get();
        this.element.find('.update-trigger').trigger('custom-change', [{ name: 'Title', value: data }]);
    }
}