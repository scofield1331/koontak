import { Product } from '@/Object/Product';
export class ShopProduct extends Product {
    constructor(data = {}) {
        super(data);
        this.OrderItem = [];
        if (data.OrderItem !== undefined) {
            this.OrderItem = data.OrderItem;
        }
    }
}