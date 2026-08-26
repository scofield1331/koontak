import { createPromoTagWrapper } from "@/Bodi/Shop/Label/PromoTagWrapper";

export const promoTagWrapper = createPromoTagWrapper({ page: "Bakery" });
promoTagWrapper.classList.add("cursor-pointer");

promoTagWrapper.addEventListener("click", (e) => {
  promoTagWrapper.print();
});
