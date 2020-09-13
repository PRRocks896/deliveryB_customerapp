import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

const dynamicStyles = colorScheme => {
  return new StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor
    }
  });
};

export default dynamicStyles;
