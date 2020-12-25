import { StyleSheet, Dimensions } from "react-native";
import AppStyles from "../../AppStyles";
const { width, height } = Dimensions.get("window");

const featuredTextPadding = 3;
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
    offlineContainer: {
      backgroundColor: 'red',
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      position: 'absolute',
      top: 30
    },
    offlineText: {
      color: '#fff'
    },
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
    },
    productCardImage: {
      width: "100%",
      height: "100%",
      borderRadius: 6,
      resizeMode: 'contain',
      zIndex:1
    },
    productCardPrice: {
      textAlign: "left",
      fontSize: 14,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontFamily: AppStyles.fontFamily.boldFont,
      paddingTop: featuredTextPadding
    },
    productCardDescription: {
      textAlign: 'center',
      fontSize: 13,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontFamily: AppStyles.fontFamily.regularFont,
      paddingTop: featuredTextPadding
    },
    transparentContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)"
    },
    viewContainer: {
      width: width,
      height: height * 0.95,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor
    },
    swiperContainer: {
      // alignItems: "center",
      justifyContent: "center",
      flex: 8
    },

    imageBackground: {
      flex: 1,
      resizeMode: 'contain'
    },
    headerContainerStyle: {
      width: "96%",
      alignSelf: "center",
      height: "4%",
      position: "absolute",
      top: "2%",
    },
    descriptionContainer: {
      height: 'auto'
    },
    title: {
      fontFamily: AppStyles.fontFamily.regularFont,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      paddingTop: 20,
      paddingLeft: 15,
      fontSize: 17
    },
    price: {
      fontFamily: AppStyles.fontFamily.regularFont,
      color: AppStyles.colorSet[colorScheme].mainSubtextColor,
      paddingTop: 7,
      paddingLeft: 15,
      fontSize: 15
    },
    borderLine: {
      width: "97%",
      height: 0.5,
      alignSelf: "center",
      marginTop: 10,
      backgroundColor: "#d9d9d9"
    },
    addToBagContainerStyle: {
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      // flex: 2.5,
      height: 50,
      marginLeft: 20,
      marginRight: 20,
      justifyContent: 'center',
      alignItems: 'center'
      // alignSelf: "flex-end",

    },
    inputContainer: {
      borderColor: '#a3a3a3',
      borderWidth: 1,
      height: 50,
      width: '95%',
      marginLeft: 10,
      marginRight: 10,
      borderRadius: 10, marginTop: 10
    },
    imageBackgroundContainer: {
      flex: 1.9,
      backgroundColor: "#d9d7da",
    },
    colorview: {
      borderColor: '#a3a3a3',
      borderWidth: 1,
      backgroundColor: '#fff',
      width: 'auto',
      padding: 5,
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 50,
      marginLeft: 10,
      marginTop: 5
    },
    colorText: {
      color: '#000',
      fontSize: 15
    },
    titlecolor: {
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 18,
      marginLeft: 8,
      fontFamily: AppStyles.fontFamily.regularFont,

    },
    filtercontainer: {
      width: 50,
      height: 50,
      position: 'absolute',
      borderRadius: 360,
      backgroundColor: '#e7e7e7',
      bottom: 10,
      right: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    filtertxt: {
      fontFamily: AppStyles.fontFamily.regularFont,
      fontSize: 16,
      textAlign: 'center'
    },
    // sortingView: {
    //   flexDirection: 'row',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   flex: 6,
    //   borderRightWidth: 1,
    //   borderRightColor: '#a3a3a3'
    // },
    bottomsortContainer: {
      paddingTop: 25,
      paddingLeft: 25,
    },
    sortingbottomtxt: {
      fontFamily: AppStyles.fontFamily.regularFont,
      fontSize: 16,
      marginTop: 10,
    },
    applybutton: {
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      height: 40,
      marginLeft: 20,
      marginRight: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      width: '40%',
      alignSelf: 'center'


    },
    delievryboyimg: {
      width: 90,
      height: 90,
      borderRadius: 360,
      justifyContent: 'center',
      alignItems: 'center'
    },
    dboyContainer: {
      width: "100%",
      height: "50%",
      alignSelf: 'center',
      justifyContent: 'center'
    },
    dboyView: {
      width: 0.30 * width,
      height: 0.28 * height,
      margin: 10,
      overflow: "visible",
      marginLeft: 7

    },
    card: {
      marginTop: 5,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor,
      padding: 5,
      marginBottom: 5,
      borderWidth: 1,
      borderColor: '#fff',
      borderRadius: 5,
      elevation: 5,
    },
    categoryTextContainerView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "rgba(0,0,0,.55)",
      backgroundColor: '#e7e7e7',
      borderRadius: 6,
      borderColor: 'black',
      borderWidth: 1
    },
    categoryText: {
      color: "black",
      textAlign: "center",
      justifyContent: "center",
      opacity: 1.0,
      fontFamily: AppStyles.fontFamily.semiBoldFont
    },
    bottomsheet: {
      // padding:10,
      paddingLeft: 15,
      paddingTop: 20
    },
    shopname: {
      fontSize: 15,
      fontFamily: AppStyles.fontFamily.regularFont,
    },
    marginTop: {
      marginTop: 10
    },
    tital: {
      fontFamily: AppStyles.fontFamily.regularFont,
      fontSize: 18
    },
    subtitle: {
      fontFamily: AppStyles.fontFamily.lightFont,
      fontSize: 16
    },
    row: {
      flexDirection: 'row'
    },
    buttoncontainer: {
      padding: 5,
      borderRadius: 5,
      borderWidth: 1,
      marginTop: 10,
      margin: 10,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
    },
    buttontxt: {
      fontFamily: AppStyles.fontFamily.regularFont,
      color: AppStyles.colorSet[colorScheme].mainSubtextColor,
      fontSize: 18,
      textAlign: 'center'
    },
    dialogtxt: {
      fontFamily: AppStyles.fontFamily.regularFont,
      color: AppStyles.colorSet[colorScheme].mainSubtextColor,
      fontSize: 15
    },
    dialogtitle: {
      fontFamily: AppStyles.fontFamily.regularFont,
      color: AppStyles.colorSet[colorScheme].mainSubtextColor,
      fontSize: 18
    },
    cvvinput: {
      borderBottomWidth: 1,
      borderBottomColor: '#a3a3a3'
    },
    errortxt: {
      color: 'red'
    },
    addbtnContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10
    },
    addcvvbutton: {
      borderColor: '#a3a3a3',
      borderRadius: 5,
      width: '90%',
      height: 30,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 15,
      paddingRight: 15,
      padding: 15
    },
    addtext: {
      fontSize: 20
    },
    dummycardimg: {
      width: "50%",
      height: "50%",
      borderRadius: 6,
      resizeMode: 'contain',
      zIndex:1
    },
    categoryimg:{
      width:50,
      height:50,
      borderRadius:360
    },
    categorybox:{
      margin:5,
      flexDirection:'column',
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 6,
      borderColor: 'black',
      padding:10,
      width:90
    },
   
  });
};

export default dynamicStyles;
