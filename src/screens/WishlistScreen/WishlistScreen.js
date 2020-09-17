import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { firebaseDataManager } from "../../apis";
import { Wishlist } from "../../components";
import {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
} from "../../redux/";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import addtobag from "../../services/AddToBag";
import { Alert, AsyncStorage } from 'react-native'
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";

class WishlistScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProductDetailVisible: false,
      product: {},
      alreadyAddecart:false

    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
  }

  onAddToBag = async (item) => {
    this.setState({isProductDetailVisible : false})
    const {alreadyAddecart} = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart)

  };

  onCardPress = item => {
    this.setState({
      product: item,
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };

  onFavouritePress = async item => {
    item.isFavourite = !item.isFavourite;
    this.setState({ product: item });
    await this.props.setWishlist(item);

    await firebaseDataManager.setUserWishList(
      this.props.user.id,
      this.props.wishlist
    );
  };

  onModalCancel = () => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };

  render() {
    return (
      <Wishlist
        data={this.props.wishlist}
        shippingMethods={this.props.shippingMethods}
        onCardPress={this.onCardPress}
        product={this.state.product}
        onAddToBag={this.onAddToBag}
        onModalCancel={this.onModalCancel}
        onFavouritePress={this.onFavouritePress}
        isProductDetailVisible={this.state.isProductDetailVisible}
        appConfig={this.appConfig}
      />
    );
  }
}

WishlistScreen.propTypes = {
  user: PropTypes.object,
  wishlist: PropTypes.array,
  shippingMethods: PropTypes.array,
  productPricesByQty: PropTypes.array,
  setWishlist: PropTypes.func,
  setShoppingBag: PropTypes.func,
  setProductPricesBYQty: PropTypes.func
};

const mapStateToProps = ({ products, app, checkout }) => {
  return {
    user: app.user,
    wishlist: products.wishlist,
    shippingMethods: checkout.shippingMethods,
    productPricesByQty: products.productPricesByQty,
    stripeCustomer: app.stripeCustomer
  };
};

export default connect(mapStateToProps, {
  setShoppingBag,
  setProductPricesBYQty,
  setWishlist
})(WishlistScreen);
