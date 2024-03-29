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
import Toast from 'react-native-simple-toast';

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
      isLoading: false,

      clickOk: false,
      totalkm: this.props.navigation.state.params.totalkm

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

    let paramdata = this.props.navigation.state.params
    let bagData = paramdata.bagproduct
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    let filterProduct = []


    uniqshopsid.map(async (item) => {

      // For get shop details from shop id
      const shopDetailsres = await shopdetails(item)

      if (shopDetailsres.success) {
        let shopMobile = shopDetailsres.data.shopDetail.user_id.mobile
        let body = JSON.stringify({
          shop_mobile: shopMobile,
          amount: paramdata.totalammount
        })

        //For Pay amount from wallet
        const paydata = await payfromwallet(body, phoneno)
        if (paydata.statusCode == 200) {
          //make data for place order
          bagData.map((productsdata) => {
            if (item == productsdata.products[0].product_id.shop_id) {

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

          // Make unique result 
          var result = filterProduct.reduce((unique, o) => {
            if (!unique.some(obj => obj.shop_id === o.shop_id)) {
              unique.push(o);
            }
            return unique;
          }, []);

          result.map((item, indexOfResult) => {
            let obj = [];
            bagData.map((productitem, indexOfBagdata) => {
              if (item.shop_id == productitem.products[0].product_id.shop_id) {
                obj.push({
                  product_id: productitem.products[0].product_id._id,
                  price: productitem.products[0].price,
                  quantity: productitem.products[0].quantity,
                  color: productitem.products[0].color,
                  size: productitem.products[0].size,
                  discount_price: productitem.products[0].discount_price
                })
              }
            })
            result[indexOfResult].products = obj
          })



          //Call Place order api
          const placeorderresponse = await placeOrder(JSON.stringify(result));

          if (placeorderresponse == undefined) {
            this.setState({ dialogVisible: false, isLoading: false })
            Alert.alert(
              "",
              "Internal Server Error",
              [
                { text: "OK" }
              ],
              { cancelable: true }
            );
          }
          else if (placeorderresponse.statusCode == 200) {
            this.setState({ dialogVisible: false, isLoading: false })

            bagData.map(async (item) => {

              // After place order make statis true for placed products
              const cartStatus = await changeCartStatus(item._id)
              if (cartStatus.statusCode == 200) {

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

    let paramdata = this.props.navigation.state.params
    let bagData = paramdata.bagproduct
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    let filterProduct = []


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


    // Make unique result 
    var result = filterProduct.reduce((unique, o) => {
      if (!unique.some(obj => obj.shop_id === o.shop_id)) {
        unique.push(o);
      }
      return unique;
    }, []);
    result.map((item, indexOfResult) => {
      let obj = [];
      bagData.map((productitem, indexOfBagdata) => {
        if (item.shop_id == productitem.products[0].product_id.shop_id) {
          obj.push({
            product_id: productitem.products[0].product_id._id,
            price: productitem.products[0].price,
            quantity: productitem.products[0].quantity,
            color: productitem.products[0].color,
            size: productitem.products[0].size,
            discount_price: productitem.products[0].discount_price
          })
        }
      })
      result[indexOfResult].products = obj
    })


    //Call Place order api
    const placeorderresponse = await placeOrder(JSON.stringify(result));
    console.log("placeorderresponse", placeorderresponse)
    if (placeorderresponse == undefined) {
      this.setState({ dialogVisible: false, isLoading: false })
      Alert.alert(
        "",
        "Internal Server Error",
        [
          { text: "OK" }
        ],
        { cancelable: true }
      );
    }
    else if (placeorderresponse.statusCode == 200) {
      this.setState({ dialogVisible: false, isLoading: false })
      bagData.map(async (item) => {
        // After place order make statis true for placed products
        const cartStatus = await changeCartStatus(item._id)

        if (cartStatus.statusCode == 200) {

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


    if (this.state.totalkm >= 15) {
      Toast.show('This delivery taking 3 to 4 Days to deliver and It will carry up to 15kg.', Toast.LONG, [
        'UIAlertController',
      ]);
    }

    if (this.state.radioValue !== '') {

      let paramdata = this.props.navigation.state.params
      let bagData = paramdata.bagproduct
      let shopsid = []
      // get user mobile number
      let mobile = await AsyncStorage.getItem('CurrentUser')
      let mobileParsed = JSON.parse(mobile)
      let phoneno = mobileParsed.data.mobile


      //For shopid array
      bagData.map((item) => {
        shopsid.push(item.products[0].product_id.shop_id);
      });

      //make unique shop id
      let uniqshopsid = shopsid.filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) == index;
      });
      let filterProduct = []


      this.setState({ isLoading: true })

      if (paramdata.payment_method == 'WALLET') {
        this.placeorderfromWallet(uniqshopsid)
      } else {

        this.placeorderwithoutWallet(uniqshopsid)
      }
    }


  };

  render() {

    console.log(">>>>>>>>>>>>>>>>>>>", this.state.totalkm)
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
            <Text style={styles.subtitle}>{(this.state.totalammount).toFixed(2)}</Text>
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

              <RadioButton.Item label="Delivery" value="3_OR_4_DAYS" disabled={this.state.clickOk} />
              <RadioButton.Item label="Self Pickup" value="SELF_PICKED" disabled={this.state.clickOk} />


            </RadioButton.Group>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 6, justifyContent: 'center', alignItems: 'center' }}>

                <TouchableOpacity style={[styles.adddeviverybtn, { width: '50%' }]} onPress={() => this.setState({ dialogVisible: false, clickOk: false })}>

                  <Text style={styles.addtext}>Cancel</Text>

                </TouchableOpacity>

              </View>
              <View style={{ flex: 6, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={styles.adddeviverybtn} onPress={() => {
                  this.onFooterPress();
                  if (this.state.radioValue !== '') {
                    this.setState({ clickOk: true })
                  }
                }}>
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
