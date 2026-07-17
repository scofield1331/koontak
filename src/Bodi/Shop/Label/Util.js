import { Product } from '@/Object/Product';
const products = {};
const pendingRequest = {};
export function search(list, productName) {
    return list.find(item => item.product == productName);
}
export function findProduct(productName, category) {
    if (!pendingRequest[productName]) {
        pendingRequest[productName] = new Promise(resolve => {
            if (products[productName]) {
                resolve(products[productName]);
            } else {
                loadProduct(category, productName).then(product => {
                    products[productName] = new Product(product);
                    resolve(product);
                });
            }
            delete pendingRequest[productName];
        })
    }

    return pendingRequest[productName];
}

function loadProduct(format, product) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            dataType: 'json',
            url: '../Bodi/shop/Label/shoplabel-template.php?action=getSingleRecord',
            data: {
                Format: format,
                Product: product
            }
        }).done(response => {
            if (response.success) {
                resolve(response.product);
            } else {
                alert(response.error);
                reject(response);
            }
        })
    })
}

