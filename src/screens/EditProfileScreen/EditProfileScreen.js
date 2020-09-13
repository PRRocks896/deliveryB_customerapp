import React, { Component } from "react";
import { StatusBar, Alert } from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { EditProfile, HeaderButton } from "../../components";
import { firebaseDataManager } from "../../apis";
import AppStyles from "../../AppStyles";
import { setUserData } from "../../redux/";
import AppConfig from "../../ShopertinoConfig";
import AsyncStorage from "@react-native-community/async-storage";
import addProfile from "../../services/Profile";
import { getUserData } from "../../apis/firebase/API/auth";
import getProfileDetails from "../../services/Profile/getProfile";

class EditProfileScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    return {
      title:
        typeof navigation.state.params === "undefined" ||
          typeof navigation.state.params.title === "undefined"
          ? "Edit Profile"
          : navigation.state.params.title,
      // headerTintColor: AppStyles.navThemeConstants.light.fontColor,
      // headerStyle: {
      //   backgroundColor: AppStyles.navThemeConstants.light.backgroundColor,
      //   borderBottomWidth: 0,
      //   paddingTop: Platform.OS === "ios" ? 0 : 0
      // },
      headerRight: (
        <HeaderButton
          onPress={navigation.state.params.onDonePress}
          buttonContainerStyle={{ marginRight: 10 }}
          title={"Done"}
        />
      ),
      // headerLeft: (
      //   <HeaderButton
      //     onPress={() => {
      //       navigation.goBack();
      //     }}
      //     buttonContainerStyle={{ marginLeft: 10 }}
      //     title={"Cancel"}
      //   />
      // )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      userData: {},
      user: []
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onDonePress: this.onDonePress
    });
    this.getCurrentUserData()
  }
  getCurrentUserData = async () => {
    let loginData = await AsyncStorage.getItem('LoginData')
    let details = JSON.parse(loginData)
    let body = JSON.stringify({
      id: details.userId,
      reqToken: details.reqToken,
    })
    const data = await getProfileDetails(body);
    this.setState({ user: data.data })
    if (data.success) {
      AsyncStorage.setItem("CurrentUser", JSON.stringify(data))
    }
  }

  onDonePress = async () => {
    // console.log("Call Done", this.state.userData)
    const { userData } = this.state
    let userId = await AsyncStorage.getItem('userId')
    let body = JSON.stringify({
      id: userId,
      username: userData.firstName + " " + userData.lastName,
      email: userData.email,
      password: null,
      role: "Customer",
      deliverytype: 0
    })
    console.log("username", userId, body)

    const data = await addProfile(body)
    console.log("data in edit profile", data)
    if (data.success) {
      this.props.navigation.goBack();
      this.getCurrentUserData()
    } else {
      Alert.alert(data.messageCode)
    }
  };

  onProfileDataChange = userData => {
    this.setState({ userData: userData });
  };

  render() {
    // console.log("this.state.user", this.state.user)
    return (
      <EditProfile
        user={this.state.user}
        onProfileDataChange={this.onProfileDataChange}
      />
    );
  }
}

EditProfileScreen.propTypes = {
  user: PropTypes.object,
  navigation: PropTypes.object,
  setUserData: PropTypes.func,
  stripeCustomer: PropTypes.string
};

const mapStateToProps = ({ app }) => {
  return {
    user: app.user,
    stripeCustomer: app.stripeCustomer
  };
};

export default connect(mapStateToProps, { setUserData })(EditProfileScreen);
