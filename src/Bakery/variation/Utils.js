import { registry } from "@/service/Registry";
export function isExist(value, options) {
  for (let index = 0; index < options.length; index++) {
    if (options[index].value == value) {
      return options[index].label;
    }
  }
  return false;
}
export function isLabelExist(label, options) {
  for (let index = 0; index < options.length; index++) {
    if (options[index].label == label) {
      return options[index].value;
    }
  }
  return false;
}
export function findOptionByLabel(label, options) {
  for (let index = 0; index < options.length; index++) {
    if (options[index].label == label) {
      return options[index];
    }
  }
  return false;
}
export function isExistInConfig(value, config) {
  for (const key in config) {
    if (Array.isArray(config[key].options)) {
      for (let index = 0; index < config[key].options.length; index++) {
        if (config[key].options[index].value == value) {
          return config[key].options[index].label;
        }
      }
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

export function findStep(value, steps) {
  for (const key in steps) {
    const step = steps[key];
    for (let index = 0; index < step.options.length; index++) {
      const option = step.options[index];
      if (option.value == value) {
        return { key, step };
      }
    }
  }
  return false;
}
export function findStepByLabel(label, steps) {
  for (const key in steps) {
    const step = steps[key];
    for (let index = 0; index < step.options.length; index++) {
      const option = step.options[index];
      if (option.label == label) {
        return { key, step };
      }
    }
  }
  return false;
}
export function deepCompare(a, b) {
  if (a === b) return true; // same primitive or same reference

  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;

  // Arrays
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepCompare(val, b[i]));
  }

  // Dates
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }

  // Plain objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepCompare(a[key], b[key]),
  );
}
export function isSkuExist(sku, currentProductName, products) {
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    if (product.Product == currentProductName) continue;
    for (const key in product.Retail) {
      if (key == sku) {
        return product;
      }
    }
  }
  return false;
}
export const defaultRecipeStep = {
  Step: 0,
  Ingredient: "",
  Format: "",
  Type: "",
  StepQuantity: 0,
};

export function findSupplier(suppliers) {
  const date = formatDate();
  for (let index = 0; index < suppliers.length; index++) {
    const supplier = suppliers[index];
    if (supplier.Supplier == `Bodi Nutritions_${date}`) {
      return supplier;
    }
  }
  return false;
}
export function formatDate(date = new Date()) {
  if (registry.isset("timezone")) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: registry.get("timezone"),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    formatter.format(date);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
