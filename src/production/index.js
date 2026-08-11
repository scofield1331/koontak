import { createStickerElement } from "../Bakery/variation/sticker";
import { Registry } from "@/service/Registry";
import { loadInventory, updateProductionJson } from "./service";
window.Component = {
    Sticker: createStickerElement({setting: {Bakery_Goodies: false}}),
    createLoadingElement
}
window.Service = {
    Registry: new Registry(),
    loadInventory,
    updateProductionJson
}

function createLoadingElement() {
    const span = document.createElement('span');
    span.innerHTML = '🕧';
    span.style.fontSize = '16px';
    return span;
}