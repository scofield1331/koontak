export function renderExpirationDatPanel(setting, categories) {
    const expirationDatePanel = createExpirationDatePanel(categories);
    const wrapper = document.querySelector('.expriation');
    wrapper.innerHTML = '';
    wrapper.append(expirationDatePanel);
    expirationDatePanel.setValue(setting, categories)
}
function createExpirationDatePanel(categories) {
    const element = document.createElement('div');
    element.innerHTML = categories.map((category) => createFormRow(category)).join('');
    element.setValue = (setting, categories) => {
        categories.forEach(category => {
            const selectInput = element.querySelector(`[name="${category}"]`);
            if (setting[category] && selectInput && valueExists(selectInput, setting[category])) {
                selectInput.value = setting[category];
            }
        })
    }
    return element;
}

function valueExists(select, value) {
    return [...select.options].some(option => option.value === value);
}
function createFormRow(category) {
    return String.raw`
    <div class="form-row">
        <label for="">${category}</label>
        <select name="${category}" id="${category}">
            <option value="">---</option>
            <option value="1M">1 month</option>
            <option value="3M">3 month</option>
            <option value="6M">6 month</option>
            <option value="12M">12 month</option>
            <option value="24M">24 month</option>
            <option value="36M">36 month</option>
            <option value="48M">48 month</option>
            <option value="60M">60 month</option>
        </select>
    </div>`;
}
