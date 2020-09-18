"use strict";
import React, { Component } from 'react';
import { View, Text, Alert, ActivityIndicator,TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, Keyboard } from 'react-native';
import AppStyles from '../../AppStyles'
import { Dialog } from 'react-native-simple-dialogs';
import { CreditCardInput } from 'react-native-credit-card-input';
import AsyncStorage from "@react-native-community/async-storage";
import { RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
import getStripeToken from '../../services/StripeApi/getToken'
import createStripeCustomer from '../../services/StripeApi/createCustomer'
import customerCharges from '../../services/StripeApi/customerCharges'
import addamountwallet from '../../services/Wallet/addamountwallet';
import { EventRegister } from 'react-native-event-listeners'
import getamountWallet from '../../services/Wallet/getamountWallet';

export default class AddCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
            cardData: { valid: false },
            addCards: [],
            valueradio: '',
            getcards: [],
            cvvdialogVisible: false,
            cvv:'',
            isLoading: false,
            tokenid:'',
            customerid:''
        };
    }
/**
 * get cards from async storage
 */
    componentDidMount = async () => {
        console.log("amount========", this.props.navigation.state.params.amount)
        let cards = await AsyncStorage.getItem('CardData')
        let cardParsed = JSON.parse(cards)
        console.log("All Cards", cardParsed)
        this.setState({ getcards: cardParsed })
    }
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
            //   EventRegister.emit("SavedCards", addCards)
            this.componentDidMount()
        } else {
            let found = cardParsedData.some(i => i['card[number]'] == cardData.values.number.replace(/ /g, ''))
            if (found == false) {
                cardParsedData.push(saveCard)
                AsyncStorage.setItem("CardData", JSON.stringify(cardParsedData))
                // EventRegister.emit("SavedCards", cardParsedData) 
                this.componentDidMount()
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
     * 
     * @param {number} index index of remove card
     */
    removeCardAlert = async (index) => {

        Alert.alert(
            "Remove Card",
            "Are you sure you want to remove this card?",
            [
                {
                    text: "REMOVE",
                    onPress: () => this.removecard(index)
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
    removecard = async (index) => {
        let data = this.state.getcards
        data.splice(index, 1)
        AsyncStorage.setItem('CardData', JSON.stringify(data))
        this.componentDidMount() 
    }
  /**
   * 
   * @param {any} data clicked card details
   */
   paymentGetToken = (data) => {
    if (this.state.cvv !== '') {
      this.setState({isLoading:true})
      //For get Token for stripe
      this.getStripetoken(data, this.state.cvv)
    }else{
        Alert.alert(
            "",
            "Please add amount from My Wallet",
            [
              { text: "Ok", },
            ],
          ); 
    }
  }
/**
   * 
   * @param {any} cardData card Details
   * @param {any} cvv cvv number
   * get stripe Token 
   */
   getStripetoken = async (cardData, cvv) => {
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
    this.createCustomer(data.id)
  }

  /**
   * 
   * @param {any} tokenID stripe token id
   * create stripe customer 
   */
   createCustomer = async (tokenID) => {
    let userdata = await AsyncStorage.getItem('CurrentUser')
    let userParseData = JSON.parse(userdata)
    let email = userParseData.data.email
    let body = `email=${email}&source=${tokenID}&description=Tribata Shopping`
    // call api for create customer
    const data = await createStripeCustomer(body);
    this.stripeCharges(data.id)
  }

  /**
   * 
   * @param {any} customerID stripe customer id
   * create stripe charge 
   */
   stripeCharges = async (customerID) => {
       let mobile = await AsyncStorage.getItem('CurrentUser')
       let mobileParsed= JSON.parse(mobile)
       console.log("mobile", mobileParsed.data.mobile)
    let total = parseFloat(this.props.navigation.state.params.amount)
    let body = `amount=${total}&currency=usd&customer=${customerID}&description=Tribata Shopping`
    // call stripe charge api
    const data = await customerCharges(body);
    if (data.status == 'succeeded') {
        let phoneNo = mobileParsed.data.mobile
        let body = JSON.stringify({
            amount: total
        })
        const data = await addamountwallet(body, phoneNo)
        console.log("amount=======in api",data)
        if(data.success){
            Alert.alert(
              "",
              "Success",
              [
                { text: "Ok", onPress: () => this.reDirectToWallet() },
              ],
            );
            this.setState({
                isLoading:false,
                cvvdialogVisible:false
            })
        }else{
            this.setState({
                isLoading:false,
                cvvdialogVisible:false
            })
            Alert.alert(
                "",
                data.messageCode,
                [
                  { text: "Ok", },
                ],
              ); 
        }
    }else{
        this.setState({
            isLoading:false,
            cvvdialogVisible:false
        })
        Alert.alert(
            "",
            data.error.code,
            [
              { text: "Ok", },
            ],
          ); 
    }
  }

  reDirectToWallet = async () => {
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    console.log("mobile", phoneno)
    const data = await getamountWallet(phoneno)
    if (data.success) {
        EventRegister.emit('WalletRefresh', data.data.balance)
        this.props.navigation.navigate("MyWallet")
    }
  }
  /**
   * check amount or not for add money to wallet
   */
  checkamountvalue = () => {
      if(this.props.navigation.state.params.amount !== undefined){
          this.setState({cvvdialogVisible: true})
      }
  }
/**
 * Show all Save cards
 */
    showSavedCards = () => {
        const { valueradio, getcards,cvvdialogVisible,isLoading } = this.state
        return (
            <>
                <FlatList
                    data={getcards}
                    renderItem={(item, index) => (
                        <>
                            <RadioButton.Group onValueChange={value => [this.setState({ valueradio: value }), this.checkamountvalue()]} value={valueradio}>
                                <TouchableOpacity
                                    style={styles.addNewCardContainer}>
                                    <View style={{ flex: 8, marginLeft: 5 }}>
                                        <RadioButton.Item label={item.item['card[number]'].replace(/\d(?=\d{4})/g, "*")} color={'#000'} value={item.item['card[number]']} />
                                    </View>
                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.removeCardAlert(item.index)}>
                                        <Icon name={'close'} size={25} color={'#a3a3a3'} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </RadioButton.Group>
                            <Dialog
                                visible={cvvdialogVisible}
                                title="Add your cvv number"
                                onTouchOutside={() => this.setState({cvvdialogVisible: false})}>
                                <View>
                                    <TextInput
                                        keyboardType='number-pad'
                                        underlineColorAndroid="transparent"
                                        secureTextEntry
                                        placeholder='Add cvv'
                                        maxLength={3}
                                        style={styles.cvvinput}
                                        onChangeText={(text) => this.setState({cvv: text})}
                                    />
                                    <View style={styles.addbtnContainer}>
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.paymentGetToken(item.item)}>
                                            {
                                                isLoading ?
                                                    <ActivityIndicator color={'#000'} size="small" />
                                                    :
                                                    <Text style={styles.addtext}>Add</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </Dialog>
                        </>
                    )
                    }
                />
            </>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => this.setState({ dialogVisible: true })}
                        style={[styles.card, { width: '60%', padding: 10, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>Add Cards</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    {this.showSavedCards()}
                </View>
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

            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    card: {
        marginTop: 5,
        backgroundColor: '#a3a3a3',
        padding: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5,

    },
    rstxt: {
        fontFamily: AppStyles.fontFamily.boldFont,
        fontSize: 30
    },
    mainView: {
        flex: 1,
        marginTop: 10
    },
    detailMainCard: {
        backgroundColor: '#fff',
        height: 'auto',
        flexDirection: 'row',
        padding: 10
    },
    user: {
        width: 35,
        height: 35,
        justifyContent: 'center'
    },
    customerName: {
        fontSize: 18
    },
    addNewCardContainer: {
        flexDirection: "row",
        marginTop: 17,
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5
    },
    addbtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
      },
      addcvvbutton: {
        borderColor: '#a3a3a3',
        borderRadius: 5,
        width: '40%',
        height: 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
      },
});