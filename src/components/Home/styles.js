import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

const dynamicStyles = colorScheme => {
  return new StyleSheet.create({
    container: {
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor,
      flex: 1
    },
    carouselContainer: {
      marginTop: 18
    },
    carouselTitleText: {
      textAlign: "center",
      fontSize: 20,
      fontFamily: AppStyles.fontFamily.semiBoldFont,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      marginTop: 10,
      marginBottom: 12
    },
    unitContainer: {
      marginTop: 20,
      marginLeft: 7
    },
    unitTitle: {
      textAlign: "left",
      fontSize: 20,
      fontFamily: AppStyles.fontFamily.semiBoldFont,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      marginLeft: 7,
      marginBottom: 7
    },
    skeletonPlaceholder: {
      width: 120,
      height: 60,
      marginRight: 10,
      borderRadius: 10
    },
    incategorymainViewskeleton: {
      flex: 1, alignItems: "center"
    },
    categoryskeleton: {
      width: 120,
      height: 60,
      marginRight: 10,
      borderRadius: 10
    },
    newArraivalMainViewsSkeleton: {
      width: 200,
      height: 280,
      marginLeft: 10,
      marginRight: 10,
      borderRadius: 10
    },
    newArraivalSkeletonValue: {
      width: 100,
      height: 20,
      marginTop: 10
    },
    featuresmainSkeleton: {
      width: 120,
      height: 200,
      marginLeft: 10,
      marginRight: 10,
      borderRadius: 10
    },
    featuredvalueSkeleton: {
      width: 50,
      height: 20,
      marginTop: 10,
      marginLeft: 10
    },
    featuredsmallValueSkeleton: {
      width: 100,
      height: 20,
      marginTop: 10,
      marginLeft: 10
    },
    bestsellerMainSkeleton: {
      width: 165,
      height: 200,
      marginLeft: 10,
      marginRight: 10,
      borderRadius: 10
    },
  });
};

export default dynamicStyles;
