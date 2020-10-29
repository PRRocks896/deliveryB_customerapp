import React, { Component } from "react";
import { View, Alert, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Header, FooterButton } from "../../../components";
import AppStyles from "../../../AppStyles";
import { Dialog } from 'react-native-simple-dialogs';
import { RadioButton } from 'react-native-paper';
import addBookingData from "../../../services/ShopServices/addbooking";
import shopdetails from "../../../services/ShopDetails/shopdetails";
import payfromwallet from "../../../services/Wallet/payfromwallet";
import AsyncStorage from "@react-native-community/async-storage";
import Toast from 'react-native-simple-toast';


class PlaceServiceScrren extends Component {
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

      clickOk: false
    };
    // this.appConfig =
    //   props.navigation.state.params.appConfig ||
    //   props.navigation.getParam("appConfig");

  }

  async componentDidMount() {
    console.log("this.props.navigation.state.params", this.props.navigation.state.params)
  }

  payfromwalletFun = async(paramdata) => {
      console.log("WALLET METHOD")
    let mobile = await AsyncStorage.getItem('CurrentUser')
    let mobileParsed = JSON.parse(mobile)
    let phoneno = mobileParsed.data.mobile
    const shopDetailsres = await shopdetails( paramdata.shopid)
   
    if(shopDetailsres.statusCode == 200){
        let body = JSON.stringify({
            shop_mobile: shopDetailsres.data.mobile,
            amount: paramdata.totalammount
          })
          //For Pay amount from wallet
          const paydata = await payfromwallet(body, phoneno)
          if (paydata.statusCode == 200) {
                console.log("Pay data", paydata)
                let body = JSON.stringify({
                    customer_id: paramdata.customerID,
                    shop_id: paramdata.shopid,
                    transaction_id: paydata.data.transaction_id,
                    payment_method: paramdata.payment_method,
                    amount: paramdata.totalammount,
                    booking_number: (paramdata.booking_number).toString(),
                    service_id: paramdata.service_id,
                    slot_date: paramdata.slot_date,
                    slot_time:paramdata.slot
                })
                const response = await addBookingData(body)
                console.log("Response", response)
                if(response.statusCode == 200) {
                    this.setState({ isLoading: false })
                    this.props.navigation.navigate('ServicebookDetails')
                    Toast.show(response.message, Toast.LONG);
                }else{
                    this.setState({ isLoading: false })
                    Alert.alert(
                        "",
                        response.message,
                        [
                          { text: "OK" }
                        ],
                        { cancelable: true }
                      );
                }
          }
    }
  }
  paycodorcardFun = async(paramdata) => {

    console.log("IN COD OR CARD METHOD")
    let body = JSON.stringify({
        customer_id: paramdata.customerID,
        shop_id: paramdata.shopid,
        transaction_id: paramdata.transactionid,
        payment_method: paramdata.payment_method,
        amount: paramdata.totalammount,
        booking_number: (paramdata.booking_number).toString(),
        service_id: paramdata.service_id,
        slot_date: paramdata.slot_date,
        slot_time:paramdata.slot
    })
    const response = await addBookingData(body)

    console.log("Place order==============", response)
    if(response.statusCode == 200) {
        this.props.navigation.navigate('ServicebookDetails')
        Toast.show(response.message, Toast.LONG);
        this.setState({ isLoading: false })
    }else{
        this.setState({ isLoading: false })
        Alert.alert(
            "",
            response.message,
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
    // console.log("this.props.navigation", paramdata)
    if( paramdata.payment_method == 'WALLET'){
        this.payfromwalletFun(paramdata)
    }else{
        this.paycodorcardFun(paramdata)
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
            {
                this.state.isLoading ? 
                <ActivityIndicator size={'large'} color={'#000'} /> 
                 :
          <FooterButton

            footerContainerStyle={{
              backgroundColor:
                AppStyles.colorSet[this.props.screenProps.theme]
                  .mainThemeForegroundColor
            }}
            footerTitleStyle={{ color: "white" }}
            onPress={this.onFooterPress}
            title={"Book Service"}
          />
            }
        </View>
       
      </View>
    );
  }
}
//


export default PlaceServiceScrren

const styles = StyleSheet.create({
    container: {
        flex: 1
      },
      card: {
        margin: 5,
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5
      },
      title: {
        fontFamily: AppStyles.fontFamily.regularFont,
        fontSize: 20,
        padding: 5
      },
      subtitle: {
        fontFamily: AppStyles.fontFamily.lightFont,
        fontSize: 18,
        padding: 5,
        right: 10,
        position: 'absolute'
      },
      adddeviverybtn: {
        borderColor: '#a3a3a3',
        borderRadius: 5,
        width: '40%',
        height: 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }
})