import React, { Component } from "react";
import { connect } from "react-redux";
import { Alert, View, Text, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PropTypes from "prop-types";
import { CreditCardInput } from 'react-native-credit-card-input';
import {
  Header,
  ProcedureImage,
  PaymentOptions,
  HeaderButton
} from "../../components";
import { firebaseDataManager, stripeDataManager } from "../../apis";
import { updatePaymentMethods, setShippingMethods } from "../../redux";
import AppStyles from "../../AppStyles";
import { Dialog } from 'react-native-simple-dialogs';
import styles from "react-native-icon-badge/style";
import AsyncStorage from "@react-native-community/async-storage";
import { EventRegister } from 'react-native-event-listeners'

const options = {
  requiredBillingAddressFields: "full",
  prefilledInformation: {
    billingAddress: {
      name: "Marya Ken",
      line1: "Canary Place",
      line2: "3",
      city: "Macon",
      state: "Georgia",
      country: "US",
      postalCode: "31217"
    }
  }
};

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

    //  fo cards
    if (chargeConfirm == 'succeeded') {
      // console.log("Confirm>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
      this.props.navigation.replace("ShippingAddress", {
        appConfig: this.appConfig,
        transactionid: transactionid,
        customerID: data.customerID,
        bagproduct: data.product,
        totalammount: data.totalPrice,
        payment_method: 'Card',
        order_number: Math.floor(100000000000 + Math.random() * 900000000000)
      });
    } else if (chargeConfirm == 'COD') { // for COD 
      // console.log("Cod Method")
      this.props.navigation.replace("ShippingAddress", {
        appConfig: this.appConfig,
        transactionid: '',
        customerID: data.customerID,
        bagproduct: data.product,
        totalammount: data.totalPrice,
        payment_method: 'COD',
        order_number: Math.floor(100000000000 + Math.random() * 900000000000)
      });
    }
    else {
      Alert.alert(
        "Incomplete Process",
        "Kindly add your card proper.",
        [
          {
            text: "OK"
          }
        ],
        { cancelable: true }
      );
    }
  };

  setPaymentMethods = methods => {
    this.props.updatePaymentMethods(methods);
  };

  setShippingMethods = async methods => {
    if (methods.length > 1) {
      this.props.setShippingMethods(methods);
    }
  };


  onAddNewCard = async () => {
    const { user } = this.props;
    this.setState({ dialogVisible: true })
  };

  onPaymentMethodLongPress = method => {
    Alert.alert(
      "Remove card",
      "This card will be removed from payment methods.",
      [
        {
          text: "Remove",
          onPress: () => this.removeFromPaymentMethods(method),
          style: "destructive"
        },
        {
          text: "Cancel"
        }
      ],
      { cancelable: true }
    );
  };

  removeFromPaymentMethods = async method => {
    try {
      const result = await stripeDataManager.deletePaymentSource(
        this.props.stripeCustomer,
        method.cardId
      );

      if (result.data.response.deleted) {
        await firebaseDataManager.deleteFromUserPaymentMethods(method.cardId);
      }
    } catch (error) {
      alert(error);
    }
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
    console.log("casll cod")
    EventRegister.emit("CODdata", "true")
    this.setState({ chargeConfirm: 'COD' })
    Alert.alert(
      "You select COD Method",
      "Now you can able to click next",
      [
        { text: "Ok", },
      ],
    );


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
