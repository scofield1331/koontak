import { registry } from '@/service/Registry';

export function getServing(product) {
    if (!registry.isset('conversion')) {
        registry.register('conversion', new window.convertStockValueGlobal());
    }
    const conversion = registry.get('conversion');
    if (!product.Dosage?.DosageMinimum) {
        return 'as desired';
    }
    let ProductVolume = eval(product.ProductVolume);
    let ProductWeight = eval(product.ProductWeight);
    let ServingRecomenation = eval(product.Dosage.DosageMinimum);
    let DosageUnit = product.Dosage.DosageUnit;
    let serving = 0;
    switch (DosageUnit.toLowerCase()) {
        case 'as desired':
            return DosageUnit;
            break;
        case 'mg':
            serving = ProductWeight * ServingRecomenation / 1000 / ProductVolume;
            break;
        case 'ml':
            serving = $servingRecommendation;
            break;
        case 'capsule':
            return `${ServingRecomenation} ${DosageUnit}`;
            break;
        default:
            serving = ProductWeight * ServingRecomenation / ProductVolume;
    }
    let ServingRecomenationTeaspoon = conversion.convertTeaspoonValue(serving, 'ml', 'teaspoon');
    return `${ServingRecomenationTeaspoon} teaspoon`;
}