import React from "react";
import { View, StatusBar, Keyboard } from "react-native";
import { connect } from "react-redux";
import { createDrawerNavigator } from "react-navigation-drawer";
import SearchBar from "react-native-search-box";
import { DrawerContainer, MenuButton, ShoppingBagButton } from "../components";
import currentTheme from '../AppStyles'
import {
  HomeScreen,
  ShopScreen,
  OrdersScreen,
  SearchScreen,
  ProfileScreen,
  ShoppingBagScreen,
} from "../screens";
import styles from "./styles";
import AppStyles from "../AppStyles";
import ShopertinoConfig from "../ShopertinoConfig";
import MyWallet from '../screens/MyWallet/mywallet'
import AddCards from '../screens/AddCards/addCards'
import QRScanner from '../screens/MyWallet/qrscanner'
import SearchService from '../screens/SearchScreen/SearchService'
import ServicebookDetails from '../screens/Order/servicebookScreen'
import OrderDetailsScreen from '../screens/Order/orderDetails'
import ViewAllProductsPage from '../components/Home/ViewAllProductsPage'
import AllSearchPage from '../components/Home/AllSearch'
import DBoyOrdersScreen from '../screens/Order/dBoyOrderScreen'
import DeliveryboyhireddrawerScreen from '../screens/DboyHired/dboyhired'
import ScanAndPayButton from "../components/scanAndPayButton/scanandpayButton";
import DBoyButton from "../components/DBoybutton/dboyButton";
const DrawerNavigator = createDrawerNavigator(
  {
    Home: HomeScreen,
    Shop: ShopScreen,
    Order: OrdersScreen,
    Search: SearchScreen,
    Profile: ProfileScreen,
    ShoppingBag: ShoppingBagScreen,
    MyWallet: MyWallet,
    AddCards: AddCards,
    QRScanner: QRScanner,
    SearchService: SearchService,
    ServicebookDetails: ServicebookDetails,
    ViewAllProductsPage: ViewAllProductsPage,
    AllSearchPage: AllSearchPage,
    DBoyOrdersScreen: DBoyOrdersScreen,
    DeliveryboyhireddrawerScreen: DeliveryboyhireddrawerScreen
    // OrderDetailsScreen:OrderDetailsScreen
  },
  {
    drawerPosition: "left",
    initialRouteName: "Home",
    initialRouteParams: {
      appStyles: AppStyles,
      appConfig: ShopertinoConfig
    },
    drawerWidth: 300,
    contentComponent: DrawerContainer(ShopertinoConfig),
    headerMode: "screen",
    navigationOptions: ({ navigation, screenProps }) => {
      const routeIndex = navigation.state.index;
      const theme = screenProps.theme
      return {
        headerStyle: {
          backgroundColor: AppStyles.navThemeConstants.light.backgroundColor,
          borderBottomWidth: 0,
          paddingTop: Platform.OS === "ios" ? 0 : 0,

        },
        headerTintColor: AppStyles.navThemeConstants.light.fontColor,
        title: getDrawerScreenTitle(navigation.state.routes[routeIndex].key),
        headerLeft: (
          <MenuButton
            onPress={() => {
              navigation.toggleDrawer()
              Keyboard.dismiss()
            }}
          />
        ),
        
        headerRight: navigation.state.routes[routeIndex].key != "ShoppingBag"
          ?
          <>
            <DBoyButton
              onPress={() => {
                navigation.navigate("DeliveryboyhireddrawerScreen", { appConfig: ShopertinoConfig });
              }} />
            <ShoppingBagButton
              onPress={() => {
                navigation.navigate("Bag", { appConfig: ShopertinoConfig });
              }}
            />
            <ScanAndPayButton />
          </>
          : navigation.state.routes[routeIndex].key == "DeliveryboyhireddrawerScreen" ?
            <>
              <ShoppingBagButton
                onPress={() => {
                  navigation.navigate("Bag", { appConfig: ShopertinoConfig });
                }}
              />
              <ScanAndPayButton />
            </>
            : null,

        headerTitle: navigation.state.routes[routeIndex].key == "Search" && "Search" ||
          navigation.state.routes[routeIndex].key == "AddCards" && "Add Cards" ||
          navigation.state.routes[routeIndex].key == 'MyWallet' && 'My Wallet' ||
          navigation.state.routes[routeIndex].key == 'ServicebookDetails' && 'Booked Service' ||
          navigation.state.routes[routeIndex].key == 'SearchService' && 'Search Service' ||
          navigation.state.routes[routeIndex].key == 'ViewAllProductsPage' && 'View All' ||
          navigation.state.routes[routeIndex].key == 'AllSearchPage' && 'Search'
      };
    }
  }
);

const getDrawerScreenTitle = routeKey => {

  switch (routeKey) {
    case "Home":
      return "Tribata";
    case "Shop":
      return "Shop";
    case "Order":
      return "Orders";
    case "ServicebookDetails":
      return "ServicebookDetails";
    case "Search":
      return "Search";
    case "SearchService":
      return "SearchService";
    // case "OrderDetailsScreen" :
    //   return "OrderDetailsScreen"  
    case "Profile":
      return "Profile";
    case "ShoppingBag":
      return "Shopping Bag";
    case "MyWallet":
      return "MyWallet";
    case "AddCards":
      return "AddCards";
    case "ViewAllProductsPage":
      return "ViewAllProductsPage";
    case "AllSearchPage":
      return "AllSearchPage";
    case "DBoyOrdersScreen":
      return "Booking";
    case "DeliveryboyhireddrawerScreen":
      return "Delivery Boy Hire"
    default:
      return "Home";
  }
};

export default connect()(DrawerNavigator);
