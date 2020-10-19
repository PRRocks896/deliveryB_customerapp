import { StyleSheet } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import {
  WelcomeScreen,
  // LoginScreen,
  // SignupScreen,
  SmsAuthenticationScreen
} from "../Core/onboarding";
import AppStyles from "../AppStyles";
import ShopertinoConfig from "../ShopertinoConfig";
import AddProfileScreen from '../Core/onboarding/AddPersonalDetails'
import ForgotPasswordScreen from '../Core/onboarding/ForgotPassword/index'
import ResetPasswordScreen from '../Core/onboarding/ResetPassword/resetPassword'
const AuthStackNavigator = createStackNavigator(
  {
    Welcome: {
      screen: WelcomeScreen,
      navigationOptions: { header: null }
    },
    // Login: {
    //   screen: LoginScreen,
    //   navigationOptions: () => ({
    //     headerStyle: styles.headerStyle
    //   })
    // },
    // Signup: {
    //   screen: SignupScreen,
    //   navigationOptions: () => ({
    //     headerStyle: styles.headerStyle
    //   })
    // },
    Sms: {
      screen: SmsAuthenticationScreen,
      navigationOptions: () => ({
        headerStyle: styles.headerStyle
      })
    },
    AddProfileScreen: {
      screen: AddProfileScreen,
      navigationOptions: () => ({
        headerStyle: styles.headerStyle,
        title: 'Add Personal Details'
      })
    },
    ForgotPasswordScreen: {
      screen: ForgotPasswordScreen,
      navigationOptions: () => ({
        headerStyle: styles.headerStyle,
        title: 'Forgot Password'
      })
    },
    ResetPasswordScreen: {
      screen: ResetPasswordScreen,
      navigationOptions: () => ({
        headerStyle: styles.headerStyle,
        title: 'Reset Password'
      })
    }

  },
  {
    initialRouteName: "Welcome",
    initialRouteParams: {
      appStyles: AppStyles,
      appConfig: ShopertinoConfig
    },
    headerMode: "float",
    headerBackTitleVisible: false,
    cardStyle: { backgroundColor: "#FFFFFF" },
    cardShadowEnabled: false
  }
);

const styles = StyleSheet.create({
  headerStyle: {
    borderBottomWidth: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0 // remove shadow on Android
  }
});

export default AuthStackNavigator;
