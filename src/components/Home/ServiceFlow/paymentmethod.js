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
} from "../../../components";
import AppStyles from "../../../AppStyles";
import { Dialog } from 'react-native-simple-dialogs';
import styles from "react-native-icon-badge/style";
import AsyncStorage from "@react-native-community/async-storage";
import { EventRegister } from 'react-native-event-listeners'
import RazorpayCheckout from 'react-native-razorpay';
import createOrderRazorpay from "../../../services/Order/createrazorpayorder";
import Config from "../../../config";
import getRazorpaykey from "../../../services/Razorpay/getkeyrazorpay";

class ServicePaymentOptions extends Component {
  

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
  
    this.state = {
      cardNumberValue: "",
      dialogVisible: false,
      cardData: { valid: false },
      tokenid: '',
      customerID: '',
      transactionid: '',
      chargeConfirm: '',
      addCards: [],

      razorpay_key:''

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

    this.getRazorpaykey()
  }

  getRazorpaykey = async () => {
    const response = await getRazorpaykey()
    console.log("response of razorpay key", response)
    if(response.key_id){
      this.setState({razorpay_key: response.key_id})
    }
  }


  /**
   * on click next call this function
   * this is for navigation
   * check payment method
   */
  setOrderDetails = async () => {
    const { chargeConfirm, transactionid } = this.state
    let data = this.props.navigation.state.params
    
  
    if (chargeConfirm !== '') {

    this.props.navigation.navigate("PlaceServiceScrren", {
        transactionid: chargeConfirm === 'succeeded' ? transactionid : '',
        customerID: data.customerID,
        totalammount: chargeConfirm == 'WALLET' ? data.totalammount : data.totalammount,
        payment_method: chargeConfirm === 'succeeded' ? 'Card' : chargeConfirm ,
        booking_number: Math.floor(100000000000 + Math.random() * 900000000000),
        slot:data.slot,
        shopid: data.shopid,
        service_id: data.service_id,
        slot_date: data.slot_date,

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
  }
  /**
   * For Wallet method
   */
  pressmywallet = () => {
    EventRegister.emit("CODdata", "WALLET")
    this.setState({ chargeConfirm: 'WALLET' })
  }

  otheroptionsPress = () => {
    EventRegister.emit("CODdata", "OTHER")
    

    this.createOrder()
  }

  createOrder = async () => {
    let data = this.props.navigation.state.params

    let amount = Math.floor(data.totalammount)
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
    let amount = Math.floor(data.totalammount) * 100
    var options = {
      description: 'Tribata',
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: this.state.razorpay_key,
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
    }).catch((error) => {
      // alert(`Error: ${error.code} | ${error.description}`);
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
          totalprice={this.props.navigation.state.params.totalammount}
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


export default ServicePaymentOptions