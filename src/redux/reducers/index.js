import { combineReducers } from "redux";
import { createNavigationReducer } from "react-navigation-redux-helpers";
import { app } from "./app";
import { RootNavigator } from "../../navigators/RootNavigator";
import { products } from "./products";
import { checkout } from "./checkout";
import { auth } from "../../Core/onboarding/redux/auth";
import { friends } from "../../Core/socialgraph/friendships/redux";
// import { feed } from '../../Core/socialgraph/feed/redux';
import { chat } from "../../Core/chat/redux";
import { userReports } from "../../Core/user-reporting/redux";
// import { notifications } from '../../Core/notifications/redux';

const navReducer = createNavigationReducer(RootNavigator);

// combine reducers to build the state
const appReducer = combineReducers({
  auth,
  friends,
  chat,
  userReports,
  app,
  products,
  checkout,
  nav: navReducer
});

export default appReducer;
