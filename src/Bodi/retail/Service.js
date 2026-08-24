export async function getExclusiveProduct() {
    const request = await fetch('../Bodi/retail/order-template.php?action=getExclusiveProduct');
    const response = request.json();
    return response;
}

export function soundAlert(msg) {
    const audio = new Audio('../Bodi/retail/sounds/sound0.mp3');
    audio.play();
    alert(msg);
}