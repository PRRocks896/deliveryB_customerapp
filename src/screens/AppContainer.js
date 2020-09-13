import { createReduxContainer } from "react-navigation-redux-helpers";
import { connect } from "react-redux";
import stripe from "tipsi-stripe";
import { GoogleSignin } from "react-native-google-signin";
import RootNavigator from "../navigators/RootNavigator";
import AppConfig from "../ShopertinoConfig";

stripe.setOptions({
  publishableKey: AppConfig.STRIPE_CONFIG.PUBLISHABLE_KEY,
  merchantId: AppConfig.STRIPE_CONFIG.MERCHANT_ID,
  androidPayMode: AppConfig.STRIPE_CONFIG.ANDROID_PAYMENT_MODE
});
GoogleSignin.configure({
  scopes: AppConfig.GOOGLE_SIGNIN_CONFIG.SCOPES,
  webClientId: AppConfig.GOOGLE_SIGNIN_CONFIG.WEB_CLIENT_ID,
  offlineAccess: AppConfig.GOOGLE_SIGNIN_CONFIG.OFFLINE_ACCESS
});


const AppContainer = createReduxContainer(RootNavigator);

const mapStateToProps = state => ({
  state: state.nav
});

export default connect(mapStateToProps)(AppContainer);
