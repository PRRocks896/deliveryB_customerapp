import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, FlatList, TouchableOpacity, Image, Modal, Dimensions, StatusBar, ScrollView, Alert, Share } from "react-native";
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
import Swiper from "react-native-swiper";
import Icon from 'react-native-vector-icons/MaterialIcons'
import Header from "../../components/Modals/ProductDetailModal/Header";
import DatePicker from 'react-native-datepicker'
import RBSheet from "react-native-raw-bottom-sheet";
import AsyncStorage from "@react-native-community/async-storage";
import { getsubcategoryProductService, getSubCategoryService, sortingProducts } from "../../services/Products/getsubCategory";
import ServiceModelComponent from "../../components/Modals/ProductDetailModal/ServiceModel";
import { checktype } from "../../utils/utilis";

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
          : (navigation.state.params.title).replace(/_/g, " "),
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
      slotdate: moment().format('DD/MM/YYYY'),
      subCategoryArray: [],
      quentity:1, 
      page: 0,
      isSelectSort: 'lowTohigh',
      subcategoryid: ''
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");

  }
  onShare = async () => {
    const { productData } = this.state
    await Share.share({
      title: "Shopertino Product",
      dialogTitle: `Shopertino Product: ${productData.name}`,
      message: productData.name + ',' + productData.description + ',' + productData.serviceDetail.price,


    });

  }
  componentDidMount() {
    this.setState({ id: this.props.navigation.state.params.products._id })
    this.setState({ setCategoryName: this.props.navigation.state.params.products.name })
    let name = this.props.navigation.state.params.products.name
    let id = this.props.navigation.state.params.categoryId

    console.log("id----", id, name)
    this.getCategoryProducts(name)
    this.getsubCategory(id)
  }

  getsubCategory = async (id) => {

    const response = await getSubCategoryService(id)
    if (response.statusCode == 200) {
      this.setState({ subCategoryArray: response.data })
    }
  }

  getCategoryProducts = async (name) => {
    const data = await getProductsbyID(name);
    console.log("propduct data", data)
    if (data.data.length == 0) {
      const response = await getservicebyName(name)
      if (response.data.length !== 0) {
        console.log(" service data ", response.data)
        this.setState({ serviceCategoryData: response.data, isServiceData: true, isLoadingProduct: false })
      } else {
        this.setState({ isServiceData: false, isLoadingProduct: false })

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
  onAddToBag = async (item, color, size, qty, selectedshopID) => {
    this.setState({ isProductDetailVisible: false  , quentity:1})
    const { alreadyAddecart } = this.state

    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart, color, size, qty, selectedshopID)
  };

  booknow = async (item, selectedSlot, selectedshopID, slotdate) => {
   
    let userid = await AsyncStorage.getItem('userId')
    if (selectedSlot !== '') {
      this.setState({ modalVisible: false })
      this.props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: this.appConfig,
          customerID: userid,
          totalammount: item.serviceDetail.price,
          slot: selectedSlot,
          shopid: selectedshopID,
          service_id: item.serviceDetail._id,
          slot_date: slotdate,
          booking_number: Math.floor(100000000000 + Math.random() * 900000000000)
        })

    } else {
      Alert.alert("", "Please Select Slot")
    }

  }

  getsubProducts = async (id) => {
    this.setState({ subcategoryid: id })
    let categorydata = this.props.navigation.state.params.categoryId
    console.log("ids", categorydata, id)
    let data = `${categorydata}&page=0&limit=1000&sort=productDetail.price&order=desc&subcategory=${id}&priceLow=10&priceHigh=20000`
    let response = await getsubcategoryProductService(data)
    console.log("responseof sub category products", response)
    if (response.statusCode == 200) {
      if (response.data.products.length > 0) {
        this.setState({ categoryProducts: response.data.products })
      } else {
        this.setState({ categoryProducts: [] })
      }
    }

    if (this.state.isServiceData) {
      let data = `${categorydata}&page=0&limit=1000&sort=serviceDetail.price&order=desc&subcategory=${id}&priceLow=10&priceHigh=20000`
      let response = await getsubcategoryProductService(data)
      console.log("responseof sub category products", response)
      if (response.statusCode == 200) {
        if (response.data.services.length > 0) {
          this.setState({ serviceCategoryData: response.data.services })
        } else {
          this.setState({ serviceCategoryData: [] })

        }
      }
    }
  }
  displaysubCategoryData = () => {
    const { subCategoryArray } = this.state
    return (

      <FlatList
        horizontal
        data={subCategoryArray}
        renderItem={(item) => {
          return (
            <TouchableOpacity
              onPress={() => this.getsubProducts(item.item._id)}
              style={styles.subCategoryView}>
              <Text style={styles.subcategoyTxt}>{item.item.name}</Text>
            </TouchableOpacity>
          )
        }}

      />
    )
  }

  applysorting = async () => {
    let id = this.props.navigation.state.params.categoryId
    this.setState({ categoryProducts: [] })
    this.setState({ serviceCategoryData: [] })
   
      let order = this.state.isSelectSort == 'lowTohigh' ? 'asc' : 'desc'
      let dataproducts = `page=0&limit=10000&sort=productDetail.price&priceLow=10&priceHigh=100000&order=${order}&category=${id}&subcategory=${this.state.subcategoryid}`
      this.RBSheet.close()
      const responseproduct = await sortingProducts(dataproducts)

      console.log("sorting data response ======", responseproduct)
      if (responseproduct.statusCode == 200) {
        if (responseproduct.data.products.length > 0) {
          this.setState({ categoryProducts: responseproduct.data.products })
        }

      }
    

  
    
      let data = `page=0&limit=10000&sort=serviceDetail.price&priceLow=10&priceHigh=100000&order=${order}&category=${id}&subcategory=${this.state.subcategoryid}`
      // this.RBSheet.close()
      const response = await sortingProducts(data)
      console.log("sorting data response ======", response)
      if (response.statusCode == 200) {

        if (response.data.services.length > 0) {
          this.setState({ serviceCategoryData: response.data.services })
        }
      }
    
  }


  render() {

    const { isSelectSort, subCategoryArray, slotdate, selectedSlot, productData, product, isLoadingProduct, categoryProducts, isServiceData, serviceCategoryData, modalVisible } = this.state
    const { extraData } = this.props;
    if (isServiceData) {
     
        return (
          <>
            <View style={styles.container}>
              <View style={{ marginTop: 10 }}>
                {
                  subCategoryArray.length ?
                    this.displaysubCategoryData()
                    : 
                   null
                }
              </View>
              {
                serviceCategoryData.length ? 
                <FlatList
                data={serviceCategoryData}
                renderItem={(item) => {
                  return (
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: true, productData: item.item })} style={styles.card}>
                      <Image source={{ uri: item.item.serviceImage[0] }} style={styles.serviceImage} />
                      <View>
                        <Text style={styles.productCardPrice}>₹ {checktype(item.item.serviceDetail.price)}</Text>
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
              :
                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                 <Text>{'No Service Found'}</Text>
               </View>
              }
             

              <TouchableOpacity onPress={() => this.RBSheet.open()} style={styles.filterbtnContainer}>
                <Icon name={'filter-list'} color={'#000'} size={25} />
              </TouchableOpacity>
              <RBSheet
                ref={ref => {
                  this.RBSheet = ref;
                }}
                closeOnDragDown={true}
                closeOnPressMask={false}
                height={210}
                openDuration={250}
                onRequestClose={() => this.RBSheet.close()}
                customStyles={{
                  draggableIcon: {
                    backgroundColor: "#a3a3a3",
                    width: '20%'
                  },
                  container: {
                    borderTopRightRadius: 50,
                    borderTopLeftRadius: 50,
                    padding: 10
                  }
                }}
              >
                <View style={styles.bottomsortContainer}>
                  <TouchableOpacity
                    onPress={() => this.setState({ isSelectSort: 'lowTohigh' })}
                    style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 7 }}>
                      <Text style={styles.sortingbottomtxt}>{'Price Low to High'}</Text>
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                      {
                        isSelectSort == 'lowTohigh' ?
                          <Icon name={'done'} size={20} color={'#000'} />
                          : null
                      }
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({ isSelectSort: 'highTolow' })}
                    style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 7 }}>
                      <Text style={styles.sortingbottomtxt}>{'Price High to Low'}</Text>
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                      {
                        isSelectSort == 'highTolow' ?
                          <Icon name={'done'} size={20} color={'#000'} />
                          : null
                      }
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => [this.applysorting(), this.setState({serviceCategoryData: []})]}
                    style={styles.applybutton}>
                    <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
                  </TouchableOpacity>

                </View>
              </RBSheet>

              <ServiceModelComponent
                item={productData}
                shippingMethods={this.props.shippingMethods}
                visible={modalVisible}
                onAddToBag={(item, selectedSlot, selectedshopID, slotdate) => this.booknow(item, selectedSlot, selectedshopID, slotdate)}
                onCancelPress={() => this.setState({ modalVisible: !this.state.modalVisible})}
                appConfig={this.props.appConfig}
                navigation={this.props.navigation}
              />
              
            </View>
          </>
        )
     
    } else {
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

                <>
                  <View style={{ marginTop: 10 }}>
                    {
                      subCategoryArray.length ?
                        this.displaysubCategoryData()
                        : null
                    }

                  </View>
                  {categoryProducts.length ?
                    <ProductGrid
                      products={this.state.categoryProducts}
                      onCardPress={this.onCardPress}
                      itemContainerStyle={{ alignItems: "center" }}
                      extraData={extraData}
                      appConfig={this.appConfig}
                    />
                    :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text>{'No Product Found'}</Text>
                    </View>
                  }
                  <TouchableOpacity onPress={() => this.RBSheet.open()} style={styles.filterbtnContainer}>
                    <Icon name={'filter-list'} color={'#000'} size={25} />
                  </TouchableOpacity>
                  <RBSheet
                    ref={ref => {
                      this.RBSheet = ref;
                    }}
                    closeOnDragDown={true}
                    closeOnPressMask={false}
                    height={210}
                    openDuration={250}
                    onRequestClose={() => this.RBSheet.close()}
                    customStyles={{
                      draggableIcon: {
                        backgroundColor: "#a3a3a3",
                        width: '20%'
                      },
                      container: {
                        borderTopRightRadius: 50,
                        borderTopLeftRadius: 50,
                        padding: 10
                      }
                    }}
                  >
                    <View style={styles.bottomsortContainer}>
                      <TouchableOpacity
                        onPress={() => this.setState({ isSelectSort: 'lowTohigh' })}
                        style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 7 }}>
                          <Text style={styles.sortingbottomtxt}>{'Price Low to High'}</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                          {
                            isSelectSort == 'lowTohigh' ?
                              <Icon name={'done'} size={20} color={'#000'} />
                              : null
                          }
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.setState({ isSelectSort: 'highTolow' })}
                        style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 7 }}>
                          <Text style={styles.sortingbottomtxt}>{'Price High to Low'}</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                          {
                            isSelectSort == 'highTolow' ?
                              <Icon name={'done'} size={20} color={'#000'} />
                              : null
                          }
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => [this.applysorting(), this.setState({categoryProducts: []})]}
                        style={styles.applybutton}>
                        <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
                      </TouchableOpacity>

                    </View>
                  </RBSheet>
                </>
            }
            <ProductDetailModal
              shippingMethods={this.props.shippingMethods}
              item={this.state.product}
              visible={this.state.isProductDetailVisible}
              productDetails={product.productDetail}
              onFavouritePress={this.onFavouritePress}
              onAddToBag={this.onAddToBag}
              onCancelPress={(modalVisible) =>
                this.setState({
                  isProductDetailVisible: !this.state.isProductDetailVisible,
                  quentity: 1
                })
               
              }
              appConfig={this.appConfig}
              navigation={this.props.navigation}

              quentityset={this.state.quentity}
              onSetQuantity={(value) => this.setState({ quentity: value})}
            />
          </View>
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
