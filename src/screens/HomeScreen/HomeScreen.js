import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Home } from "../../components";
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
import { BackHandler , TouchableOpacity, Text} from "react-native";
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";
import getCategory from "../../services/Products/getCategory";
import getProducts from "../../services/Products/getproducts";
import RazorpayCheckout from 'react-native-razorpay';
import refreshTokenService from "../../services/RefreshToken";
import AsyncStorage from "@react-native-community/async-storage";
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
      alreadyAddecart: false,

      categoryProduct: [],
      fetauredproducts: []
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getCategoryProducts() // For get categories
        this.getFeaturedProducts() // For get products

      });
  }
  tokengenerate = async () => {
   let rewToken = await AsyncStorage.getItem('reqToken')
   let userid = await  AsyncStorage.getItem("userId")
    let body = JSON.stringify({
      id:userid,
      reqToken:rewToken
    })
    console.log("body==========", body)
    const reponse  = await refreshTokenService(body)
    console.log("response==== of refresh token", reponse)
    AsyncStorage.setItem('TOKEN', reponse.xauthtoken)
    this.getCategoryProducts() // For get categories
    this.getFeaturedProducts() // For get products
    // this.loadFromDatabase();
    this.setWishlistState();
    this.setShippingAddress();
    // this.getCaegory()
  }

  async componentDidMount() {
    this.tokengenerate()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  getCategoryProducts = async () => {

    const data = await getCategory();
    // console.log("Category====================", data)
    if (data.success) {
      this.setState({ categoryProduct: data.data })
    }
  }
  getFeaturedProducts = async () => {
    const data = await getProducts();

    if (data.success) {
      this.setState({ fetauredproducts: data.data })
    }
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
    console.log("category press", item)
    this.props.navigation.navigate("CategoryProductGrid", {
      title: item.name,
      categoryId: item._id,
      products: item.products ? item.products : item,
      appConfig: this.appConfig
    });
  };



  /**
   * 
   * @param {any} item added item
   * add to cart api call here
   */
  onAddToBag = async (item, color, size, quentity, selectedshopID) => {

    this.setState({ isProductDetailVisible: false })
    const { alreadyAddecart } = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart, color, size, quentity, selectedshopID)
  };
  /**
   * On model Cancle
   */
  onModalCancel = () => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };

  razorpayfun = () => {
    var options = {
      description: 'Credits towards consultation',
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_live_5dM1OK63yl61hL', // Your api key
      amount: '5000',
      name: 'foo',
      prefill: {
        email: 'void@razorpay.com',
        contact: '9191919191',
        name: 'Razorpay Software'
      },
      theme: {color: '#F37254'}
    }
    RazorpayCheckout.open(options).then((data) => {
      // handle success
      alert(`Success: ${data.razorpay_payment_id}`);
    }).catch((error) => {
      // handle failure
      alert(`Error: ${error.code} | ${error.description}`);
    });
  }
  render() {
    return (
      <>
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
        categoryproducts={this.state.categoryProduct}
        featuredproduct={this.state.fetauredproducts}
      />
      </>
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
