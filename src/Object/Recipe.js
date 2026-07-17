import { Step } from './Step';
export class Recipe {
    constructor(data = {}) {
        this.RecipeFormat = data.RecipeFormat ?? '';
        this.RecipeName = data.RecipeName ?? '';
        this.RecipeDate = data.RecipeDate ?? '';
        this.RecipeQuantity = data.RecipeQuantity ?? '';
        this.Serving = data.Serving ?? '';
        this.RecipeCost = data.RecipeCost ?? '';
        this.RecipeTime = data.RecipeTime ?? '';

        this.Steps = (data.Steps ?? []).map(stepData => Step.create(stepData));
    }

    toArray() {
        return {
            RecipeFormat: this.RecipeFormat,
            RecipeName: this.RecipeName,
            RecipeDate: this.RecipeDate,
            RecipeQuantity: this.RecipeQuantity,
            Serving: this.Serving,
            RecipeCost: this.RecipeCost,
            RecipeTime: this.RecipeTime,
            Steps: this.Steps.map(s => s.toArray()),
        };
    }
}