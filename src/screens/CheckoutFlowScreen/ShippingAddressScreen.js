import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
  Alert
} from "react-native";
import { connect } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PropTypes from "prop-types";
import {
  Header,
  ProcedureImage,
  ShippingDetails,
  HeaderButton
} from "../../components";
import { firebaseDataManager } from "../../apis";
import { setShippingAddress, setTotalPrice, setUserData } from "../../redux/";
import AppStyles from "../../AppStyles";
import AppConfig from "../../ShopertinoConfig";
import getAddressviaUSer from "../../services/SavedAddress/getAddressviaUser";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome'
import styles from "react-native-icon-badge/style";



class ShippingAddressScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;

    return {
      headerTintColor: AppStyles.navThemeConstants.light.fontColor,
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
          onPress={params.navigateUser}
          buttonContainerStyle={{ marginRight: 10 }}
          title={"Next"}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.shippingAddress = [];
    this.shouldNavigateUser = false;
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.state = {
      address: [],
      currentAddressId: ''
    }
  }

  componentDidMount = async () => {
    // console.log("in address screen", this.props.navigation.state.params)
    this.props.navigation.setParams({
      navigateUser: this.navigateUser
    });

    let userid = await AsyncStorage.getItem('userId')
    const data = await getAddressviaUSer(userid);
    console.log("id=================", data.data._id)
    this.setState({ currentAddressId: data.data._id })
    if (data.data.address) {
      data.data.address.filter(item => {
        if (item.isDefault == true) {
          this.setState({ address: item })
        }
      })
    }
  }

  navigateUser = () => {
    this.handleUserNavigation();
  };

  handleUserNavigation = async () => {
    let data = this.props.navigation.state.params
    console.log(this.state.currentAddressId)
    if (this.state.currentAddressId !== '') {

      console.log("in shipping addresss",data.bagproduct)
      this.props.navigation.replace("Checkout", {
        appConfig: this.appConfig,
        transactionid: data.transactionid,
        customerID: this.state.currentAddressId,
        bagproduct: data.bagproduct,
        totalammount: data.totalammount,
        payment_method: data.payment_method,
        order_number: data.order_number
      });
      this.props.setTotalPrice();
    } else {
      Alert.alert(
        "",
        "Kindly add your address",
        [
          {
            text: "OK"
          }
        ],
        { cancelable: true }
      );
    }
  };

  getAddress = () => {
    const { address } = this.state

    return (
      <TouchableOpacity style={[styless.row, styless.card]} >
        <View style={{ flex: 2, alignItems: 'center', justifyContent: "center", padding: 10 }}>
          <View style={[styless.homeAddressCircle, { backgroundColor: '#686868' }]}>
            <Icon name={'building'} size={25} color='#e7e7e7' />
          </View>
        </View>
        <View style={{ flex: 7, padding: 10 }}>
          <Text style={styless.title}>{address.name} Address</Text>
          <Text style={{ color: '#000', fontSize: 12 }}>{address.address_line_1}</Text>
          <Text style={{ color: '#000', fontSize: 12 }}>{address.address_line_2}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const { address } = this.state
    const currentTheme =
      AppStyles.navThemeConstants[this.props.screenProps.theme];
    return (
      <>
        <Header title={"Shipping"} />
        <ProcedureImage source={AppStyles.imageSet.box} />

        <View>
          {
            address.length !== 0 ? this.getAddress() : null
          }

        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={styless.changeAddbtn} onPress={() => this.props.navigation.navigate('SaveAddress')}>
            <Text style={styless.textchange}>{address.length !== 0 ? "Change Address" : "Add Address"}</Text>
          </TouchableOpacity>

        </View>

      </>
    );
  }
}

ShippingAddressScreen.propTypes = {
  selectedPaymentMethod: PropTypes.object,
  shippingAddress: PropTypes.array,
  user: PropTypes.object,
  navigation: PropTypes.object,
  setShippingAddress: PropTypes.func
};

const mapStateToProps = ({ checkout, app }) => {
  return {
    selectedPaymentMethod: checkout.selectedPaymentMethod,
    // shippingAddress: app.user.shippingAddress,
    user: app.user
  };
};

export default connect(
  mapStateToProps,
  { setShippingAddress, setTotalPrice, setUserData }
)(ShippingAddressScreen);

const styless = StyleSheet.create({

  card: {
    margin: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    marginTop: 10
  },
  title: {
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 20
  },
  row: {
    flexDirection: 'row',
  },
  homeAddressCircle: {
    backgroundColor: '#e7e7e7',
    borderColor: '#e7e7e7',
    width: 50,
    height: 50,
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center'
  },
  homeAddEditView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2.5,
    backgroundColor: '#e7e7e7',
    padding: 0,
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10
  },
  changeAddbtn: {
    width: '60%',
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    borderColor: '#e7e7e7',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  textchange: {
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 20
  }

})