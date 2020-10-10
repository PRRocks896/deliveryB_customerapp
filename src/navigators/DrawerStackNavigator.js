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
  WishlistScreen,
  SearchScreen,
  ProfileScreen,
  ShoppingBagScreen,
  
} from "../screens";
import styles from "./styles";
import AppStyles from "../AppStyles";
import ShopertinoConfig from "../ShopertinoConfig";
import MyWallet from '../screens/MyWallet/mywallet'
import AddCards from '../screens/AddCards/addCards'
const DrawerNavigator = createDrawerNavigator(
  {
    Home: HomeScreen,
    Shop: ShopScreen,
    Order: OrdersScreen,
    Wishlist: WishlistScreen,
    Search: SearchScreen,
    Profile: ProfileScreen,
    ShoppingBag: ShoppingBagScreen,
    MyWallet:MyWallet,
    AddCards:AddCards
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

      // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
      // console.log("currentTheme:", AppStyles.navThemeConstants.light)

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
              // navigation.openDrawer();
            }}
          />
        ),
        headerRight: navigation.state.routes[routeIndex].key !=
          "ShoppingBag" && (
            <ShoppingBagButton
              onPress={() => {
                navigation.navigate("Bag", { appConfig: ShopertinoConfig });
              }}
            />
          ),
        headerTitle: navigation.state.routes[routeIndex].key == "Search" &&
          "Search Products"
        //  (
        //   <View style={styles.searchBarContainer}>
        // <SearchBar
        //       backgroundColor={"transparent"}
        //       cancelTitle={"Cancel"}
        //       onChangeText={text => {
        //         navigation.dispatch({
        //           type: "SEARCH_BY_KEY_TEXT",
        //           data: text
        //         });
        //       }}
        //       cancelButtonTextStyle={[
        //         styles.cancelButtonText,
        //         {
        //           color: AppStyles.navThemeConstants.light.mainSubtextColor
        //         }
        //       ]}
        //       inputBorderRadius={9}
        //       inputStyle={styles.searchInput}
        //     />
        //   </View>
        // )
      };
    }
  }
);

const getDrawerScreenTitle = routeKey => {
  switch (routeKey) {
    case "Home":
      return "Dashboard";
    case "Shop":
      return "Shop";
    case "Order":
      return "Orders";
    case "Wishlist":
      return "Wishlist";
    case "Search":
      return "Search";
    case "Profile":
      return "Profile";
    case "ShoppingBag":
      return "Shopping Bag";
    case "MyWallet":
      return "MyWallet";
    case "AddCards": 
      return "AddCards";  
    default:
      return "Home";
  }
};

export default connect()(DrawerNavigator);
