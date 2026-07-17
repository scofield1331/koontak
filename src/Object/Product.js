export class Product {
    constructor(data = {}) {
        this.data = data;
        this.category = '';
        this.Product = ""
        this.Brand = ""
        this.SubCategory = ""
        this.ProductVolume = ""
        this.ProductWeight = ""
        this.Shipping = ""
        this.Discounting = ""
        this.StockMin = ""
        this.ProductSoldWeeklyRecipe = []
        this.ProductSoldWeeklyWholesale = []
        this.ProductSoldWeeklyOZ = []
        this.ProductSoldWeeklyLB = []
        this.Retail = {}
        this.SuppliersPricing = []
        this.Suppliers = []
        this.StoreListingASIN = {}
        this.CategoryStoreAccount = {}
        this.FixComments = ""
        this.Title = {}
        this.ProductList = []
        this.Produced = ""
        this.Manufacturer = ""
        this.OtherNames = ""
        this.Description = ""
        this.Benefits = {}
        this.Objectives = ""
        this.Usage = ""
        this.Dosage = {}
        this.Ingredients = ""
        this.Nutritional = ""
        this.Recipeideas = ""
        this.Warning = ""
        this.CertifieldLogo = []
        this.BatchNo = ""
        this.ActiveIngredient = ""
        this.Analysis = []
        this.Images = []

        this.hydrate(data)
    }

    // ── Hydrate ───────────────────────────────────────────

    hydrate(data) {
        this.merge(this, data)
        if (!data.Product) console.log("missing Product")
        if (!data.category) console.log("missing category")
        return this
    }

    merge(target, source) {
        for (const key in source) {
            if (
                source[key] !== null &&
                target[key] !== undefined
            ) {
                target[key] = source[key]
            }
        }
    }
    // ── Get ───────────────────────────────────────────────
    get(key) {
        return this[key] ?? null
    }
    // ── Set ───────────────────────────────────────────────
    set(key, value) {
        this[key] = value
        return this
    }

    // ── Serialize ─────────────────────────────────────────
    toJSON() {
        return Object.keys(this).reduce((obj, key) => {
            obj[key] = this[key]
            return obj
        }, this.data)
    }   
    getImageName() {
        return this.Product
            .replace(/ /g, '_')
            .replace(/[:\/'"?@#$%&*()\-+|<>]/g, '')
    }
    slugify() {
        return this.Product
            .replace(/ /g, '_');
    }

    getThumbnailId() {
        if (Array.isArray(this.Images) && this.Images.length) {
            let images = this.Images.sort((a, b) => parseInt(isNaN(a.sequence)?0:a.sequence) - parseInt(isNaN(b.sequence)?0:b.sequence));
            return images[0]?.path ?? 0;
        }
        return 1;
    }
}
