import React, { Component } from "react";
import { Alert, StatusBar, Image, Dimensions, BackHandler, TouchableOpacity, StyleSheet, View, Text, FlatList, ActivityIndicator } from "react-native";
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


const { width, height } = Dimensions.get("window");
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
      isDataLoading:false
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.props.navigation.addListener(
      'didFocus',
      payload => {
          this.componentDidMount()

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

    let userid = await AsyncStorage.getItem('userId')
    console.log("userid", userid)
    this.setState({isDataLoading:true})
    const getdata = await getbagproduct(userid)
    console.log("=================",getdata)
    if(getdata.statusCode == 200) {
      this.setState({isDataLoading: false})
      this.setState({ allShoppingBag: getdata.data })
      if (getdata.data.length !== 0) this.setState({ isShowData: true })
      else if (getdata.data.length == 0) this.setState({ isShowData: false })
      this.props.setTotalShoppingBagPrice();
      const total = getdata.data.map(item => item.amount).reduce((prev, next) => prev + next);
      this.setState({ totalPayamount: total })
    }else{
      this.setState({isDataLoading: true})
    }
  }


  /**
   * On Continue press navigate to PaymentMethod screen
   */
  onContinuePress = async () => {
    this.setState({ isLoading: true })
    let userid = await AsyncStorage.getItem('userId')
    console.log("userid", userid)
    this.props.setSubtotalPrice(Number(this.props.totalShoppinBagPrice));
    this.state.allShoppingBag.length &&
      this.props.navigation.navigate("PaymentMethod", {
        appConfig: this.appConfig,
        totalPrice: this.state.totalPayamount,
        customerID: userid,
        product: this.state.allShoppingBag

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
        // console.log("===increment ========", allShoppingBag[index].amount)

        const total = allShoppingBag.map(item => item.amount).reduce((prev, next) => prev + next);
        this.setState({ totalPayamount: total })
        let body = JSON.stringify(item)
        const data = await itemQuentity(item._id, body)
        // console.log("==========after change api response=", data)
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
      console.log("when remove item", getdata.data.length)
      EventRegister.emit('cartlength', getdata.data.length)
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
          return (
            <View style={[styles.card, { flexDirection: 'row' }]}>
              <View style={{ flex: 2.5 }}>
                <Image style={styles.img} source={{ uri: item.item.products[0].productImage }} />
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

  render() {
    const { totalPayamount, isLoading, isShowData ,isDataLoading} = this.state

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
          this.getbagProducts()
          }
          {
            this.state.allShoppingBag.length != 0 ?
              <>
                <View style={{ position: 'relative', bottom: 0, padding: 10, borderRadius: 5, borderTopColor: '#A9A9A9', borderTopWidth: 1 }}>
                  <View style={{ height: 'auto' }}>
                    <View style={{ paddingBottom: 10 }}>
                      <Text style={[styles.text, { fontSize: 20 }]}>Bill Details</Text>
                      <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                        <Text style={styles.text}>Item Total</Text>
                        <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ {totalPayamount}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                        <Text style={styles.text}>Delivery partner fee</Text>
                        <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ 0</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
                      <Text style={styles.text}>Texes and Charges</Text>
                      <Text style={[styles.text, { position: 'absolute', right: 20 }]}>₹ 0</Text>
                    </View>
                    <View style={styles.dashboarder} />
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.text, { fontSize: 18 }]}>To Pay</Text>
                      <Text style={[styles.text, { position: 'absolute', right: 20, fontSize: 18 }]}>₹ {totalPayamount}</Text>
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
    resizeMode:'contain'
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
  shopmainSkeleton:{
    flexDirection: "row", alignItems: "center"
  }
})