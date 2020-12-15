import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import AppStyles from "../../AppStyles";
import { setSelectedPaymentMethod } from "../../redux/";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons'
import { RadioButton } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import getStripeToken from "../../services/StripeApi/getToken";
import createStripeCustomer from "../../services/StripeApi/createCustomer";
import customerCharges from "../../services/StripeApi/customerCharges";
import { EventRegister } from 'react-native-event-listeners'
import getamountWallet from "../../services/Wallet/getamountWallet";
import Razorpay from 'react-native-razorpay';

function PaymentOptions(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { paymentMethods, onAddNewCard, onpressCod, onmywalletpress, totalprice, onPressOther } = props;

  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [getCards, setGetCards] = useState([])
  const [valueradio, setvalueRadio] = useState('')
  const [dialogVisible, setdialogVisible] = useState(false)
  const [cvv, setcvv] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [chargeConfirm, setChargeConfirm] = useState('')
  const [isLoading, setisLoading] = useState(false)
  const [isSelect, setIsSelect] = useState('')
  const [walleteamount, setwalleteamount] = useState('')
  const [walleterror, setwalleterror] = useState('')


  useEffect(() => {
    // props.setSelectedPaymentMethod(props.paymentMethods[0]);
    EventRegister.addEventListener('CODdata', (data) => {
      if (data == "COD") {
        setvalueRadio('')
        setIsSelect('COD')
      }
      else if (data == "WALLET") {
        setvalueRadio('')
        setIsSelect('WALLET')
      }
      else if (data == "OTHER") {
        setvalueRadio('')
        setIsSelect('OTHER')
      }
    })
    EventRegister.addEventListener('SavedCards', (data) => {
      setGetCards(data)
    })
    getSavedCards()
    getwalletvalue()

  });



  const getwalletvalue = async () => {
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile

    const data = await getamountWallet(phoneno)
    if (data.success) {

      setwalleteamount(data.data.balance)
      // this.setState({ walleteamount: data.data.balance })
      if (totalprice > data.data.balance) {
        setwalleterror('insufficient balance, Please add amount to your wallet')
      } else {
        setwalleterror('')
      }
    }
  }

  /**
   * get already saved card details from Async storage for display cards
   */
  const getSavedCards = async () => {
    let cards = await AsyncStorage.getItem('CardData')
    let cardParsed = JSON.parse(cards)
    setGetCards(cardParsed)
  }


  /**
   * 
   * @param {any} data clicked card details
   */
  const paymentGetToken = (data) => {
    if (cvv !== '') {
      setisLoading(true)
      //For get Token for stripe
      getStripetoken(data, cvv)
    }
  }

  /**
   * 
   * @param {any} cardData card Details
   * @param {any} cvv cvv number
   * get stripe Token 
   */
  const getStripetoken = async (cardData, cvv) => {
    const card = {
      'card[number]': cardData['card[number]'],
      'card[exp_month]': cardData['card[exp_month]'],
      'card[exp_year]': cardData['card[exp_year]'],
      'card[cvc]': cvv
    };
    let body = Object.keys(card)
      .map(key => key + '=' + card[key])
      .join('&')

    //call api for get stripe token
    const data = await getStripeToken(body);
    createCustomer(data.id)
  }

  /**
   * 
   * @param {any} tokenID stripe token id
   * create stripe customer 
   */
  const createCustomer = async (tokenID) => {
    let userdata = await AsyncStorage.getItem('CurrentUser')
    let userParseData = JSON.parse(userdata)
    let email = userParseData.data.email
    let body = `email=${email}&source=${tokenID}&description=Tribata Shopping`
    // call api for create customer
    const data = await createStripeCustomer(body);
    stripeCharges(data.id)
  }

  /**
   * 
   * @param {any} customerID stripe customer id
   * create stripe charge 
   */
  const stripeCharges = async (customerID) => {
    let total = totalprice
    let body = `amount=${total}&currency=usd&customer=${customerID}&description=Tribata Shopping`
    // call stripe charge api
    const data = await customerCharges(body);
    setTransactionId(data.id)
    setChargeConfirm(data.status)
    if (data.status == 'succeeded') {
      Alert.alert(
        "",
        "Now you can able to click next",
        [
          { text: "Ok", },
        ],
      );
      setisLoading(false)
      setdialogVisible(false)
      EventRegister.emit('confirm', data.status)
      EventRegister.emit('transactionid', data.id)
    }

  }

  /**
   * 
   * @param {number} index index of remove card
   * remove card alert show from here
   */
  const removeCardAlert = async (index) => {

    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this card?",
      [
        {
          text: "REMOVE",
          onPress: () => removecard(index)
        },
        { text: 'CANCEL' }
      ],

    );
  }

  /**
   * 
   * @param {number} index index of remove card
   * remove card from async storage
   */
  const removecard = async (index) => {
    getCards.splice(index, 1)
    AsyncStorage.setItem('CardData', JSON.stringify(getCards))
  }
  /**
   * Show Saved AllCards from async storage
   */
  const showSavedCards = () => {
    return (
      <>

        <FlatList
          data={getCards}
          renderItem={(item, index) => {
            return (
              <>
                <RadioButton.Group onValueChange={value => [setvalueRadio(value), setdialogVisible(true), setIsSelect('')]} value={valueradio}>
                  <TouchableOpacity
                    style={styles.addNewCardContainer}>
                    <View style={{ flex: 8, marginLeft: 5 }}>
                      <RadioButton.Item label={item.item['card[number]'].replace(/\d(?=\d{4})/g, "*")} color={'#000'} value={item.item['card[number]']} />
                    </View>
                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => removeCardAlert(item.index)}>
                      <Icon name={'close'} size={25} color={'#a3a3a3'} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </RadioButton.Group>
                <Dialog
                  visible={dialogVisible}
                  title="Add your cvv number"
                  onTouchOutside={() => setdialogVisible(false)}>
                  <View>
                    <TextInput
                      keyboardType='number-pad'
                      underlineColorAndroid="transparent"
                      secureTextEntry
                      placeholder='Add cvv'
                      maxLength={3}
                      style={styles.cvvinput}
                      onChangeText={(text) => setcvv(text)}
                    />
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 6 }}>
                        <View style={styles.addbtnContainer}>
                          <TouchableOpacity style={[styles.addcvvbutton, { width: '50%' }]} onPress={() => setdialogVisible(false)}>

                            <Text style={styles.addtext}>Cancel</Text>

                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={{ flex: 6 }}>
                        <View style={styles.addbtnContainer}>
                          <TouchableOpacity style={styles.addcvvbutton} onPress={() => paymentGetToken(item.item)}>
                            {
                              isLoading ?
                                <ActivityIndicator color={'#000'} size="small" />
                                :
                                <Text style={styles.addtext}>Add</Text>
                            }
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                  </View>

                </Dialog>
              </>
            )
          }}
        />


      </>
    )
  }

  return (
    <ScrollView>
      <View style={styles.shippingDetailsContainer}>
      </View>

      <TouchableOpacity
        onPress={onPressOther}
        style={styles.addNewCardContainer}
      >
        <View style={styles.addNewCardIconContainer}>
          <Icon name={'payment'} size={25} />
        </View>
        <View style={{ backgroundColor: isSelect == 'OTHER' ? '#a3a3a3' : '#fff', flexDirection: 'row', flex: 6, padding: 10 }}>
          <Text style={[styles.addNewCardTitle, { color: isSelect == 'OTHER' ? '#fff' : '#000' }]}>{"Debit card / Credit card / Net banking"}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onpressCod}
        style={styles.addNewCardContainer}
      >
        <View style={styles.addNewCardIconContainer}>
          <Icon name={'payment'} size={25} />
        </View>
        <View style={{ backgroundColor: isSelect == 'COD' ? '#a3a3a3' : '#fff', flexDirection: 'row', flex: 6, padding: 10 }}>
          <Text style={[styles.addNewCardTitle, { color: isSelect == 'COD' ? '#fff' : '#000' }]}>{"Cod"}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={walleterror == '' ? onmywalletpress : null}
        style={styles.addNewCardContainer}
      >
        <View style={styles.addNewCardIconContainer}>
          <Icon name={'payment'} size={25} />
        </View>
        <View style={{ flexDirection: 'row', flex: 6, backgroundColor: isSelect == 'WALLET' ? '#a3a3a3' : '#fff', padding: 10 }}>
          <Text style={[styles.addNewCardTitle, { color: isSelect == 'WALLET' ? '#fff' : '#000' }]}>{"My Wallet"}</Text>
          <Text style={[styles.amounttxt, { color: walleterror !== '' ? 'red' : 'green' }]}> ( ₹  {walleteamount} )</Text>
        </View>
      </TouchableOpacity>
      {
        walleterror !== '' ?
          <View>
            <Text style={styles.errortxt}> {walleterror}</Text>
          </View>
          : null
      }
      


      {/* <TouchableOpacity
        onPress={onAddNewCard}
        style={styles.addNewCardContainer}
      >
        <View style={styles.addNewCardIconContainer}>
          <Image
            source={AppStyles.iconSet.plus}
            resizeMode="contain"
            style={styles.addCardIcon}
          />
        </View>
        <View style={styles.addNewCardTitleContainer}>
          <Text style={styles.addNewCardTitle}>{"Add New Card..."}</Text>
        </View>
      </TouchableOpacity>
      {showSavedCards()} */}
    </ScrollView>
  );
}

PaymentOptions.propTypes = {
  paymentMethods: PropTypes.array,
  navigation: PropTypes.object,
  onAddNewCard: PropTypes.func,
  onPaymentMethodLongPress: PropTypes.func,
  setSelectedPaymentMethod: PropTypes.func
};

export default connect(null, { setSelectedPaymentMethod })(PaymentOptions);
