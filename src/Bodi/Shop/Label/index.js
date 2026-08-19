import { renderPromoTagWrapper } from './PromoTagWrapper';
import { findProduct, search } from './Util';
import './PromoTag.css';
import { registry } from '@/service/Registry';
import { CheckFilter } from './checkfilter';

window.findProduct = findProduct;
customElements.define('check-filter', CheckFilter);
fetch('../Bodi/shop/Label/shoplabel-template.php?action=load')
    .then(res => res.json())
    .then(data => {
        registry.register('calculator', new ShopCalculator(data.setting));
        const shopLabel = new ShopLabel();
        shopLabel.init(data);
        let checklist = data.shoplabel.map(productName => {
            return search(data.list, productName);
        })
        renderPromoTagWrapper(checklist);
    })