export async function getExclusiveProduct() {
  const request = await fetch(
    "../Bodi/retail/order-template.php?action=getExclusiveProduct",
  );
  const response = request.json();
  return response;
}
const audio = new Audio("../Bodi/retail/sounds/sound0.mp3");

export function soundAlert(msg) {
  audio.play();
  alert(msg);
  audio.pause();
  audio.currentTime = 0;
}
