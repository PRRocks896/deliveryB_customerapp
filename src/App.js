import React, { useState, useEffect } from "react";
import { YellowBox, View, Text } from "react-native";
import { Provider } from "react-redux";
import configureStore from "./redux/store";
import { Appearance, AppearanceProvider } from "react-native-appearance";
import AppContainer from "./screens/AppContainer";
import { setI18nConfig } from "./Core/localization/IMLocalization";
import AsyncStorage from "@react-native-community/async-storage";
import MainStackNavigator from "./navigators/MainStackNavigator";
import { createReduxContainer } from "react-navigation-redux-helpers";

const store = configureStore();
// const handleLocalizationChange = () => {
//   setI18nConfig();
// };

const App = props => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    YellowBox.ignoreWarnings(["Remote Debugger"]);
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    setI18nConfig();
    Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
  }, []);



  return (
    <Provider store={store}>
      <AppearanceProvider>
        <AppContainer screenProps={{ theme: colorScheme }} />
      </AppearanceProvider>
    </Provider>
  );
};

export default App;




// return (
//   <Provider store={store}>
//     <AppearanceProvider>
//       <AppContainer screenProps={{ theme: colorScheme }} />
//     </AppearanceProvider>
//   </Provider>
// );

// import React, { useState, useEffect } from "react";
// import { YellowBox, View, Text } from "react-native";
// import { Provider } from "react-redux";
// import configureStore from "./redux/store";
// import { Appearance, AppearanceProvider } from "react-native-appearance";
// import AppContainer from "./screens/AppContainer";
// import { setI18nConfig } from "./Core/localization/IMLocalization";
// import AsyncStorage from "@react-native-community/async-storage";
// import MainStackNavigator from "./navigators/MainStackNavigator";
// import { createReduxContainer } from "react-navigation-redux-helpers";
// import RootNavigator from "./navigators/RootNavigator";

// const store = configureStore();
// // const handleLocalizationChange = () => {
// //   setI18nConfig();
// // };
// export default class App extends React.Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       colorScheme: Appearance.getColorScheme(),
//       userid: ''

//     }
//   }
//   componentDidMount = async () => {
//     YellowBox.ignoreWarnings(["Remote Debugger"]);
//     console.disableYellowBox = true;
//     Appearance.addChangeListener(({ colorScheme }) => {
//       this.setState({ colorScheme: colorScheme })
//     });

//     let id = await AsyncStorage.getItem('userId');
//     this.setState({ userid: id })


//   }


//   render() {
//     console.log("in app", this.state.userid)
//     return (
//       <Provider store={store}>
//         <AppearanceProvider>
//           {
//             this.state.userid == '' ?

//               <AppContainer screenProps={{ theme: this.state.colorScheme }} />
//               :
//               <View><Text>hiii</Text>
//               </View>
//           }
//         </AppearanceProvider>
//       </Provider>
//     );
//   }
// };
