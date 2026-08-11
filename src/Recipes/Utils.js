const noCalculateFormat = ["Packaging"];
const ProductUnitNotCountInTotal = ["item"];
export function calculateTotal({ recipe, inventories }) {
  const calculator = window.Service.Registry.get("calculator");
  let stepWeightTotal = 0;
  let stepQuantityTotal = 0;
  let itemCostTotal = 0;
  for (var i = recipe.Steps.length - 1; i >= 0; i--) {
    const step = recipe.Steps[i];
    if (step.type == "ingredient") {
      const item = findProduct(step.Ingredient, step.Format, inventories);
      const supplierpricing = item ? calculator.pickSupplier(item) : false;
      const unit = supplierpricing ? supplierpricing.SupplierUnit : "unknown";
      if (noCalculateFormat.indexOf(step.Format) < 0) {
        stepWeightTotal += getStepWeight(recipe, step);
      }
      stepQuantityTotal += Number(
        step.StepQuantity && countInTotal(unit) ? step.StepQuantity : 0,
      );
      itemCostTotal += getItemCost(recipe, step, item);
    }
  }
  return {
    weight: stepWeightTotal,
    serving: stepQuantityTotal,
    cost: itemCostTotal,
  };
}

function findProduct(name, format, inventories) {
  for (var i = 0; i < inventories.length; i++) {
    if (inventories[i].format == format) {
      for (let j = 0; j < inventories[i].data.length; j++) {
        if (inventories[i].data[j].Product == name) {
          return inventories[i].data[j];
        }
      }
    }
  }
  return false;
}
function getStepWeight(recipe, step) {
  let stepWeight = step.StepQuantity;
  let purchaseQuantity;
  if (step.StepMultiplier) {
    purchaseQuantity = recipe.RecipeQuantity * recipe.Serving;
  } else {
    purchaseQuantity = recipe.Serving;
  }
  stepWeight = Math.round(stepWeight * purchaseQuantity * 1000) / 1000;
  if (stepWeight >= 4.499) stepWeight = Math.round(stepWeight);
  return stepWeight;
}
function countInTotal(productType) {
  return (
    productType &&
    ProductUnitNotCountInTotal.indexOf(productType.toLowerCase()) < 0
  );
}
function getItemCost(recipe, step, item) {
  const calculator = window.Service.Registry.get("calculator");
  let itemCost = 0;
  let purchaseQuantity =
    recipe.RecipeQuantity * (countInTotal(step.Format) ? recipe.Serving : 1);
  if (item) {
    let supplierData = calculator.pickSupplier(item);
    let supplierType = Calculation.getSupplierType(
      supplierData["SupplierUnit"],
    );
    let costAvgLast = Calculation.calculateCostAvg(
      supplierData,
      supplierType.StockUnit,
    );
    itemCost = calculateItemCost(
      item,
      step,
      purchaseQuantity,
      recipe,
      costAvgLast,
    );
  } else {
    itemCost = calculateItemCostForNonInventory(
      step,
      recipe,
      purchaseQuantity,
      recipe,
    );
  }
  itemCost = Math.round(itemCost * 1000) / 1000;
  return itemCost;
}
function calculateItemCost(
  inventoryItem,
  step,
  purchaseQuantity,
  recipeItem,
  costAvgLast = 0,
) {
  var itemCost = 0;
  if (costAvgLast == 0) {
    costAvgLast = calculateCostAvgLast(inventoryItem);
  }
  if (step.Format == "Packaging") {
    itemCost += step.StepQuantity * recipeItem.RecipeQuantity * costAvgLast;
  } else {
    itemCost = step.StepQuantity * purchaseQuantity * costAvgLast;
  }
  return itemCost;
}

function calculateItemCostForNonInventory(
  step,
  recipe,
  purchaseQuantity,
  recipeItem,
) {
  var itemCost = 0;

  // FACTORS FOR PRODUCTION TIME ???
  if (step.Instruction && step.Instruction.toLowerCase() == "add label") {
    itemCost = step.StepQuantity * 0.2666;
  } else if (
    step.Instruction &&
    step.Instruction.toLowerCase() == "production time"
  ) {
    if (parseFloat(recipeItem.RecipeQuantity) > 0) {
      itemCost =
        (recipeItem.RecipeTime / parseFloat(recipeItem.RecipeQuantity)) *
        0.2666;
    } else {
      itemCost = 0;
    }
  }
  itemCost = parseFloat((itemCost * recipeItem.Serving) / purchaseQuantity);
  return itemCost;
}
function pickSupplier(itemData) {
  let supplierpricing = itemData.SuppliersPricing;
  let costPickSupplier = false;
  if (Array.isArray(supplierpricing))
    costPickSupplier = supplierpricing.find(
      (supplier) => supplier.CostPick && supplier.CostPick == "yes",
    );
  return costPickSupplier;
}
function calculateCostAvgLast(itemData) {
  let self = this;
  var costAvgLast = 0;
  let pickedSupplier = pickSupplier(itemData);
  if (pickedSupplier) {
    itemData.Freight = parseFloat(pickedSupplier.Freight);
    costAvgLast = this.calculateCostAvg(pickedSupplier);
  }
  return costAvgLast;
}
function calculateCostAvg(supplier) {
  let unit = supplier.SupplierUnit;
  let cost = supplier.Cost;
  let volume = supplier.SupplierSize;
  let supplierName = supplier.Supplier;
  let unitSize = supplier.StockUnit;
  let currency = supplier.Currency ? supplier.Currency : "usd";
  var costAvg = 0;
  if (unit == null) {
    unit = "";
  }
  if (volume == 0 || volume == "" || volume == null) {
    volume = 0;
  }
  if (cost == null || cost == "") {
    cost = 0;
  }
  if (volume != 0) {
    var convertStockValueIns = new convertStockValueGlobal();
    costAvg =
      parseFloat(cost) /
      convertStockValueIns.convertStockValue(
        parseFloat(volume),
        unit,
        unitSize,
      );
  }
  var moneyRates = getMoneyRates();
  var moneyRate;
  switch (currency) {
    case "cad":
      moneyRate = moneyRates.cADUSDRate;
      break;
    case "eur":
      moneyRate = moneyRates.eURUSDRate;
      break;
    default:
      moneyRate = 1;
  }
  costAvg *= moneyRate;
  let freight = supplier.Freight ? parseFloat(supplier.Freight) : 0;
  costAvg = (costAvg + costAvg * freight).toFixed(4);
  costAvg = parseFloat(costAvg);
  return Math.round(costAvg * 1000) / 1000;
}
function getMoneyRates() {
  return {
    cADUSDRate: cADUSDRate,
    eURUSDRate: eURUSDRate,
    iNRUSDRate: iNRUSDRate,
  };
}
