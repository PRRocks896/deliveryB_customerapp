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
    ServicePaymentOptions:{ screen : ServicePaymentOptions },
    PlaceServiceScrren: { screen : PlaceServiceScrren },
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
