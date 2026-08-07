export function getColor(status) {
  var colorCss = "";
  if (status == "Ordered") {
    colorCss = "blue-bg";
  } else if (
    status == "Missingmail" ||
    status == "Returning" ||
    status == "Pending"
  ) {
    colorCss = "red-bg";
  } else if (status == "Shipped") {
    colorCss = "green-bg";
  } else if (status == "Cart") {
    colorCss = "orange-bg";
  } else if (status == "Delivered") {
    colorCss = "gray-bg";
  } else if (status == "Event") {
    colorCss = "purple-bg";
  }
  return colorCss;
}

export function getTotalPrice(orders) {
  return orders.reduce((total, order) => {
    const price = parseFloat(order.Order?.OrderPaid);
    return total + (isNaN(price) ? 0 : price);
  }, 0);
}
