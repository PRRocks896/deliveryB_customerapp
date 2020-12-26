import React, { Component } from "react";
import { Alert, StatusBar, Image, Dimensions, BackHandler, TouchableOpacity, StyleSheet, View, Text, FlatList, ActivityIndicator, PermissionsAndroid } from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AppStyles from "../../AppStyles";
import {
  setProductPricesBYQty,
  setTotalShoppingBagPrice,
  removeFromShoppingBag,
  removeProductPricesBYQty,
  updateShoppingBag,
  setSubtotalPrice,
  products
} from "../../redux/";
import AsyncStorage from "@react-native-community/async-storage";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import itemQuentity from "../../services/AddToBag/itemquentity";
import removeCartItem from "../../services/AddToBag/removecartitem";
import Icon from 'react-native-vector-icons/MaterialIcons'
import { EventRegister } from 'react-native-event-listeners'
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Geolocation from 'react-native-geolocation-service';
import shopdetails from "../../services/ShopDetails/shopdetails";
import getkmgoogleapi from "../../services/Googleapi/googleapi";
import checktype from '../../utils/utilis'
const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO


const paddingLeft = 13;


class ShoppingBagScreen extends Component {
  static navigationOptions = ({ screenProps }) => {
    // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    return {
      title: "Shopping Bag",
      headerTintColor: AppStyles.navThemeConstants.light.fontColor,
    };
  };

  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");

    this.appStyles =
      props.navigation.state.params.appStyles ||
      props.navigation.getParam('appStyles');
    this.state = {
      allShoppingBag: [],
      count: 1,
      totalPayamount: '',
      isLoading: false,
      isShowData: true,
      isDataLoading: false,

      region: {
        latitude: 22.2856,
        longitude: 70.7561,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },

      customerLat: '',
      customerLong: '',

      taxsCharges: 0,
      deliveryfee: 0,

      totalkm: 0,
      basecharge: '',
      chargesPerKm: '',
      normal_charge: 0,
      loggedinuser: false


    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getloginid()
      });

  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  /**
   * for back to prev screen
   */
  handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
  }

  /**
   * get all Cart Products and set total amount
   */
  componentDidMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.getloginid()
  }

  /**
   * Check user is Login or not
   */
  getloginid = async () => {
    this.setState({ isDataLoading: true })
    let userid = await AsyncStorage.getItem('userId')
    console.log("UserLogin id>>>>>>>>>>>>>>>>", userid)
    if (userid == null) {
      this.setState({ loggedinuser: false ,  isDataLoading: true })
      this.getwishlistfromlocal()
    } else {
      this.setState({ loggedinuser: true ,  allShoppingBag: []})
      this.getwishlistItems()
    }
  }
  /**
   * when user not Logedin 
   * data fetch from Local storage
   */
  getwishlistfromlocal = async () => {
    let getproducrsoff = await AsyncStorage.getItem("Ofline_Products")
    let parseddata = JSON.parse(getproducrsoff)
    if (parseddata !== null) {
      this.setState({ allShoppingBag: parseddata ,isDataLoading: false})
      if(parseddata.length !== 0) this.setState({ isShowData: true })
      else if (parseddata.length == 0) this.setState({ isShowData: false })
    }else{
      this.setState({ isShowData: false, isDataLoading: false })
    }
  }

  /**
   * if user is Login
   * get all wishlist item from api
   */
  getwishlistItems = async () => {
    this.permissionforlocation()
    let userid = await AsyncStorage.getItem('userId')
    console.log("userid", userid)
    this.setState({ isDataLoading: true })
    const getdata = await getbagproduct(userid)
    if (getdata.statusCode == 200) {
      this.setState({ isDataLoading: false })
      this.setState({ allShoppingBag: getdata.data.data })
      console.log("Data=========================bag", getdata.data)
      this.setState({ basecharge: getdata.data.charges.base_charge, chargesPerKm: getdata.data.charges.charge_per_km, normal_charge: getdata.data.charges.normal_charge })
      if (getdata.data.data.length !== 0) this.setState({ isShowData: true })
      else if (getdata.data.data.length == 0) this.setState({ isShowData: false })
      this.props.setTotalShoppingBagPrice();
      const total = getdata.data.data.map(item => parseInt(item.amount)).reduce((prev, next) => prev + next);
      const taxcharges = getdata.data.data.map(item => item.products[0].product_id.taxes_and_charges).reduce((prev, next) => prev + next);
      console.log("tax charges======================", total, taxcharges)
      this.setState({ totalPayamount: total, taxsCharges: taxcharges })
    } else {
      this.setState({ isDataLoading: true })
    }
  }

  /**
   * Get Distance between Customer and Shop
   * @param {number} shoplatlong 
   * @param {number} customerLat 
   * @param {number} customerLong 
   */
  getdistance = async (shoplatlong, customerLat, customerLong) => {
    console.log("customer data lat long", customerLat, customerLong, shoplatlong)
    let km = []
    // let destination = shoplatlong.startsWith('%7C') ? shoplatlong.replace('%7C','') : ''
    console.log("destination", shoplatlong)

    shoplatlong.map((item) => {

      let data = this.getkm(customerLat, customerLong, item.lat, item.long, 'K')
      console.log("final km", data)
      km.push(data)
    })

    console.log("km", km)
    console.log(
      km.reduce((a, b) => a + b, 0)

    )

    let finalchargekm = km.reduce((a, b) => a + b, 0)
    this.setState({ totalkm: finalchargekm })
    if (finalchargekm <= 2) {
      this.setState({ deliveryfee: parseInt(this.state.basecharge) })
    }
    else if (this.state.totalPayamount > 15) {
      this.setState({ deliveryfee: parseInt(this.state.normal_charge) })
    }
    else {
      let charges = finalchargekm - 2
      this.setState({ deliveryfee: charges * parseInt(this.state.chargesPerKm) })
    }


  }
  /**
   * Calculate km
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @param {number} unit 
   */
  getkm(lat1, lon1, lat2, lon2, unit = 'K') {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      return dist;
    }

  }

  /**
   * Permission for locations
   */
  permissionforlocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Tribata shop app',
          'message': 'Example App access to your location '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Get Current Location 
        this.getLocation();

      } else {
        alert("Location permission denied");
      }
    } catch (err) {
      console.warn(err)
    }
  }

  /**
   * Get Current Locations
   */
  getLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Position", position.coords.latitude, position.coords.longitude)
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001
        };

        this.setState({ customerLat: position.coords.latitude, customerLong: position.coords.longitude })
        this.setState({
          region: region,
          error: null,
        });

        this.getcharges(position.coords.latitude, position.coords.longitude)

      },
      (error) => {
        alert(error.message);
        this.setState({
          error: error.message,
        })
      },
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
    );
  }

  /**
   * Calculate charges
   * @param {number} clat 
   * @param {number} clong 
   */
  getcharges = async (clat, clong) => {
    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)


    let shopArray = []
    let shoplatlong = []
    getdata.data.data.map((item) => shopArray.push(item.shop_id))
    let uniqshopsid = shopArray.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    let length = shopArray.length;
    console.log("shopArray", uniqshopsid)
    uniqshopsid.map(async (item) => {
      const responseshop = await shopdetails(item)
      if (responseshop.success) {
        console.log("shop lat long", responseshop.data.shopDetail.shopLatitude, responseshop.data.shopDetail.shopLongitude)
        shoplatlong.push({ lat: responseshop.data.shopDetail.shopLatitude, long: responseshop.data.shopDetail.shopLongitude });
        length--;
        this.getdistance(shoplatlong, clat, clong)
        console.log("length===============", length)
        // if(length == 0) {
        //   console.log(">>>>>>>>>>>>>>>>>>>>>shoplatlong", shoplatlong)

        // }
      }
    })
  }

  /**
   * On Continue press navigate to PaymentMethod screen
   */
  onContinuePress = async () => {
    this.setState({ isLoading: true })
    let userid = await AsyncStorage.getItem('userId')
    const { totalPayamount, taxsCharges, deliveryfee, totalkm } = this.state
    let total = totalPayamount + taxsCharges + deliveryfee
    // this.props.setSubtotalPrice(Number(this.props.totalShoppinBagPrice));
    this.state.allShoppingBag.length &&
      this.props.navigation.navigate("PaymentMethod", {
        appConfig: this.appConfig,
        totalPrice: total,
        customerID: userid,
        product: this.state.allShoppingBag,
        totalkm: totalkm
      });
    this.setState({ isLoading: false })
  };
  /**
   * 
   * @param {number} index index of increment item
   * index wise increment product quentity and price
   */
  incrementItem = async (index) => {
    const { allShoppingBag } = this.state
    allShoppingBag.map(async (item, indexoofarray) => {

      if (indexoofarray == index) {
        allShoppingBag[index].products[0].quantity = allShoppingBag[index].products[0].quantity + 1
        allShoppingBag[index].amount = allShoppingBag[index].products[0].price * allShoppingBag[index].products[0].quantity
        this.setState({ count: allShoppingBag[index].products[0].quantity })


        const total = allShoppingBag.map(item => item.amount).reduce((prev, next) => prev + next);
        this.setState({ totalPayamount: total })
        let body = JSON.stringify(item)
        console.log("Body in screen, body", body)
        const data = await itemQuentity(item._id, body)
        console.log("Data when update", data)

      }
    })
  }
  decrementItem = async (index) => {
    const { allShoppingBag } = this.state
    allShoppingBag.map(async (item, indexoofarray) => {
      if (indexoofarray == index) {
        if (allShoppingBag[index].products[0].quantity !== 0 && allShoppingBag[index].products[0].quantity >= 1) {
          allShoppingBag[index].products[0].quantity = allShoppingBag[index].products[0].quantity - 1
          if (allShoppingBag[index].products[0].quantity !== 0) {
            allShoppingBag[index].amount = allShoppingBag[index].products[0].price * allShoppingBag[index].products[0].quantity
            this.setState({ count: allShoppingBag[index].products[0].quantity })
            // calculate Total Amount of all Products
            const total = allShoppingBag.map(item => item.amount).reduce((prev, next) => prev + next);
            this.setState({ totalPayamount: total })
            // call api for update products
            let body = JSON.stringify(item)
            const data = await itemQuentity(item._id, body)
          }
        } else if (allShoppingBag[index].products[0].quantity == 0) {
          Alert.alert(
            'Remove Item',
            "Are you sure you want to remove this item from the cart",
            [{
              text: 'REMOVE',
              onPress: () => this.removeItemfromCart(item._id)
            }, { text: 'CANCEL' }],

          );
        }
      }
    })
  }
  /**
   * @param {number} id index of remove item
   * on click close remove item alert show
   */
  removeitem = (id) => {
    Alert.alert(
      'Remove Item',
      "Are you sure you want to remove this item from the cart",
      [{
        text: 'REMOVE',
        onPress: () => this.removeItemfromCart(id)
      }, { text: 'CANCEL' }],

    );
  }
  /**
   * 
   * @param {number} itemid id of remove item
   * remove item from cart, call api
   */
  removeItemfromCart = async (itemid) => {
    const data = await removeCartItem(itemid)

    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)
    if (getdata.success) {
      EventRegister.emit('cartlength', getdata.data.data.length)
    }

    this.componentDidMount()
  }
  /**
   * display get Cart Products
   */
  getbagProducts = () => {
    const { allShoppingBag } = this.state
    return (
      <FlatList
        data={allShoppingBag}
        renderItem={(item, index) => {
          console.log('user===========', item.item)
          return (
            <View style={[styles.card, { flexDirection: 'row' }]}>
              <View style={{ flex: 2.5 }}>
                  <Image style={styles.img} source={{ uri: item.item.products && item.item.products[0].productImage[0] }} />
              </View>
              <View style={{ flex: 5, padding: 10 }}>
                <Text style={styles.text}>{item.item.products[0].name}</Text>
                <Text style={styles.text}> ₹ {item.item.amount}</Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => this.incrementItem(item.index)}
                    style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
                  >
                    <Image
                      source={AppStyles.iconSet.add}
                      style={styles.quantityControlIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.quantityCount}>{item.item.products[0].quantity}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.decrementItem(item.index)}
                    style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}>
                    <Image
                      source={AppStyles.iconSet.minus}
                      style={styles.quantityControlIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => this.removeitem(item.item._id)}>
                <Icon name={'close'} size={25} color={'#a3a3a3'} />
              </TouchableOpacity>
            </View>
          )
        }}
        keyExtractor={item => item.id}
      />
    )
  }

  removeitemLocalProduct = async (index) => {
    Alert.alert(
      'Remove Item',
      "Are you sure you want to remove this item from the cart",
      [{
        text: 'REMOVE',
        onPress: () => this.removelocalitem(index)
      }, { text: 'CANCEL' }],

    );
  }
  removelocalitem = async (index) => {
    let getlocalproducts = await AsyncStorage.getItem('Ofline_Products')
    let getlocalproductsParsed = JSON.parse(getlocalproducts)
    console.log("ForLocal product remove",index)
    getlocalproductsParsed.splice(index, 1)
    await AsyncStorage.setItem('Ofline_Products', JSON.stringify(getlocalproductsParsed ))
    this.getwishlistfromlocal()
  }

  incrementItemLocalStorage = async (index) => {
    let getlocalproducts = await AsyncStorage.getItem('Ofline_Products')
    let getlocalproductsParsed = JSON.parse(getlocalproducts)
    const { allShoppingBag } = this.state
    allShoppingBag.map(async (item, indexoofarray) => {
      if (indexoofarray == index) {
        allShoppingBag[index].qty = allShoppingBag[index].qty + 1
        this.setState({ count: allShoppingBag[index].qty })
      }
    })
    AsyncStorage.setItem("Ofline_Products", JSON.stringify(allShoppingBag))

  }

  decrementItemLocalStorage = async (index) => {
    let getlocalproducts = await AsyncStorage.getItem('Ofline_Products')
    let getlocalproductsParsed = JSON.parse(getlocalproducts)
    const { allShoppingBag } = this.state
    allShoppingBag.map(async (item, indexoofarray) => {
      if (indexoofarray == index) {
        allShoppingBag[index].qty = allShoppingBag[index].qty !== 1 ? allShoppingBag[index].qty - 1 : 1
        this.setState({ count: allShoppingBag[index].qty })
      }
    })
    AsyncStorage.setItem("Ofline_Products", JSON.stringify(allShoppingBag))
  }

  showlocalProducts = () => {
    const { allShoppingBag } = this.state
    return (
      <FlatList
        data={allShoppingBag}
        renderItem={(item, index) => {
          console.log("index", item.index)
          return (
            <View style={[styles.card, { flexDirection: 'row' }]}>
              <View style={{ flex: 2.5 }}>
                <Image style={styles.img} source={{ uri: item.item.item && item.item.item.productImage[0] }} />
              </View>
              <View style={{ flex: 5, padding: 10 }}>
                <Text style={styles.text}>{item.item.item.name}</Text>
                <Text style={styles.text}> ₹ {item.item.item.productDetail.price}</Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => this.incrementItemLocalStorage(item.index)}
                    style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
                  >
                    <Image
                      source={AppStyles.iconSet.add}
                      style={styles.quantityControlIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.quantityCount}>{item.item.qty}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.decrementItemLocalStorage(item.index)}
                    style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}>
                    <Image
                      source={AppStyles.iconSet.minus}
                      style={styles.quantityControlIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => this.removeitemLocalProduct(item.index)}>
                <Icon name={'close'} size={25} color={'#a3a3a3'} />
              </TouchableOpacity>
            </View>
          )
        }}
        keyExtractor={item => item.id}
      />
    )
  }



  gettotalamount() {
    const { totalPayamount, taxsCharges, deliveryfee } = this.state
    let total = parseFloat(totalPayamount) + parseFloat(taxsCharges) + parseFloat(deliveryfee)
    console.log("toral", total.toFixed(2))
    return total.toFixed(2)
  }

  render() {
    const { totalPayamount, isLoading, isShowData, isDataLoading, taxsCharges, deliveryfee, loggedinuser, allShoppingBag } = this.state

    if (isShowData == true) {

      return (
        <View style={styles.container}>
          {
            isDataLoading ?
              <SkeletonPlaceholder>
                <View style={styles.shopmainSkeleton}>
                  <View style={styles.shopCategorySkeleton} />
                </View>
                <View style={styles.shopmainSkeleton}>
                  <View style={styles.shopCategorySkeleton} />
                </View>

              </SkeletonPlaceholder>
              :
              this.state.loggedinuser ? 
              this.getbagProducts() 
              : this.showlocalProducts()

          }
          {
            loggedinuser ?
              this.state.allShoppingBag.length != 0 ?
                <>
                  <View style={{ position: 'relative', bottom: 0, padding: 10, borderRadius: 5, borderTopColor: '#A9A9A9', borderTopWidth: 1 }}>
                    <View style={{ height: 'auto' }}>
                      <View style={{ paddingBottom: 10 }}>
                        <Text style={[styles.text, { fontSize: 20 }]}>Bill Details</Text>
                        <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                          <Text style={styles.text}>Item Total</Text>
                          <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ {parseFloat(totalPayamount).toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                          <Text style={styles.text}>Delivery partner fee</Text>
                          <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ {parseFloat(deliveryfee).toFixed(2)}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
                        <Text style={styles.text}>Taxes and Charges</Text>
                        <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ {parseFloat(taxsCharges).toFixed(2)}</Text>
                      </View>
                      <View style={styles.dashboarder} />
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.text, { fontSize: 18 }]}>To Pay</Text>
                        <Text style={[styles.text, { position: 'absolute', right: 20, fontSize: 18 }]}> ₹ {this.gettotalamount()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{
                    justifyContent: 'center', alignItems: 'center', borderTopColor: '#e7e7e7', borderTopWidth: 1
                  }}>
                    <TouchableOpacity style={styles.footerContainer} onPress={() => this.onContinuePress()}>
                      {
                        !isLoading ?
                          <Text style={styles.footerbtn}>Continue</Text>
                          :
                          <ActivityIndicator color={'#fff'} size="large" />
                      }
                    </TouchableOpacity>
                  </View>
                </>
                : null
              :
              <View style={styles.emptyView}>
                <TouchableOpacity style={[styles.footerContainer, { borderRadius: 5 }]} onPress={() => this.props.navigation.navigate("WelcomePage")}>
                  <Text style={styles.footerbtn}>Login to Continue</Text>
                </TouchableOpacity>
              </View>
          }

        </View>
      );
    } else {
      return (
        <View style={styles.emptyView}>
          <Text style={[styles.text, { fontSize: 20 }]}>Your Cart is Empty</Text>
          <TouchableOpacity style={[styles.footerContainer, { borderRadius: 5 }]} onPress={() => this.props.navigation.navigate("Home")}>
            <Text style={styles.footerbtn}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }
}

