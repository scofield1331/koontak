import $ from 'jquery';
import ProductPopup from './ProductPopup/ProductPopup';
import SelectPopup from './SelectPopup/SelectPopup';
import './ProductPopup/ProductPopup.css';
import './SelectPopup/SelectPopup.css';
import { ShopProduct } from '@/Object/ShopProduct';
import { ShopVariation } from '@/Object/ShopVariation';

$(document).ready(() => {
    const container = $('#contenainer');
    const popup = new ProductPopup('product-popup');
    const selectPopup = new SelectPopup('select-popup');

    if (container.data('update-popup')) return;
    container.on('click', 'tr.product', function (e) {
        const product = new ShopProduct($(this).data('item'))
        const variation = $(this).data('variation');
        const sku = Object.keys(product.Retail).find(sku => product.Retail[sku] === variation);
        const shopVariation = new ShopVariation(variation, sku);
        popup.load(product, shopVariation, $(e.currentTarget), selectPopup.getValue().toLocaleLowerCase());
    });
    container.on('click', '.col-select', function (e) {
        selectPopup.load($(e.currentTarget));
    });
    
    container.data('update-popup', true);

});