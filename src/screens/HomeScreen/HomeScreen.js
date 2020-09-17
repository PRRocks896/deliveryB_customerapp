import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Home } from "../../components";
import {
  firebaseDataManager
} from "../../apis";
import {
  setUserData,
  setCategories,
  setWishlist,
  setShippingAddress,
  setShoppingBag,
  setProductPricesBYQty,
  setProducts,
  loadOrderHistory
} from "../../redux/";
import {  BackHandler } from "react-native";
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldUpdate: false,
      isProductDetailVisible: false,
      product: {},
      productDetails: {},
      category: [],
      asyncAddBagArray: [],
      alreadyAddecart: false
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    this.loadFromDatabase();
    this.setWishlistState();
    this.setShippingAddress();
    // this.getCaegory()
  }
  /**
     * for back to prev screen
     */
  handleBackButtonClick() {
    BackHandler.exitApp();
    return true;
  }
  /**
   * check item already added or not
   */
  componentDidUpdate = async () => {
    if (this.state.shouldUpdate === false && this.props.allProducts.length) {
      this.setState({
        shouldUpdate: true
      });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  setWishlistState = () => {
    if (this.props.user.wishlist) {
      this.props.user.wishlist.map(wishlist => {
        this.props.setWishlist(wishlist);
      });
    }
  };

  onCardPress = item => {
    this.setState({
      product: item,
      productDetails: item.productDetail ? item.productDetail : item,
      isProductDetailVisible: !this.state.isProductDetailVisible,
    });
  };

  /**
   * 
   * @param {any} item category name
   * on press category 
   */
  onCategoryPress = item => {
    // console.log("category", item)
    this.props.navigation.navigate("CategoryProductGrid", {
      title: item.name,
      categoryId: item._id,
      products: item.products ? item.products : item,
      appConfig: this.appConfig
    });
  };

  onFavouritePress = async item => {
    item.isFavourite = !item.isFavourite;
    this.setState({ product: item });

    this.props.setWishlist(item);

    await firebaseDataManager.setUserWishList(
      this.props.user.id,
      this.props.wishlist
    );
  };

  /**
   * 
   * @param {any} item added item
   * add to cart api call here
   */
  onAddToBag = async (item) => {
    console.log("calllllllllllll",item)
    this.setState({isProductDetailVisible : false})
    const {alreadyAddecart} = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart)
  };
/**
 * On model Cancle
 */
  onModalCancel = () => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };
  render() {
    return (
      <Home
        navigation={this.props.navigation}
        shippingMethods={this.props.shippingMethods}
        onCardPress={this.onCardPress}
        onFavouritePress={this.onFavouritePress}
        onCategoryPress={this.onCategoryPress}
        onAddToBag={this.onAddToBag}
        product={this.state.product}
        productDetails={this.state.productDetails}
        isProductDetailVisible={this.state.isProductDetailVisible}
        onModalCancelPress={this.onModalCancel}
        appConfig={this.appConfig}
        alreadyAddecart={this.state.alreadyAddecart}
      />
    );
  }
}

HomeScreen.propTypes = {
  navigation: PropTypes.object,
  categories: PropTypes.array,
  allProducts: PropTypes.array,
  shippingMethods: PropTypes.array,
  user: PropTypes.object,
  stripeCustomer: PropTypes.string,
  productPricesByQty: PropTypes.array,
  wishlist: PropTypes.array,
  setUserData: PropTypes.func,
  setCategories: PropTypes.func,
  setWishlist: PropTypes.func,
  setShippingAddress: PropTypes.func,
  setProducts: PropTypes.func,
  setShoppingBag: PropTypes.func,
  setProductPricesBYQty: PropTypes.func
};

const mapStateToProps = ({ products, checkout, app }) => {
  return {
    categories: products.categories,
    allProducts: products.allProducts,
    shippingMethods: checkout.shippingMethods,
    user: app.user,
    stripeCustomer: app.stripeCustomer,
    productPricesByQty: products.productPricesByQty,
    wishlist: products.wishlist
  };
};

export default connect(
  mapStateToProps,
  {
    setUserData,
    setCategories,
    setWishlist,
    setShippingAddress,
    setProducts,
    setShoppingBag,
    setProductPricesBYQty,
    loadOrderHistory
  }
)(HomeScreen);
