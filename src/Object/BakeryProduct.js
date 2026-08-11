import { Product } from "./Product";

export class BakeryProduct extends Product {
  Recipe = [];
  Instruction = '';
  constructor(data = {}) {
    super(data, false);
    this.hydrate(data);
  }
}
