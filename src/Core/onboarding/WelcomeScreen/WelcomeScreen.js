import React, { useState, useEffect } from "react";
import Button from "react-native-button";
import { Text, View, Image, Alert } from "react-native";

import TNActivityIndicator from "../../truly-native/TNActivityIndicator";
import { IMLocalized } from "../../localization/IMLocalization";
import dynamicStyles from "./styles";
import { useColorScheme } from "react-native-appearance";
import { setUserData } from "../redux/auth";
import { connect } from "react-redux";
import authManager from "../utils/authManager";
import NetInfo from '@react-native-community/netinfo';

const WelcomeScreen = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [netInfo, setNetInfo] = useState(false);
  const appStyles =
    props.navigation.state.params.appStyles ||
    props.navigation.getParam("appStyles");
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(appStyles, colorScheme);
  const appConfig =
    props.navigation.state.params.appConfig ||
    props.navigation.getParam("appConfig");

  useEffect(() => {
    tryToLoginFirst();
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("state.isConnected", state.isConnected)
      setNetInfo(state.isConnected);
    });

    return () => {
      // Unsubscribe to network state updates
      unsubscribe();
    };
  }, []);




  const tryToLoginFirst = async () => {
    setIsLoading(true);
    authManager
      .retrievePersistedAuthUser(appConfig)
      .then(response => {
        setIsLoading(false);
        if (response) {
          const user = response.user;
          props.setUserData({
            user: response.user,
            stripeCustomer: response.stripeCustomer
          });
          props.navigation.navigate("MainStack", { user: user });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  if (isLoading == true) {
    return <TNActivityIndicator appStyles={appStyles} />;
  }

  if (netInfo == false) {
    return (<View style={styles.container}>
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>{'No Internet Connection'}</Text>
      </View>
    </View>)
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image style={{ width: '100%', height: '100%' }} source={appStyles.imageSet.logoapp} />
        </View>
        <Text style={styles.title}>
          {'Welcome to Tribata App'}
        </Text>
        <Text style={[styles.caption, { fontSize: 20 }]}>
          {"Shop - Travel - Eat"}
        </Text>
        <Button
          containerStyle={styles.loginContainer}
          style={styles.loginText}
          onPress={() => {
            appConfig.isSMSAuthEnabled
              ? props.navigation.navigate("Sms", {
                isSigningUp: false,
                appStyles,
                appConfig
              })
              : props.navigation.navigate("Login", { appStyles, appConfig });
          }}
        >
          {IMLocalized("Log In")}
        </Button>
        <Button
          containerStyle={styles.signupContainer}
          style={styles.signupText}
          onPress={() => {
            appConfig.isSMSAuthEnabled
              ? props.navigation.navigate("Sms", {
                isSigningUp: true,
                appStyles,
                appConfig
              })
              : props.navigation.navigate("Signup", { appStyles, appConfig });
          }}
        >
          {IMLocalized("Sign Up")}
        </Button>
      </View>
    );
  }
};

const mapStateToProps = ({ auth }) => {
  return {
    user: auth.user
  };
};

export default connect(
  mapStateToProps,
  {
    setUserData
  }
)(WelcomeScreen);
