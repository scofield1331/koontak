export function renderMarkupOptionPanel(setting, categories) {
    const MarkupOptionPanel = createMarkupOptionPanel(categories);
    const wrapper = document.querySelector('.markup-category');
    wrapper.innerHTML = '';
    wrapper.append(MarkupOptionPanel);
    MarkupOptionPanel.setValue(setting, categories)
}
function createMarkupOptionPanel(categories) {
    const element = document.createElement('div');
    element.innerHTML = categories.map((category) => createFormRow(category)).join('');
    element.setValue = (setting, categories) => {
        categories.forEach(category => {
            const selectInput = element.querySelector(`[name="Markup[MarkupWorker][${category}]"]`);
            if (setting.Markup.MarkupWorker[category] && selectInput) {
                selectInput.value = setting.Markup.MarkupWorker[category];
            }
        })
    }
    return element;
}

function createFormRow(category) {
    return String.raw`
    <div class="markup-item">
        <label class="title" for="Markup${category}">Category ${category}</label>
        <input type="text" name="Markup[MarkupWorker][${category}]" id="Markup${category}" size="5" />
    </div>`;
}
