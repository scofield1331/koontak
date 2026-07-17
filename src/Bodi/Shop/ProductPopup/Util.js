export function calculateSavg(itemData) {
    let dateRange = getDate();
    let sold = {};
    dateRange.forEach(date => {
        if (!sold[date]) sold[date] = 0;
        if (itemData.ProductSoldWeeklyOZ && itemData.ProductSoldWeeklyOZ[date])
            sold[date] += Number(itemData.ProductSoldWeeklyOZ[date]);
        if (itemData.ProductSoldWeeklyLB && itemData.ProductSoldWeeklyLB[date])
            sold[date] += Number(itemData.ProductSoldWeeklyLB[date]);
    });
    let m = 8;
    let noOfWeeks = 0;
    let prev = false;
    let total = Object.keys(sold).reduce(function (previous, key) {
        let value = sold[key];
        if (prev !== false && prev < value / 2) {
            value = prev;
        }
        rs = previous + value * m;
        noOfWeeks += m;
        if (m > 1) m--;
        prev = sold[key];
        return rs;
    }, 0);
    var convertStockValueIns = new convertStockValueGlobal();
    total = convertStockValueIns.convertStockValue(total, 'gr', 'lb');
    return (total / noOfWeeks) * 4;
}

export function getDate() {
    let noOfWeeks = 1;
    if (window.inventoryListModel.GeneralSetting && typeof window.inventoryListModel.GeneralSetting[0].SavgWeeks !== "undefined" && window.inventoryListModel.GeneralSetting[0].SavgWeeks != '') {
        noOfWeeks = window.inventoryListModel.GeneralSetting[0].SavgWeeks;
    }
    let noOfDays = noOfWeeks * 7;
    let dateRange = [];
    let today = moment();
    let start = today;
    if (today.format('dddd') != 'Sunday')
        start = today.endOf('week').add(1, 'day');
    let from = moment().subtract(noOfDays, 'days');
    for (let i = start; i > from; i = i.subtract(7, 'days')) {
        dateRange.push(i.format('YYYY-MM-DD'));
    }
    return dateRange;
}

export function calculateStockTotal(product) {
    let retails = window.Calculation.getRetailsByStockLocation(product, 'Shop');
    let convert = new window.convertStockValueGlobal();
    let stockTotal = retails.reduce((total, retail) => {
        let unit = window.Calculation.getUnit(retail.RetailUnit);
        let stockretailshop = retail.StockRetailShop / convert.convertStockValue(retail.RetailSize, retail.RetailUnit, unit);
        return total + stockretailshop;
    }, 0)
    return stockTotal
}

export function getDateExpiration(product) {
    if (product.Suppliers.length) {
        for (var i = 0; i < product.Suppliers.length; i++) {
            if (product.Suppliers[i].DateExpiration) {
                let dateExpiration = moment(product.Suppliers[i].DateExpiration);
                return dateExpiration;
            }
        }
    }
    return false;
}
export function slugify(string) {
    return string
        .replace(/ /g, '_');
}
