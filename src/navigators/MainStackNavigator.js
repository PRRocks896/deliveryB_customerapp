import { Platform } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import StackViewStyleInterpolator from "react-navigation-stack/src/views/StackView/StackViewStyleInterpolator";
import {
  ShoppingBagScreen,
  CategoryProductGridScreen,
  ContactUsScreen,
  EditProfileScreen,
  ShippingAddressScreen,
  ShippingMethodScreen,
  PaymentMethodScreen,
  AddACardScreen,
  CheckoutScreen,
  SaveAddress,

} from "../screens";
import DrawerStackNavigator from "./DrawerStackNavigator";
import AppStyles from "../AppStyles";
import SaveAddressScreen from "../screens/SaveAddress/saveAddressscreen"
import ServicePaymentOptions from '../components/Home/ServiceFlow/paymentmethod'
import PlaceServiceScrren from '../components/Home/ServiceFlow/placeorder'
import OrderDetailsScreen from '../screens/Order/orderDetails'
import TrackOrderComp from '../components/Order/trackOrder'
import DBoyDetails from '../components/Home/Deliveryboy/deliveryboyDetails'
import ShopWiseProduct from '../components/Home/ShopDataShow/shopProduct'
import DBoyOrderDetailsScreen from '../screens/Order/dBoyOrderDetails'
import AllShopListScreen from '../components/Home/ShopDataShow/allshopListScreen'
import ProductDetailsPageScreen from '../components/Home/ProductDetailsPage'
import WelcomePage from '../screens/AuthScreens/welcome'
import { SmsAuthenticationScreen } from "../Core/onboarding";
import ResetPasswordScreen from "../Core/onboarding/ResetPassword/resetPassword";
import ForgotPasswordScreen from "../Core/onboarding/ForgotPassword";
import AddProfileScreen from "../Core/onboarding/AddPersonalDetails";
const MainStackNavigator = createStackNavigator(
  {
    Drawer: { screen: DrawerStackNavigator },
    CategoryProductGrid: { screen: CategoryProductGridScreen },
    Contact: { screen: ContactUsScreen },
    EditProfile: { screen: EditProfileScreen },
    ShippingAddress: { screen: ShippingAddressScreen },
    ShippingMethod: { screen: ShippingMethodScreen },
    PaymentMethod: { screen: PaymentMethodScreen },
    AddACard: { screen: AddACardScreen },
    Checkout: { screen: CheckoutScreen },
    Bag: { screen: ShoppingBagScreen },
    ServicePaymentOptions: { screen: ServicePaymentOptions },
    PlaceServiceScrren: { screen: PlaceServiceScrren },
    AllShopListScreen: { screen: AllShopListScreen },
    ProductDetailsPageScreen: {
       screen: ProductDetailsPageScreen ,
       navigationOptions: {
        header: null
      }
      },
    WelcomePage: {
      screen: WelcomePage,
      navigationOptions: {
        header: null
      }
    },
    OrderDetailsScreen: {
      screen: OrderDetailsScreen,
      navigationOptions: {
        title: 'Details'
      }
    },
    SaveAddress: {
      screen: SaveAddress,
      navigationOptions: {
        title: 'Saved Address'
      }
    },
    SaveAddressScreen: {
      screen: SaveAddressScreen,
      navigationOptions: {
        title: 'Add Your Address'
      }
    },
    TrackOrderComp: {
      screen: TrackOrderComp,
      navigationOptions: {
        title: 'Track Order'
      }
    },
    DBoyDetails: {
      screen: DBoyDetails,
      navigationOptions: {
        title: 'Details'
      }
    },

    ShopWiseProduct: {
      screen: ShopWiseProduct,
      navigationOptions: {
        header: null
      }
    },

    DBoyOrderDetailsScreen: {
      screen: DBoyOrderDetailsScreen,
      navigationOptions: {
        title: 'Details'
      }
    },
    AddProfileScreen: {
      screen: AddProfileScreen,
      navigationOptions: () => ({
        headerStyle: {
          borderBottomWidth: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          elevation: 0
        },
        title: 'Add Personal Details'
      })
    },
    ForgotPasswordScreen: {
      screen: ForgotPasswordScreen,
      navigationOptions: () => ({
        headerStyle: {
          borderBottomWidth: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          elevation: 0
        },
        title: 'Forgot Password'
      })
    },
    ResetPasswordScreen: {
      screen: ResetPasswordScreen,
      navigationOptions: () => ({
        headerStyle: {
          borderBottomWidth: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          elevation: 0
        },
        title: 'Reset Password'
      })
    }



  },
  {
    initialRouteName: "Drawer",
    headerMode: "float",
    cardStyle: {
      backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor
    },
    transitionConfig: () => ({
      screenInterpolator: sceneProps => {
        // Disable the transition animation when resetting to the main screen
        if (sceneProps.index === 0 && sceneProps.scenes.length > 2) {
          return null;
        }

        // Otherwise, use the usual animation
        return Platform.OS === "ios"
          ? StackViewStyleInterpolator.forHorizontal(sceneProps)
          : StackViewStyleInterpolator.forFadeFromBottomAndroid(sceneProps);
      }
    })
  }
);

export default MainStackNavigator;
