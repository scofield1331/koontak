export function createRow({ supplier, product, date, amount}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="supplier" contenteditable="true">${supplier ?? ''}</td>
        <td class="product" contenteditable="true">${product ?? ''}</td>
        <td class="date" contenteditable="true">${date ?? ''}</td>
        <td class="amount" contenteditable="true">${amount ?? ''}</td>
    `;

    tr.serialize = () => {
        return {
            supplier: tr.querySelector('.supplier').textContent.trim() ?? '',
            product: tr.querySelector('.product').textContent.trim() ?? '',
            date: tr.querySelector('.date').textContent.trim() ?? '',
            amount: tr.querySelector('.amount').textContent.trim() ?? '',
        }
    }
    return tr;
}