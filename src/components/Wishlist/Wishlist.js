import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import ProductGrid from "../ProductGrid/ProductGrid";
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import styles from "./styles";

function Wishlist(props) {
  const {
    extraData,
    data,
    onCardPress,
    product,
    onAddToBag,
    onModalCancel,
    onFavouritePress,
    shippingMethods,
    isProductDetailVisible,
    appConfig
  } = props;

  return (
    <View style={styles.container}>
      <ProductGrid
        products={data}
        onCardPress={onCardPress}
        itemContainerStyle={{ alignItems: "center" }}
        extraData={extraData}
        appConfig={appConfig}
      />
      <ProductDetailModal
        item={product}
        shippingMethods={shippingMethods}
        visible={isProductDetailVisible}
        onFavouritePress={onFavouritePress}
        onAddToBag={onAddToBag}
        onCancelPress={onModalCancel}
        appConfig={appConfig}
      />
    </View>
  );
}

Wishlist.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  navigation: PropTypes.func,
  extraData: PropTypes.object,
  productPricesByQty: PropTypes.array,
  user: PropTypes.object,
  wishlist: PropTypes.array,
  shippingMethods: PropTypes.array,
  stripeCustomer: PropTypes.string,
  onCardPress: PropTypes.func,
  product: PropTypes.object,
  onAddToBag: PropTypes.func,
  onModalCancel: PropTypes.func,
  onFavouritePress: PropTypes.func,
  isProductDetailVisible: PropTypes.bool
};

export default Wishlist;
