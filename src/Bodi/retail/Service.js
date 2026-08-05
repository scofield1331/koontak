export async function getExclusiveProduct() {
    const request = await fetch('../Bodi/retail/order-template.php?action=getExclusiveProduct');
    const response = request.json();
    return response;
}