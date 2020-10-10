import React, { Component } from "react";
import { View, Alert, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import stripe from "tipsi-stripe";
import PropTypes from "prop-types";
import { Header, FooterButton } from "../../components";
import { setOrderHistory } from "../../redux/";
import AppStyles from "../../AppStyles";
import placeOrder from "../../services/PlaceOrder";
import changeCartStatus from "../../services/AddToBag/changecartStatus";
import styles from './styles'
import { Dialog } from 'react-native-simple-dialogs';
import { RadioButton } from 'react-native-paper';
import shopdetails from "../../services/ShopDetails/shopdetails";
import payfromwallet from "../../services/Wallet/payfromwallet";
import AsyncStorage from "@react-native-community/async-storage";

class CheckoutScreen extends Component {
  static navigationOptions = ({ screenProps }) => {
    const currentTheme = AppStyles.navThemeConstants[screenProps.theme];

    return {
      headerStyle: {
        backgroundColor: AppStyles.navThemeConstants.light.backgroundColor,
        borderBottomWidth: 0,
      },
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isNativePayPossible: false,
      totalammount: this.props.navigation.state.params.totalammount,
      paymentethod: this.props.navigation.state.params.payment_method,
      dialogVisible: false,
      radioValue: '',
      isLoading: false
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");

  }

  async componentDidMount() {

    const isDeviceSupported = await stripe.deviceSupportsNativePay();

    if (isDeviceSupported) {
      this.setState({
        isNativePayPossible: true
      });
    }


  }
  /**
   * payment methody wallet
   * @param {any} uniqshopsid uniqe shop id array
   */
  placeorderfromWallet = async (uniqshopsid) => {
    console.log("uniqshopsid=====Foe Wallet fun", uniqshopsid)
    let paramdata = this.props.navigation.state.params
    let bagData = paramdata.bagproduct
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    let filterProduct = []

    console.log("CALL WALLET", uniqshopsid, paramdata.totalammount)
    uniqshopsid.map(async (item) => {
      console.log("id shop>>>>>>>>>>>>>>>>>>>>>>", item)
      // For get shop details from shop id
      const shopDetailsres = await shopdetails(item)
      console.log("for shop details", shopDetailsres)
      if (shopDetailsres.success) {
        console.log("shopDetailsres.data.mobile", JSON.stringify(shopDetailsres.data.mobile))
        let shopMobile = shopDetailsres.data.mobile

        let body = JSON.stringify({
          shop_mobile: shopMobile,
          amount: paramdata.totalammount
        })
        console.log("Body=====PAY FROM WALLET", body)
        //For Pay amount from wallet
        const paydata = await payfromwallet(body, phoneno)
        console.log("Pay from wallet", paydata)
        if (paydata.statusCode == 200) {
          console.log("for wallte", paydata.data.transaction_id)

          //make data for place order
          bagData.map((productsdata) => {
            if (item == productsdata.products[0].product_id.shop_id) {
              console.log("FOR WALLET CALL IN IF", item, productsdata.products[0].product_id.shop_id)
              filterProduct.push({
                'customer_id': paramdata.customerID,
                'shop_id': item,
                'transaction_id': paydata.data.transaction_id,
                'payment_method': paramdata.payment_method,
                'amount': paramdata.totalammount,
                'order_number': paramdata.order_number.toString(),
                'deliveryType': this.state.radioValue,
                'products': []
              })
            }
          })
          console.log("filterProduct===================For wallet", filterProduct)
          console.log("result", result)
          // Make unique result 
          var result = filterProduct.reduce((unique, o) => {
            if (!unique.some(obj => obj.shop_id === o.shop_id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          console.log(" unique result", result)
          result.map((item, indexOfResult) => {
            let obj = [];
            bagData.map((productitem, indexOfBagdata) => {
              if (item.shop_id == productitem.products[0].product_id.shop_id) {
                obj.push({
                  product_id: productitem.products[0].product_id._id,
                  price: productitem.products[0].price,
                  quantity: productitem.products[0].quantity
                })
              }
            })
            result[indexOfResult].products = obj
          })


          console.log("JSON.stringify(result)", JSON.stringify(result))
          //Call Place order api
          const placeorderresponse = await placeOrder(JSON.stringify(result));
          console.log("==============placeorderresponse===", placeorderresponse)
          if (placeorderresponse.statusCode == 200) {
            this.setState({ dialogVisible: false, isLoading: false })
            console.log("=====================================place order", bagData, placeorderresponse)
            bagData.map(async (item) => {
              console.log("item._id", item._id, item)
              // After place order make statis true for placed products
              const cartStatus = await changeCartStatus(item._id)
              console.log("calll cartStatus", cartStatus)
              if (cartStatus.statusCode == 200) {
                console.log("calllllll :::::::::::::::::::::::::::::::::::::")
                this.props.navigation.navigate("Order", { appConfig: this.appConfig });
              } else {
                this.setState({ dialogVisible: false, isLoading: false })
                Alert.alert(
                  "",
                  cartStatus.messageCode,
                  [
                    { text: "OK" }
                  ],
                  { cancelable: true }
                );
              }
            })
          } else {
            this.setState({ dialogVisible: false, isLoading: false })
            Alert.alert(
              "",
              placeorderresponse.messageCode,
              [
                { text: "OK" }
              ],
              { cancelable: true }
            );
          }
        } else {
          Alert.alert(
            "",
            paydata.message,
            [
              { text: "Ok", },
            ],
          );
        }
      }
    })
  }

  /**
   * payment method cod or card
   * @param {any} uniqshopsid unique shop array 
   */
  placeorderwithoutWallet = async (uniqshopsid) => {
    console.log("call other process ============", uniqshopsid)
    let paramdata = this.props.navigation.state.params
    let bagData = paramdata.bagproduct
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    let filterProduct = []

    console.log("CALL ELSE IN PLACE ORDER")
    uniqshopsid.map(item => {
      bagData.map((productsdata) => {
        if (item == productsdata.products[0].product_id.shop_id) {
          filterProduct.push({
            'customer_id': paramdata.customerID,
            'shop_id': item,
            'transaction_id': paramdata.transactionid,
            'payment_method': paramdata.payment_method,
            'amount': paramdata.totalammount,
            'order_number': paramdata.order_number.toString(),
            'deliveryType': this.state.radioValue,
            'products': []
          })
        }
      })
    })

    console.log("result", result)
    // Make unique result 
    var result = filterProduct.reduce((unique, o) => {
      if (!unique.some(obj => obj.shop_id === o.shop_id)) {
        unique.push(o);
      }
      return unique;
    }, []);
    console.log(" unique result", result)
    result.map((item, indexOfResult) => {
      let obj = [];
      bagData.map((productitem, indexOfBagdata) => {
        if (item.shop_id == productitem.products[0].product_id.shop_id) {
          obj.push({
            product_id: productitem.products[0].product_id._id,
            price: productitem.products[0].price,
            quantity: productitem.products[0].quantity
          })
        }
      })
      result[indexOfResult].products = obj
    })


    console.log("JSON.stringify(result)", JSON.stringify(result))
    //Call Place order api
    const placeorderresponse = await placeOrder(JSON.stringify(result));
    console.log("==============placeorderresponse===", placeorderresponse)
    if (placeorderresponse.statusCode == 200) {
      this.setState({ dialogVisible: false, isLoading: false })
      console.log("=====================================place order", bagData, placeorderresponse)
      bagData.map(async (item) => {
        console.log("item._id", item._id, item)
        // After place order make statis true for placed products
        const cartStatus = await changeCartStatus(item._id)
        console.log("calll cartStatus", cartStatus)
        if (cartStatus.statusCode == 200) {
          console.log("calllllll :::::::::::::::::::::::::::::::::::::")
          this.props.navigation.navigate("Order", { appConfig: this.appConfig });
        } else {
          this.setState({ dialogVisible: false, isLoading: false })
          Alert.alert(
            "",
            cartStatus.message,
            [
              { text: "OK" }
            ],
            { cancelable: true }
          );
        }
      })
    } else {
      this.setState({ dialogVisible: false, isLoading: false })
      Alert.alert(
        "",
        placeorderresponse.message,
        [
          { text: "OK" }
        ],
        { cancelable: true }
      );
    }
  }

  onFooterPress = async () => {
    this.setState({ isLoading: true })
    let paramdata = this.props.navigation.state.params
    let bagData = paramdata.bagproduct
    let shopsid = []
    // get user mobile number
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile

    console.log("bagData", bagData)

    //For shopid array
    bagData.map((item) => {
      shopsid.push(item.products[0].product_id.shop_id);
    });

    //make unique shop id
    let uniqshopsid = shopsid.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    let filterProduct = []

    console.log("uniqshopsid", uniqshopsid)

    if (paramdata.payment_method == 'WALLET') {
      this.placeorderfromWallet(uniqshopsid)
    } else {
      this.placeorderwithoutWallet(uniqshopsid)
    }

  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppStyles.navThemeConstants.light.backgroundColor }}>
        <Header
          headerContainerStyle={{ borderBottomWidth: 0 }}
          headerStyle={{ fontFamily: AppStyles.fontFamily.boldFont }}
          title={"Check out"}
        />

        <View style={styles.card}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.title}>PaymentMethod:</Text>
            <Text style={styles.subtitle}>{this.state.paymentethod}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.title}>Total pay:</Text>
            <Text style={styles.subtitle}>{this.state.totalammount}</Text>
          </View>

        </View>

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <FooterButton

            footerContainerStyle={{
              backgroundColor:
                AppStyles.colorSet[this.props.screenProps.theme]
                  .mainThemeForegroundColor
            }}
            footerTitleStyle={{ color: "white" }}
            onPress={() => this.setState({ dialogVisible: true })}
            // onPress={this.onFooterPress}
            title={"Place Order"}
          />
        </View>
        <Dialog
          visible={this.state.dialogVisible}
          title="Add Delivery Type"
          onTouchOutside={() => this.setState({ dialogVisible: false })} >
          <View>
            <RadioButton.Group onValueChange={value => this.setState({ radioValue: value })} value={this.state.radioValue}>
              <RadioButton.Item label="Delivery in 2 hours" value="2_HOURS" />
              <RadioButton.Item label="Delivery in 4 hours" value="4_HOURS" />
              <RadioButton.Item label="Self Pickup" value="SELF_PICKED" />
            </RadioButton.Group>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 6 ,justifyContent:'center',alignItems:'center'}}>
               
                  <TouchableOpacity style={[styles.adddeviverybtn, { width: '50%' }]} onPress={() => this.setState({ dialogVisible: false })}>

                    <Text style={styles.addtext}>Cancel</Text>

                  </TouchableOpacity>
               
              </View>
              <View style={{ flex: 6,justifyContent:'center', alignItems:'center' }}>
                <TouchableOpacity style={styles.adddeviverybtn} onPress={() => this.onFooterPress()}>
                  {
                    !this.state.isLoading ?
                      <Text style={[styles.text, { fontSize: 18 }]}>Ok</Text>
                      :
                      <ActivityIndicator color={'#000'} size="small" />
                  }
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Dialog>
      </View>
    );
  }
}
//

CheckoutScreen.propTypes = {
  totalPrice: PropTypes.any,
  orderHistory: PropTypes.array,
  cardNumbersEnding: PropTypes.array,
  currentOrderId: PropTypes.string,
  selectedShippingMethod: PropTypes.object,
  selectedPaymentMethod: PropTypes.object,
  shoppingBag: PropTypes.array,
  navigation: PropTypes.object,
  shippingMethods: PropTypes.array,
  stripeCustomer: PropTypes.string,
  user: PropTypes.object,
  setOrderHistory: PropTypes.func
};

const mapStateToProps = ({ checkout, products, app }) => {
  return {
    totalPrice: checkout.totalPrice,
    selectedShippingMethod: checkout.selectedShippingMethod,
    shippingMethods: checkout.shippingMethods,
    cardNumbersEnding: checkout.cardNumbersEnding,
    selectedPaymentMethod: checkout.selectedPaymentMethod,
    currentOrderId: checkout.currentOrderId,
    shoppingBag: products.shoppingBag,
    orderHistory: products.orderHistory,
    stripeCustomer: app.stripeCustomer,
    user: app.user
  };
};

export default connect(
  mapStateToProps,
  { setOrderHistory }
)(CheckoutScreen);
