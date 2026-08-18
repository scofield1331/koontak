export function createList(props) {
    const element = document.createElement('div');
    element.id = 'ProductList';
    element.className = 'table-list d-md-block overflow-auto';
    element.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    `;

    element.update = ({ products }) => {
        element.innerHTML = `
            <table class="main-products-table">
            <tbody>
            </tbody>
            </table>
        `;
        products.forEach(product => {
            const row = createProduct({ product: product, ...props });
            element.querySelector('tbody').append(row);
        })
    }
    element.insert = ({ product }) => {
        const row = createProduct({ product: product, ...props });
        element.querySelector('tbody').prepend(row);
    }

    return element;
}

function createProduct({ product, loadProduct, hideProductList }) {
    const element = document.createElement('tr');
    element.className = 'product';
    element.innerHTML = `
        <td id="eachProduct" class="product-item-i row-Bakery_Goodies">${product.Product}</td>
    `;

    element.addEventListener('click', e => {
        loadProduct(product, element);
        hideProductList();
    })
    return element;
}