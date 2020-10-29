import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, FlatList, TouchableOpacity, Image, Modal, Dimensions, StatusBar, ScrollView, Alert , Share} from "react-native";
import { connect } from "react-redux";
import { ProductGrid, ProductDetailModal } from "../../components";
import {
  setWishlist,
  setShoppingBag,
  setProductPricesBYQty
} from "../../redux/";
import styles from "./styles";
import getProductsbyID from "../../services/Products/getProductsbyid";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";
import getservicebyName from "../../services/ShopServices/getservicebyname";
import { Picker } from '@react-native-community/picker'
import moment from 'moment'

import Header from "../../components/Modals/ProductDetailModal/Header";
import DatePicker from 'react-native-datepicker'

import AsyncStorage from "@react-native-community/async-storage";
const timedata = [
  { id: 1, item: '01 : 00 Am' },
  { id: 2, item: '02 : 00 Am' },
  { id: 3, item: '03 : 00 Am' },
  { id: 4, item: '04 : 00 Am' },
  { id: 5, item: '05 : 00 Am' },
  { id: 6, item: '06 : 00 Am' },
  { id: 7, item: '07 : 00 Am' },
  { id: 8, item: '08 : 00 Am' },
  { id: 9, item: '09 : 00 Am' },
  { id: 10, item: '10 : 00 Am' },
  { id: 11, item: '11 : 00 Am' },
  { id: 12, item: '12 : 00 Am' },
  { id: 13, item: '13 : 00 Pm' },
  { id: 14, item: '14 : 00 Pm' },
  { id: 15, item: '15 : 00 Pm' },
  { id: 16, item: '16 : 00 Pm' },
  { id: 17, item: '17 : 00 Pm' },
  { id: 18, item: '18 : 00 Pm' },
  { id: 19, item: '19 : 00 Pm' },
  { id: 20, item: '20 : 00 Pm' },
  { id: 21, item: '21 : 00 Pm' },
  { id: 22, item: '22 : 00 Pm' },
  { id: 23, item: '23 : 00 Pm' },
  { id: 24, item: '24 : 00 Pm' },
]
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
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
      isLoadingProduct: true,
      alreadyAddecart: false,
      serviceCategoryData: [],
      isServiceData: false,
      modalVisible: false,
      productData: {},
      selectedSlot: '',
      slotdate :moment().format('DD/MM/YYYY')
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
  }
   onShare = async () => {
        const {productData} = this.state
    await Share.share({
      title: "Shopertino Product",
      dialogTitle: `Shopertino Product: ${productData.name}`,
      message: productData.name + ',' +  productData.description + ',' + productData.serviceDetail.price,
     

    });

}
  componentDidMount() {
    this.setState({ id: this.props.navigation.state.params.products._id })
    this.setState({ setCategoryName: this.props.navigation.state.params.products.name })
    let name = this.props.navigation.state.params.products.name
    this.getCategoryProducts(name)
  }

  getCategoryProducts = async (name) => {
    console.log("name", name)

    const data = await getProductsbyID(name);
    console.log("category product data", data)
    if (data.data.length == 0) {
      console.log("Call if==================================")
      const response = await getservicebyName(name)
      // console.log("response service category", response.data)
      if (response.data.length !== 0) {
        this.setState({ serviceCategoryData: response.data, isServiceData: true , isLoadingProduct: false})
      } else {
        this.setState({ isServiceData: false , isLoadingProduct: false})

      }
    } else {
      if (data.success) {
        this.setState({ categoryProducts: data.data, isLoadingProduct: false, isServiceData: false })
      }
    }
  };

  onCardPress = item => {
    this.setState({
      isProductDetailVisible: !this.state.isProductDetailVisible,
      product: item
    });
  };

  /**
   * 
   * @param {any} item product data 
   * add to bag product
   */
  onAddToBag = async (item) => {
    this.setState({ isProductDetailVisible: false })
    const { alreadyAddecart } = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart)
  };

  booknow = async (item) => {
    console.log("item>>>>>>>>>>>>>>",this.state.slotdate,  item.serviceDetail.shop_id)
    const { productData, selectedSlot } = this.state
    let userid = await AsyncStorage.getItem('userId')
    if (selectedSlot !== '') {
      this.setState({ modalVisible: false })
      this.props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: this.appConfig,
          customerID: userid,
          totalammount: productData.serviceDetail.price,
          slot: selectedSlot,
          shopid: item.serviceDetail.shop_id,
          service_id: productData.serviceDetail._id,
          slot_date: this.state.slotdate,
          booking_number: Math.floor(100000000000 + Math.random() * 900000000000)
        })

    } else {
      Alert.alert("", "Please Select Slot")
    }

  }



  render() {
    const {slotdate,  selectedSlot, productData, product, isLoadingProduct, categoryProducts, isServiceData, serviceCategoryData, modalVisible } = this.state
    const { extraData } = this.props;
    if (isServiceData) {
      if(serviceCategoryData.length){
      return (
        <>
          <View style={styles.container}>
            <FlatList
              data={serviceCategoryData}
              renderItem={(item) => {
                return (
                  <TouchableOpacity onPress={() => this.setState({ modalVisible: true, productData: item.item })} style={styles.card}>
                    <Image source={{ uri: item.item.serviceImage }} style={styles.serviceImage} />
                    <View>
                      <Text style={styles.productCardPrice}>₹ {item.item.serviceDetail.price}</Text>
                      <Text style={styles.productCardDescription} numberOfLines={1}>
                        {item.item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
              numColumns={2}
              keyExtractor={(item) => (item._id).toString()}
            />
            {
              modalVisible ?
                <Modal
                  animationType="slide"
                  transparent={true}
                  hideModalContentWhileAnimating={true}
                  visible={modalVisible}
                  animationInTiming={600}
                  animationOutTiming={600}
                  backdropTransitionInTiming={600}
                  backdropTransitionOutTiming={600}
                  style={styles.modalStyle}
                  animationIn="zoomInDown"
                  animationOut="zoomOutUp"
                  backdropOpacity={0.5}
                  deviceWidth={deviceWidth}
                  deviceHeight={deviceHeight}
                  onRequestClose={() => {
                    this.setState({ modalVisible: false })
                  }}
                >
                  <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
                  <View style={styles.transparentContainer}>
                    <View style={styles.viewContainer}>
                      <ScrollView style={styles.descriptionContainer}>
                        <Header
                          onCancelPress={() => this.setState({ modalVisible: false })}
                          headerContainerStyle={styles.headerContainerStyle}
                          onSharePress={this.onShare} />
                        <Image
                          style={{ width: '100%', height: 200, marginTop: 60 }}
                          resizeMode={'contain'}
                          source={{ uri: productData.serviceImage }}
                        />
                        <Text style={styles.title}>{productData.name}</Text>
                        <Text style={styles.title}>Available Slot : {productData.serviceDetail.serviceSlot[0].start} to {productData.serviceDetail.serviceSlot[0].end}</Text>
                        <Text style={[styles.title, { paddingTop: 5, fontSize: 15, marginTop: 10 }]}>{productData.description}</Text>
                        <View style={styles.inputContainer}>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            date={slotdate}
                                            mode="date"
                                            placeholder="select date"
                                            format="DD-MM-YYYY"
                                            minDate={new Date()}
                                            maxDate={moment().day(17)}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 4,
                                                    marginLeft: 10
                                                },
                                                dateInput: {
                                                    marginLeft: -180,
                                                    borderWidth:0,
                                                    flex:9,
                                                    // backgroundColor:'pink'
                                                }
                                                // ... You can check the source to find the other keys.
                                            }}
                                            onDateChange={(date) =>  this.setState({slotdate: date}) }
                                        />
                                    </View>
                        <View style={styles.inputContainer}>
                          <Picker
                            selectedValue={selectedSlot}
                            style={{ width: '100%', height: 40 }}
                            onValueChange={(itemValue, itemIndex) => {
                              if (productData.serviceDetail.serviceSlot[0].start <= itemIndex && productData.serviceDetail.serviceSlot[0].end >= itemIndex) {
                                this.setState({ selectedSlot: itemValue })
                              } else {
                                Alert.alert("", `Plaease Select time Between ${productData.serviceDetail.serviceSlot[0].start} to ${productData.serviceDetail.serviceSlot[0].end}`)
                              }
                            }
                            }>
                            <Picker.Item label="Select Slot" value="" />
                            {
                              timedata.map((item) => {
                                return (
                                  <Picker.Item label={item.item} value={item.id} key={item.id} />
                                )

                              })
                            }
                          </Picker>
                        </View>
                        <Text style={styles.price}>₹ {productData.serviceDetail ? productData.serviceDetail.price : null}</Text>
                        <View style={styles.borderLine} />
                        <TouchableOpacity
                          onPress={() => this.booknow(productData)}
                          style={[styles.addToBagContainerStyle, { marginBottom: 20 }]}>
                          <Text style={{ color: '#fff', fontSize: 20 }}>{"Book Now"}</Text>
                        </TouchableOpacity>
                      </ScrollView>

                    </View>
                  </View>
                </Modal>
                : null
            }
          </View>
        </>
      )}else{
        return(
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{'No Service Found'}</Text>
              </View>
        )
      }
    } else {
      return (
        <>
          {
            categoryProducts.length ?
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
              :
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{'No Product Found'}</Text>
              </View>
          }
        </>
      );
    }
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
