import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Search } from "../../components";
import { firebaseDataManager } from "../../apis";
import {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
} from "../../redux/";
import { View, AsyncStorage } from "react-native";
import { Searchbar } from 'react-native-paper';
import searchproducts from '../../services/Search/index'
import getbagproduct from "../../services/AddToBag/getbagProduct";
import addtobag from "../../services/AddToBag";
import { EventRegister } from 'react-native-event-listeners'

class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProductDetailVisible: false,
      product: {},
      searchQuery: '',
      searchResultProducts: [],
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
  }

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

  onAddToBag = async (item) => {
    // const uniqueId = uuid();
    // const itemCopy = { ...item, shoppingBagId: uniqueId };
    // const product = {
    //   id: uniqueId,
    //   qty: 1,
    //   totalPrice: Number(item.price)
    // };

    // updatePricesByQty(product, this.props.productPricesByQty, pricesByQty => {
    //   this.props.setShoppingBag(itemCopy);
    //   this.props.setProductPricesBYQty(pricesByQty);
    // });

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

    // this.setState({ isProductDetailVisible: false });
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
        <View>
          <Searchbar
            placeholder="Search"
            onChangeText={(query) => this.onChangeSearch(query)}
          />
        </View>
        <Search
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
        />
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
