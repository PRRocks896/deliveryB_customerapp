import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, StatusBar, AsyncStorage, Alert } from "react-native";
import { connect } from "react-redux";
import { ProductGrid, ProductDetailModal } from "../../components";
import { firebaseDataManager } from "../../apis";
import {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
} from "../../redux/";
import styles from "./styles";
import getProductsbyID from "../../services/Products/getProductsbyid";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import addtobag from "../../services/AddToBag";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

class CategoryProductGridScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    return {
      title:
        typeof navigation.state.params === "undefined" ||
          typeof navigation.state.params.title === "undefined"
          ? "Cartegory Grid"
          : navigation.state.params.title,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isProductDetailVisible: false,
      product: {},
      categoryProducts: [],
      setCategoryID: '',
      setCategoryName: '',
      isLoadingProduct: true

    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
  }

  componentDidMount() {
    this.setState({ id: this.props.navigation.state.params.products._id })
    this.setState({ setCategoryName: this.props.navigation.state.params.products.name })
    let name = this.props.navigation.state.params.products.name
    this.getCategoryProducts(name)
  }

  getCategoryProducts = async (name) => {
    const data = await getProductsbyID(name);
    if (data.success) {
      this.setState({ categoryProducts: data.data, isLoadingProduct: false })
    }
  };

  onCardPress = item => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible,
      product: item
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
    let userid = await AsyncStorage.getItem('userId')
    let products = []
    const getdata = await getbagproduct(userid)
    let found = getdata.data.some(i => i.products[0].product_id.id == item.productDetail._id)
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
      const getdata = await getbagproduct(userid)
      if (getdata.success) {
        console.log("in home  screen", getdata.data.length)
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
  };
  render() {
    const { product, isLoadingProduct } = this.state
    const { extraData } = this.props;

    return (
      <>
        <View style={styles.container}>

          {
            isLoadingProduct == true ?
              <SkeletonPlaceholder>
                <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                  <View style={{ flex: 6, flexDirection: 'row' }}>
                    <View>
                      <View style={styles.bestsellerMainSkeleton} />
                      <View style={styles.featuredvalueSkeleton} />
                      <View style={styles.featuredsmallValueSkeleton} />
                    </View>
                    <View>
                      <View style={styles.bestsellerMainSkeleton} />
                      <View style={styles.featuredvalueSkeleton} />
                      <View style={styles.featuredsmallValueSkeleton} />
                    </View>
                  </View>
                  <View style={{ flex: 6, flexDirection: 'row', marginTop: 10 }}>
                    <View>
                      <View style={styles.bestsellerMainSkeleton} />
                      <View style={styles.featuredvalueSkeleton} />
                      <View style={styles.featuredsmallValueSkeleton} />
                    </View>
                    <View>
                      <View style={styles.bestsellerMainSkeleton} />
                      <View style={styles.featuredvalueSkeleton} />
                      <View style={styles.featuredsmallValueSkeleton} />
                    </View>
                  </View>
                </View>
              </SkeletonPlaceholder>
              :
              <ProductGrid
                products={this.state.categoryProducts}
                onCardPress={this.onCardPress}
                itemContainerStyle={{ alignItems: "center" }}
                extraData={extraData}
                appConfig={this.appConfig}
              />
          }
          <ProductDetailModal
            shippingMethods={this.props.shippingMethods}
            item={this.state.product}
            visible={this.state.isProductDetailVisible}
            productDetails={product.productDetail}
            onFavouritePress={this.onFavouritePress}
            onAddToBag={this.onAddToBag}
            onCancelPress={() =>
              this.setState({
                isProductDetailVisible: !this.state.isProductDetailVisible
              })
            }
            appConfig={this.appConfig}
          />
        </View>
      </>
    );
  }
}

CategoryProductGridScreen.propTypes = {
  title: PropTypes.string,
  CategoryProductGridScreen: PropTypes.array,
  navigation: PropTypes.object,
  extraData: PropTypes.object,
  allProducts: PropTypes.array,
  productPricesByQty: PropTypes.array,
  user: PropTypes.object,
  wishlist: PropTypes.array,
  shippingMethods: PropTypes.array,
  setWishlist: PropTypes.func,
  setShoppingBag: PropTypes.func,
  setProductPricesBYQty: PropTypes.func
};

const mapStateToProps = ({ products, app, checkout }) => {
  return {
    productPricesByQty: products.productPricesByQty,
    allProducts: products.allProducts,
    user: app.user,
    wishlist: products.wishlist,
    shippingMethods: checkout.shippingMethods
  };
};

export default connect(mapStateToProps, {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
})(CategoryProductGridScreen);
