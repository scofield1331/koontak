// ---------- Step classes ----------

export class Step {
  constructor(raw) {
    this.Step = raw.Step;
    this.isDeleted = false;
  }

  static create(raw) {
    if ("Instruction" in raw) return new InstructionStep(raw);
    if ("SubTotal" in raw) return new SubTotalStep(raw);
    if ("Ingredient" in raw) return new IngredientStep(raw);
    if ("diagram" in raw) return new DiagramStep(raw);
    
    return new Step(raw);
  }

  toArray() {
    return { Step: this.Step };
  }
}

class InstructionStep extends Step {
  constructor(raw) {
    super(raw);
    this.type = 'instruction';
    this.Instruction = raw.Instruction;
  }

  toArray() {
    return { ...super.toArray(), Instruction: this.Instruction };
  }
}

class SubTotalStep extends Step {
  constructor(raw) {
    super(raw);
    this.type = 'subtotal';
    this.SubTotal = raw.SubTotal;
  }

  toArray() {
    return { ...super.toArray(), SubTotal: this.SubTotal };
  }
}

class IngredientStep extends Step {
  constructor(raw) {
    super(raw);
    this.type = 'ingredient';
    this.Format = raw.Format;
    this.Ingredient = raw.Ingredient;
    this.StepQuantity = parseFloat(raw.StepQuantity) || 0;
    this.StepMultiplier =
      raw.StepMultiplier === "true" || raw.StepMultiplier === true;
  }

  toArray() {
    return {
      ...super.toArray(),
      Format: this.Format,
      Ingredient: this.Ingredient,
      StepQuantity: String(this.StepQuantity),
      StepMultiplier: String(this.StepMultiplier),
    };
  }
}

class DiagramStep extends Step {
  constructor(raw) {
    super(raw);
    this.type = 'diagram';
    this.diagram = raw.diagram;
    this.image = raw.image;
  }

  toArray() {
    return {
      ...super.toArray(),
      diagram: this.diagram,
      image: this.image,
    };
  }
}

