import React from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import ProductGrid from "../ProductGrid/ProductGrid";
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import styles from "./styles";

function Search(props) {
  const {
    extraData,
    products,
    onModalCancel,
    onAddToBag,
    onCardPress,
    onFavouritePress,
    product,
    shippingMethods,
    isProductDetailVisible,
    appConfig
  } = props;
  return (
    <View style={styles.container}>
      <ProductGrid
        appConfig={appConfig}
        products={products}
        onCardPress={onCardPress}
        itemContainerStyle={{ alignItems: "center" }}
        extraData={extraData}
      />
      <ProductDetailModal
        onFavouritePress={onFavouritePress}
        item={product}
        shippingMethods={shippingMethods}
        visible={isProductDetailVisible}
        onAddToBag={onAddToBag}
        onCancelPress={onModalCancel}
        appConfig={appConfig}
      />
    </View>
  );
}

Search.propTypes = {
  title: PropTypes.string,
  products: PropTypes.array,
  SearchScreen: PropTypes.array,
  navigation: PropTypes.func,
  extraData: PropTypes.object,
  productPricesByQty: PropTypes.array,
  user: PropTypes.object,
  wishlist: PropTypes.array,
  shippingMethods: PropTypes.array,
  stripeCustomer: PropTypes.string,
  onModalCancel: PropTypes.func,
  onAddToBag: PropTypes.func,
  onCardPress: PropTypes.func,
  onFavouritePress: PropTypes.func,
  product: PropTypes.func,
  isProductDetailVisible: PropTypes.bool
};

export default Search;
