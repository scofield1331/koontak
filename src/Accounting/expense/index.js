
import { renderPopup } from './Popup';
import './Popup.css'

window.load = () => {
    fetch('../Accounting/monthly-expense-template.php?action=load')
        .then(res => res.json())
        .then(data => {
            window.inventoryListModel.init(data);
            const popup = renderPopup();
            data.expense.forEach(item => {
                const total = popup.countTotal(item);
                $('#popup-trigger').append(`<td class="popup">${total}</td>`);
            })
            $('#expense-form').on('click', '.popup', e => {
                let i = $(e.target).index();
                let date = $('#Date').children().eq(i).text();
                const expense = data.expense.find(d => {
                    return d.Date == date;
                })
                if (!expense) {
                    alert(`expense ${date} not found`);
                    return;
                }
                popup.attach(e.target);
                popup.update(expense);
                popup.show();
            });
        })
}

window.load();
