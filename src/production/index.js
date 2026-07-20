import { createStickerElement } from "../Bakery/variation/sticker";
import { Registry } from "@/service/Registry";
window.Component = {
    Sticker: createStickerElement({setting: {Bakery_Goodies: false}}),
}
window.Service = {
    Registry: new Registry()
}