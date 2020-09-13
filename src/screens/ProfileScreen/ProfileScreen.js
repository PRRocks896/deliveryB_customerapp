import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Profile } from "../../components";
import { firebaseDataManager } from "../../apis";
import deviceStorage from "../../utils/deviceStorage";
import AsyncStorage from "@react-native-community/async-storage";
import getProfileDetails from "../../services/Profile/getProfile";
import { BackHandler } from 'react-native'

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.state = {
      currentUser: []
    }
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.componentDidMount()

      });
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  /**
   * for back to prev screen
   */
  handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
  }
  onLogout = async () => {
    await deviceStorage.removeUserData();
    await firebaseDataManager.logout();
    this.onItemPress("LoginStack");
  };

  onItemPress = (routeName, title) => {
    this.props.navigation.navigate(routeName, {
      title: title ? title : routeName,
      appConfig: this.appConfig
    });
  };

  componentDidMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    let loginData = await AsyncStorage.getItem('LoginData')
    let details = JSON.parse(loginData)
    let body = JSON.stringify({
      id: details.userId,
      reqToken: details.reqToken,
    })
    const data = await getProfileDetails(body);
    this.setState({ currentUser: data.data })
  }

  render() {
    return (
      <Profile
        user={this.state.currentUser}
        onLogout={this.onLogout}
        onItemPress={this.onItemPress}
        navigation={this.props.navigation}
      />
    );
  }
}

ProfileScreen.propTypes = {
  navigation: PropTypes.object,
  user: PropTypes.object
};

const mapStateToProps = ({ app }) => {
  return {
    user: app.user
  };
};

export default connect(mapStateToProps)(ProfileScreen);
