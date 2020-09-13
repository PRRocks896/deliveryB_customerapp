import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

const dynamicStyles = colorScheme => {
  return new StyleSheet.create({
    content: {
      flex: 1,
      // flexDirection: "row",  
      // alignItems: "center",
      // justifyContent: "center",
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor
    },
    container: {
      flex: 9,
      alignItems: "flex-start",
      paddingHorizontal: 20
    },
    cardImageContainer: {
      flex: 4,
      justifyContent: "center",
      alignItems: "center",

    },
    cardImage: {
      height: 130,
      width: 130,
      borderRadius: 65,
    },
    editpic: {
      position: 'absolute',
      top: 130,
      right: 100,
      width: 45,
      height: 45,
      borderRadius: 50,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
};

export default dynamicStyles;
