export class Cart {

    static #instance = null;

    constructor() {
        if (Cart.#instance) {
            return Cart.#instance;
        }
        let cookie = getCookie("shoppingCart");
        this.cart = cookie ? JSON.parse(cookie) : [];
        Cart.#instance = this;
    }

    static getInstance() {
        if (!Cart.#instance) {
            Cart.#instance = new Cart();
        }
        return Cart.#instance;
    }

    add(cartItem) {
        for (let i = 0; i < this.cart.length; i++) {
            if (this.cart[i].name === cartItem.name) {
                this.cart[i] = cartItem;
                return;;
            }
        }
        this.cart.push(cartItem);
    }
    get() {
        return this.cart;
    }
}