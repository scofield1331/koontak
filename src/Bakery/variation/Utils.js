export function isExist(value, options) {
  for (let index = 0; index < options.length; index++) {
    if (options[index].value == value) {
      return options[index].label;
    }
  }
  return false;
}

export function findRecipe(value, recipes) {
  for (let index = 0; index < recipes.length; index++) {
    const recipe = recipes[index];
    if (recipe.RecipeName == value) return recipe;
  }
  return false;
}

export function findProduct(value, products) {
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    if (product.Product == value) return product;
  }
  return false;
}

export function matchSizeUnit(value) {
  return value.match(/(\d+)([a-zA-Z]+)$/);
}