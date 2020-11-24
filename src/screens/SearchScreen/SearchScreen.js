import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Search } from "../../components";
import {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
} from "../../redux/";
import { View ,Keyboard, TouchableWithoutFeedback, BackHandler, LogBox } from "react-native";
import { Searchbar } from 'react-native-paper'
import searchproducts from '../../services/Search/index'
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProductDetailVisible: false,
      product: {},
      searchQuery: '',
      searchResultProducts: [],
      alreadyAddecart: false
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  onCardPress = item => {
    this.setState({
      product: item,
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };

  
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
  
    this.props.navigation.goBack(null);
    return true;
  }
  /**
   * @param {any} item product  add to bag
   */
  onAddToBag = async (item) => {
    this.setState({ isProductDetailVisible: false })
    const { alreadyAddecart } = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart)

  };

  onModalCancel = () => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible
    });
  };
  onChangeSearch = async (query) => {
    if (query.length > 0) {
      const data = await searchproducts(query)

      this.setState({ searchResultProducts: data.data })
    } else {
      this.setState({ searchResultProducts: [] })

    }

  }
  render() {

    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{marginLeft:10,marginRight:10,marginTop:10}}>
       
          <Searchbar
            placeholder="Search"
            onChangeText={(query) => this.onChangeSearch(query)}
          />
        </TouchableWithoutFeedback >
        {/* <Search
          // products={this.props.searchResultProducts}
          products={this.state.searchResultProducts}
          shippingMethods={this.props.shippingMethods}
          onModalCancel={this.onModalCancel}
          onAddToBag={this.onAddToBag}
          onCardPress={this.onCardPress}
          onFavouritePress={this.onFavouritePress}
          product={this.state.product}
          isProductDetailVisible={this.state.isProductDetailVisible}
          appConfig={this.appConfig}
        /> */}
      </>
    );
  }
}

SearchScreen.propTypes = {
  navigation: PropTypes.object,
  searchResultProducts: PropTypes.array,
  shippingMethods: PropTypes.array,
  productPricesByQty: PropTypes.array,
  wishlist: PropTypes.array,
  user: PropTypes.object,
  setWishlist: PropTypes.func,
  setProductPricesBYQty: PropTypes.func,
  setShoppingBag: PropTypes.func
};

const mapStateToProps = ({ products, checkout, app }) => {
  return {
    searchResultProducts: products.searchResultProducts,
    shippingMethods: checkout.shippingMethods,
    productPricesByQty: products.productPricesByQty,
    user: app.user,
    stripeCustomer: app.stripeCustomer,
    wishlist: products.wishlist
  };
};

export default connect(mapStateToProps, {
  setWishlist,
  setProductPricesBYQty,
  setShoppingBag
})(SearchScreen);
