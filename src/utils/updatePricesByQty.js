export const updatePricesByQty = (product, productPricesByQty, callback) => {

  const tempProductPricesByQty = [...productPricesByQty];
  let found = tempProductPricesByQty.some(i => i.productId == product.productId)
  if (found == true) {
    let index = tempProductPricesByQty.findIndex(i => i.productId == product.productId)
    tempProductPricesByQty[index].qty = product.qty;
    tempProductPricesByQty[index].totalPrice = product.totalPrice;
  }
  else {
    tempProductPricesByQty.push(product);
  }

  callback(tempProductPricesByQty);
};
