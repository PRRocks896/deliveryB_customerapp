import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

const { width, height } = Dimensions.get("window");

const featuredTextPadding = 3;

const dynamicStyles = colorScheme => {
  return new StyleSheet.create({
    productCardConainer: {
      width: 0.35 * width,
      height: 0.32 * height,
      margin: 10,
      overflow: "visible",
      marginLeft: 7
    },
    productCardImageConainer: {
      width: "100%",
      height: "80%",
      justifyContent:'center',
      alignItems:'center'
    },
    productCardImage: {
      width: "100%",
      height: "100%",
      borderRadius: 6,
      resizeMode: 'contain',
      zIndex:1
    },
    dummycardimg:{
      width: "50%",
      height: "50%",
      borderRadius: 6,
      resizeMode: 'contain',
    },
    productCardPrice: {
      textAlign: "left",
      fontSize: 14,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontFamily: AppStyles.fontFamily.boldFont,
      paddingTop: featuredTextPadding
    },
    productCardDescription: {
      
      fontSize: 13,
      color: '#000',
      fontFamily: AppStyles.fontFamily.regularFont,
      paddingTop: featuredTextPadding
    }
  });
};

export default dynamicStyles;
