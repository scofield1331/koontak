import { Images } from "@/Bakery/images";

export class PurchaseImages extends Images {
  constructor(id, { page }) {
    super(id, { page });
    this.baseUrl = "../Bakery/";
  }
  triggerChangeEvent() {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.updateProduct();
    }, 500);
  }
  updateProduct() {
    const item = this.page.getProduct();
    let log = {
      category: item.category,
      product: item.Product,
      datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
      replace: 1,
      change: {
        Images: this.get()
      },
    };
    $.ajax({
      method: "POST",
      dataType: "json",
      url: this.baseUrl + "/dispatcher.php?action=update",
      contentType: "application/json",
      data: JSON.stringify(log),
    }).then((rs) => {
      if (rs.success) {
        if (rs.Product && rs.Product != log.product) {
          this.page.getProduct().Product = rs.Product;
        }
      } else {
        alert(rs.error);
      }
    });
  }
}
