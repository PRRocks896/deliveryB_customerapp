import React, { Component } from "react";
import { connect } from "react-redux";
import { Alert, View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import { CreditCardInput } from 'react-native-credit-card-input';
import {
  Header,
  ProcedureImage,
  PaymentOptions,
  HeaderButton
} from "../../components";
import { updatePaymentMethods, setShippingMethods } from "../../redux";
import AppStyles from "../../AppStyles";
import { Dialog } from 'react-native-simple-dialogs';
import styles from "react-native-icon-badge/style";
import AsyncStorage from "@react-native-community/async-storage";
import { EventRegister } from 'react-native-event-listeners'
import createOrderRazorpay from "../../services/Order/createrazorpayorder";
import RazorpayCheckout from 'react-native-razorpay';

class PaymentMethodScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;
    return {
      headerTintColor: AppStyles.navThemeConstants.light.fontColor,
      cardStyle: {
        backgroundColor: AppStyles.navThemeConstants.light.backgroundColor
      },
      headerStyle: {
        backgroundColor: AppStyles.navThemeConstants.light.backgroundColor,
        borderBottomWidth: 0
      },
      headerLeft: (
        <HeaderButton
          onPress={() => {
            navigation.goBack();
          }}
          buttonContainerStyle={{ marginLeft: 10 }}
          title={"Cancel"}
        />
      ),
      headerRight: (
        <HeaderButton
          onPress={params.setOrderDetails}
          buttonContainerStyle={{ marginRight: 10 }}
          title={"Next"}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.state = {
      cardNumberValue: "",
      dialogVisible: false,
      cardData: { valid: false },
      tokenid: '',
      customerID: '',
      transactionid: '',
      chargeConfirm: '',
      addCards: [],

    };
  }

  componentDidMount() {

    //on click next button navigation function 
    this.props.navigation.setParams({
      setOrderDetails: this.setOrderDetails
    });
    // this is for stripe confiem massage, call from PaymentOption
    EventRegister.addEventListener('confirm', (data) => {
      this.setState({ chargeConfirm: data })
    })
    // this is for stripe transactionid, call from PaymentOption
    EventRegister.addEventListener('transactionid', (data) => {
      this.setState({ transactionid: data })
    })
  }

  /**
   * on click next call this function
   * this is for navigation
   * check payment method
   */
  setOrderDetails = async () => {
    const { chargeConfirm, transactionid } = this.state
    let data = this.props.navigation.state.params
    let payamount = data.totalPrice
    console.log("trs id",transactionid , payamount)
    if (chargeConfirm !== '') {
      this.props.navigation.replace("ShippingAddress", {
        appConfig: this.appConfig,
        transactionid: chargeConfirm == 'succeeded' ? transactionid : '',
        customerID: data.customerID,
        bagproduct: data.product,
        totalammount: chargeConfirm == 'WALLET' ? payamount : data.totalPrice,
        payment_method: chargeConfirm,
        order_number: Math.floor(100000000000 + Math.random() * 900000000000),
        totalkm:data.totalkm
      });
    }
    else {
      Alert.alert(
        "Incomplete Process",
        "Kindly add your Payment method.",
        [
          {
            text: "OK"
          }
        ],
        { cancelable: true }
      );
    }
  };

  /**
   * For add new Cards
   */
  onAddNewCard = async () => {
    const { user } = this.props;
    this.setState({ dialogVisible: true })
  };



  /**
   * add cards from here
   */
  addcardDetails = async () => {
    this.setState({ dialogVisible: false })
    const { cardData } = this.state
    if (cardData.valid) {
      this.storecards(cardData)
    } else {
      Alert.alert("Invalid Data")
    }

  }

  /**
   * 
   * @param {any} cardData card details
   * store card details in async storage
   */
  storecards = async (cardData) => {
    const { addCards } = this.state
    let carddata = await AsyncStorage.getItem('CardData')
    let cardParsedData = JSON.parse(carddata)
    let saveCard = {
      'card[number]': cardData.values.number.replace(/ /g, ''),
      'card[exp_month]': cardData.values.expiry.split('/')[0],
      'card[exp_year]': cardData.values.expiry.split('/')[1],
    }
    if (cardParsedData == null || cardParsedData == []) {
      addCards.push(saveCard)
      AsyncStorage.setItem("CardData", JSON.stringify(addCards))
      EventRegister.emit("SavedCards", addCards)

    } else {
      let found = cardParsedData.some(i => i['card[number]'] == cardData.values.number.replace(/ /g, ''))
      if (found == false) {
        cardParsedData.push(saveCard)
        AsyncStorage.setItem("CardData", JSON.stringify(cardParsedData))
        EventRegister.emit("SavedCards", cardParsedData)

      } else {
        Alert.alert(
          "Card Details",
          "Already Added",
          [
            {
              text: "OK"
            }
          ],
          { cancelable: true }
        );
      }
    }

  }
  /**
   * for cod method
   */
  pressCodMethod = () => {
    EventRegister.emit("CODdata", "COD")
    this.setState({ chargeConfirm: 'COD' })
    setTimeout(() => {
      this.setOrderDetails()
    }, 100);
  }
  /**
   * For Wallet method
   */
  pressmywallet = () => {
    EventRegister.emit("CODdata", "WALLET")
    this.setState({ chargeConfirm: 'WALLET' })
    setTimeout( () => {
      this.setOrderDetails()

    }, 100)
  }

  otheroptionsPress = () => {
    EventRegister.emit("CODdata", "OTHER")
    this.createOrder()
  }

  createOrder = async () => {
    let data = this.props.navigation.state.params

    let amount = Math.floor(data.totalPrice)
    console.log("total amount", amount)
    let body = JSON.stringify({
      "amount": amount * 100,
      "currency": "INR",
      "receipt": 'receipt#' + Math.floor(100000000 + Math.random() * 900000000),
      "notes": "Test Payment"
    })
    console.log("============body", body)
    const response = await createOrderRazorpay(body)
    console.log("Response of razor pay order", response)
   
    if (response && response.status == 'created') {
      this.razorpayopen(response.id)
    }
  }

  razorpayopen = async(orderid) => {

    let profile = await AsyncStorage.getItem('CurrentUser')
    let parsedData = JSON.parse(profile)
    let name =  parsedData.data.name
    let email = parsedData.data.email
    let contact = parsedData.data.mobile
    let data = this.props.navigation.state.params
    let amount = Math.floor(data.totalPrice) * 100
    var options = {
      description: 'Tribata',
      image: 'https://linkpicture.com/q/logo_227.png',
      currency: 'INR',
      key: 'rzp_test_WnyFW6axxBffc1',
      amount:  amount * 100,
      name: name,
      order_id: orderid,
      prefill: {
        email: email,
        contact: contact,
        name: name
      },
      theme: { color: '#53a20e' }
    }
    RazorpayCheckout.open(options).then((data) => {
     console.log("On Success response", data)
     this.setState({transactionid : data.razorpay_payment_id})
     this.setState({ chargeConfirm: 'OTHER' })
     this.setOrderDetails()
    }).catch((error) => {
      alert(`Error: ${error.code} | ${error.description}`);
    });
  }

  render() {
    const currentTheme =
      AppStyles.navThemeConstants[this.props.screenProps.theme];

    return (
      <>
        <Header title={"Payment Method"} />
        <ProcedureImage source={AppStyles.imageSet.creditCard} />

        <PaymentOptions
          onPaymentMethodLongPress={this.onPaymentMethodLongPress}
          onAddNewCard={this.onAddNewCard}
          onpressCod={this.pressCodMethod}
          navigation={this.props.navigation}
          cardNumbersEnding={this.props.cardNumbersEnding}
          paymentMethods={this.props.paymentMethods}
          totalprice={this.props.navigation.state.params.totalPrice}
          onmywalletpress={this.pressmywallet}
          onPressOther={this.otheroptionsPress}

        />
        {/* dialog box open for add new card */}
        <Dialog
          visible={this.state.dialogVisible}
          title="Add Your Card"
          onTouchOutside={() => this.setState({ dialogVisible: false })} >
          <View>
            <CreditCardInput requiresName onChange={(cardData) => this.setState({ cardData })} />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => this.setState({ dialogVisible: false })} style={{ marginTop: 10, position: 'absolute', right: 0 }}>
                <Text style={[styles.text, { fontSize: 18 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.addcardDetails()} style={{ marginTop: 10, marginLeft: 10 }}>
                <Text style={[styles.text, { fontSize: 18 }]}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>

      </>
    );
  }
}

PaymentMethodScreen.propTypes = {
  cardNumbersEnding: PropTypes.array,
  navigation: PropTypes.object,
  paymentMethods: PropTypes.array,
  user: PropTypes.object,
  stripeCustomer: PropTypes.string,
  setShippingMethods: PropTypes.func,
  updatePaymentMethods: PropTypes.func
};

const mapStateToProps = ({ checkout, app }) => {
  return {
    totalPrice: checkout.totalPrice,
    shippingMethod: checkout.shippingMethod,
    cardNumbersEnding: checkout.cardNumbersEnding,
    paymentMethods: checkout.paymentMethods,
    user: app.user,
    stripeCustomer: app.stripeCustomer
  };
};

export default connect(
  mapStateToProps,
  {
    setShippingMethods,
    updatePaymentMethods
  }
)(PaymentMethodScreen);
