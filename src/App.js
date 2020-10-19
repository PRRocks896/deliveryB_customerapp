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