ShoppingBagScreen.propTypes = {
  navigation: PropTypes.object,
  shoppingBag: PropTypes.array,
  productPricesByQty: PropTypes.array,
  totalShoppinBagPrice: PropTypes.number,
  setProductPricesBYQty: PropTypes.func,
  setTotalShoppingBagPrice: PropTypes.func,
  removeFromShoppingBag: PropTypes.func,
  removeProductPricesBYQty: PropTypes.func,
  updateShoppingBag: PropTypes.func,
  setSubtotalPrice: PropTypes.func
};

const mapStateToProps = ({ products }) => {
  return {
    shoppingBag: products.shoppingBag,
    productPricesByQty: products.productPricesByQty,
    totalShoppinBagPrice: products.totalShoppinBagPrice
  };
};

export default connect(mapStateToProps, {
  setProductPricesBYQty,
  setTotalShoppingBagPrice,
  removeFromShoppingBag,
  removeProductPricesBYQty,
  updateShoppingBag,
  setSubtotalPrice
})(ShoppingBagScreen);



const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    margin: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    height: 'auto'
  },
  img: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    resizeMode: 'contain'
  },
  text: {
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 15
  },
  quantityControlIconContainer: {
    height: 25,
    width: 25,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#a3a3a3',
    alignItems: "center",
    justifyContent: "center"
  },
  quantityCount: {
    color: '#a3a3a3',
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 16
  },
  quantityControlIcon: {
    height: 10,
    width: 10,
    tintColor: "#bdbdc2"
  },

  footerContainer: {
    width: '60%',
    height: 50,
    backgroundColor: '#333333',
    borderTopColor: '#FFf',
    borderTopWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10

  },
  footerbtn: {
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 20,
    color: '#fff',
    textAlignVertical: 'center'
  },
  shopCategorySkeleton: {
    width: 350,
    height: 80,
    margin: 20,
    borderRadius: 10
  },
  shopmainSkeleton: {
    flexDirection: "row", alignItems: "center"
  }
})