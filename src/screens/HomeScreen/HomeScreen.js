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
import AsyncStorage from "@react-native-community/async-storage";
import addtobag from "../../services/AddToBag/index";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import { Alert, BackHandler } from "react-native";
import { EventRegister } from 'react-native-event-listeners'

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
    this.unsubscribeFirebaseData();

  }

  loadFromDatabase = () => {
    this.subscribeFirebaseData();
  };

  getFirbaseUserData = async () => {
    const data = await firebaseDataManager.getUserData(this.props.user.id);
    return data;
  };

  updateUserData = async updatedUser => {
    if (updatedUser.success) {
      await this.props.setUserData({
        user: updatedUser.data,
        stripeCustomer: this.props.stripeCustomer
      });
    }
  };

  subscribeFirebaseData = async () => {
    const data = await this.getFirbaseUserData();
    this.updateUserData(data);
    this.unsubscribeProducts = firebaseDataManager.subscribeProducts(
      this.loadProducts
    );
    this.unsubscribeCategories = firebaseDataManager.subscribeCategories(
      this.loadCategories
    );
    this.unsubscribeOrders = firebaseDataManager.subscribeOrders(
      this.props.user.id,
      this.setOrderHistory
    );
  };

  setOrderHistory = orders => {
    this.props.loadOrderHistory(orders);
  };

  unsubscribeFirebaseData = () => {
    this.unsubscribeProducts && this.unsubscribeProducts();
    this.unsubscribeCategories && this.unsubscribeCategories();
    this.unsubscribeOrders && this.unsubscribeOrders();
  };

  setWishlistState = () => {
    if (this.props.user.wishlist) {
      this.props.user.wishlist.map(wishlist => {
        this.props.setWishlist(wishlist);
      });
    }
  };

  setShippingAddress = () => {
    if (this.props.user.shippingAddress) {
      this.props.setShippingAddress(this.props.user.shippingAddress);
    } else if (this.props.user.shipping) {
      this.props.setShippingAddress(this.props.user.shipping);
    }
  };

  onCardPress = item => {

    this.setState({
      product: item,
      productDetails: item.productDetail ? item.productDetail : item,
      isProductDetailVisible: !this.state.isProductDetailVisible,
    });
  };

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
    // console.log("calllllllllllll")
    // New added for add to bag, call api
    let userid = await AsyncStorage.getItem('userId')
    let products = []
    let found;
    const getdata = await getbagproduct(userid)
    // console.log("getdata=======================",getdata)
    if (getdata.data !== null) {
      found = getdata.data.some(i => i.products[0].product_id.id == item.productDetail._id)
      console.log("Found", found)

      if (found == false) {
        this.setState({ isProductDetailVisible: false });
        products.push({
          product_id: item.productDetail._id,
          price: item.productDetail.price,
          quantity: 1,
          name: item.name,
          productImage: item.productImage
        })
        let body = {
          customer_id: userid,
          shop_id: item.productDetail.shop_id,
          amount: item.productDetail.price,
          products: products
        }
        const data = await addtobag(JSON.stringify(body))
        console.log("data===================================================",data)
        const getdata = await getbagproduct(userid)
        // console.log("getdata================",getdata)
        if (getdata.success && getdata.data !== null) {
          EventRegister.emit('cartlength', getdata.data.length)
        }
      } else {
        this.setState({ alreadyAddecart: true })
        Alert.alert(
          '',
          "Already added",
          [{ text: 'OK' }],
          {
            cancelable: false,
          },
        );
        this.setState({ isProductDetailVisible: false });
      }
    } else {
      this.setState({ isProductDetailVisible: false });
      products.push({
        product_id: item.productDetail._id,
        price: item.productDetail.price,
        quantity: 1,
        name: item.name,
        productImage: item.productImage
      })
      let body = {
        customer_id: userid,
        shop_id: item.productDetail.shop_id,
        amount: item.productDetail.price,
        products: products
      }
      const data = await addtobag(JSON.stringify(body))
      console.log("when null ", data)
    }
  };

  onModalCancel = () => {

    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };

  loadProducts = products => {
    this.props.setProducts(products);
  };

  loadCategories = categories => {
    this.props.setCategories(categories);
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
