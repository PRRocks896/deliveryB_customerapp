import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

const dynamicStyles = colorScheme => {
  return new StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: "#efeff4"
      backgroundColor: AppStyles.colorSet[colorScheme].grey0
    },
    body: {
      width: "100%"
    },
    labelView: {
      width: "100%",
      height: 60,
      padding: 10,
      justifyContent: "flex-end",
      alignItems: "flex-start"
    },
    contentView: {
      width: "100%",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: AppStyles.colorSet[colorScheme].hairlineColor,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor
    },
    itemView: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      padding: 5,

    },
    lineView: {
      left: 15,
      width: "95%",
      height: 1,
      backgroundColor: AppStyles.colorSet[colorScheme].hairlineColor
    },
    labelText: {
      fontSize: 18,
      flex: 3,
      marginLeft:3
    },
    text: {
      fontSize: 18,
      flex: 7,
      justifyContent: 'flex-start'
    },
    label: {
      fontSize: 14,
      color: AppStyles.colorSet[colorScheme].mainTextColor
    }
  });
};

export default dynamicStyles;
