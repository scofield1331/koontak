import { createRow } from './Row';

const popup = createPopup();
export function renderPopup() {
    document.getElementById('contenainer').append(popup);
    setEvent();
    return popup;
}
function setEvent() {
    $(popup).on('click', e => onModalClick(e));
    $(popup).find('.close').on('click', e => popup.hide());
    $(popup).find('.save').on('click', e => onSaveClick(e));
}
function onSaveClick(e) {
    const { expense, element } = popup.getState();
    if (!expense) {
        alert('expense not found');
        return;
    }
    const data = popup.serialize();
    if (!data.length) {
        popup.messageEl.innerHTML = 'empty supplier or product, no update';
        return;
    }
    popup.messageEl.innerHTML = 'updating...';
    $.ajax({
        method: 'POST',
        dataType: 'json',
        url: '../Accounting/monthly-expense-template.php?action=updatePopup',
        data: {
            date: expense.Date,
            data: data,
        }
    }).done(response => {
        if (response.success) {
            expense.Popup = data;
            popup.update(expense);
            element.innerHTML = popup.countTotal(expense);
            popup.messageEl.innerHTML = 'success';
        } else {
            popup.messageEl.innerHTML = response.error;
        }
    })
}
function onModalClick(e) {
    const content = popup.querySelector('.modal-content');
    if (!content.contains(e.target) &&
        content !== e.target
    ) {
        popup.hide();
    }
}
function createPopup() {
    const state = {
        list: [],
        expense: null,
        total: 0,
        element: null
    };
    const element = document.createElement('div');
    element.id = 'Popup';
    element.className = 'popup';
    element.innerHTML = String.raw`
	<div class="modal-content">
		<div>
			<span class="close">&times;</span>
			<div style="clear:both"></div>
		</div>
		<div>
            Total: <span class="total"></span>
            <table class="table">
                <thead>
                    <tr>
                        <td>Supplier</td>
                        <td>Product</td>
                        <td>Date</td>
                        <td>Amount</td>
                </thead>
                <tbody></tbody>
            </table>
        </div>
		<table class="content">
		</table>
		<div class="footer">
			<button class="save">save</button>
            <span class="message"></span>
		</div>
	</div>`;
    const tbody = element.querySelector('tbody');
    element.messageEl = element.querySelector('.message');
    element.getState = () => state;
    element.show = () => {
        element.style.display = 'block';
    }
    element.hide = () => {
        element.style.display = 'none';
    }
    element.update = expense => {
        state.expense = expense;
        state.list = [];
        popup.messageEl.innerHTML = '';
        tbody.innerHTML = '';
        state.total = element.countTotal(expense);
        element.querySelector('.total').innerHTML = state.total;
        expense.Popup && expense.Popup.forEach(item => {
            const row = createRow(item);
            tbody.append(row);
            state.list.push(row);
        })
        const emptyRow = createRow({ date: moment().format('YYYY-MM-DD') });
        tbody.append(emptyRow);
        state.list.push(emptyRow);
    }
    element.serialize = () => {
        return state.list.map(row => row.serialize()).filter(item => item.supplier != '' || item.product != '');
    }
    element.countTotal = expense => {
        if (!expense.Popup) return 0;
        return expense.Popup.reduce((total, item) => {
            const amount = parseFloat(item.amount);
            return total + (isNaN(amount) ? 0 : amount)
        }, 0)
    }
    element.attach = element => {
        state.element = element;
    }
    return element;
}