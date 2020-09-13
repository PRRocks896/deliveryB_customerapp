import React, { Component } from "react";
import { View, Platform, StatusBar } from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Header,
  ProcedureImage,
  ShippingDetails,
  HeaderButton
} from "../../components";
import { setSelectedShippingMethod, setTotalPrice } from "../../redux/";
import AppStyles from "../../AppStyles";

class ShippingMethodScreen extends Component {
  static navigationOptions = ({ screenProps, navigation }) => {
    const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;

    return {
      headerStyle: {
        backgroundColor: AppStyles.navThemeConstants.light.backgroundColor,
        borderBottomWidth: 0,

      },

      headerRight: (
        <HeaderButton
          onPress={params.navigateUser}
          buttonContainerStyle={{ marginRight: 10 }}
          title={"Done"}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      cardNumberValue: ""
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateUser: this.navigateUser
    });
    this.props.setSelectedShippingMethod(
      this.props.shippingMethods[this.props.selectedShipppingMethodIndex]
    );
  }

  onShippingMethodSelected = selectedIndex => {
    this.props.setSelectedShippingMethod(
      this.props.shippingMethods[selectedIndex]
    );
  };

  navigateUser = () => {
    this.props.setTotalPrice();
    this.props.navigation.replace("Checkout", { appConfig: this.appConfig });
  };

  render() {
    const currentTheme =
      AppStyles.navThemeConstants[this.props.screenProps.theme];
    return (
      <View style={{ backgroundColor: AppStyles.navThemeConstants.light.backgroundColor, flex: 1 }}>
        <Header title={"Shipping"} />
        <ProcedureImage source={AppStyles.imageSet.box} />
        <ShippingDetails
          selectedShipppingMethodIndex={this.props.selectedShipppingMethodIndex}
          isShippinngMethod={true}
          shippingMethods={this.props.shippingMethods}
          shippingAddress={this.props.shippingAddress}
          onShippingMethodSelected={this.onShippingMethodSelected}
          title={"Shipping Method"}
        />
      </View>
    );
  }
}

ShippingMethodScreen.propTypes = {
  onShippingMethodSelected: PropTypes.func,
  shippingMethods: PropTypes.array,
  shippingAddress: PropTypes.array,
  setSelectedShippingMethod: PropTypes.func,
  selectedShipppingMethodIndex: PropTypes.number,
  navigation: PropTypes.object,
  setTotalPrice: PropTypes.func
};

const mapStateToProps = ({ checkout, app }) => {
  return {
    selectedShippingMethod: checkout.selectedShippingMethod,
    shippingMethods: checkout.shippingMethods,
    shippingAddress: app.user.shippingAddress,
    selectedShipppingMethodIndex: checkout.selectedShipppingMethodIndex
  };
};

export default connect(mapStateToProps, {
  setSelectedShippingMethod,
  setTotalPrice
})(ShippingMethodScreen);
