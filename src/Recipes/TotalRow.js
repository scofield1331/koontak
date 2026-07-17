import { calculateTotal } from "./Utils";
export function createTotalRowElement(props) {
  const {weight, serving, cost} = calculateTotal(props);
  const e = document.createElement("div");
  e.innerHTML = /* HTML */ ` <div class="step-row total-row">
    <div class="Step ui-sortable-handle">
      <span id="Step"></span><input data-name="Step" type="hidden" value="1" />
    </div>
    <div class="Ingredient"></div>
    <div class="StepVolumeTotal"></div>
    <div class="StepWeightTotal">
      <span class="total-weight-border"
        ><span class="unit-gr">${Math.round(weight*100)/100}</span></span
      >
    </div>
    <div class="StepQuantityTotal">${(Math.round(serving*100)/100).toFixed(3)}</div>
    <div class="Total">
    </div>
    <div class="ItemCost">$${Math.round(cost*100)/100}</div>
  </div>`;
  return e;
}
