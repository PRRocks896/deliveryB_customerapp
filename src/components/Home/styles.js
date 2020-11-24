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
      resizeMode: 'contain'
    },
    productCardPrice: {
      textAlign: "left",
      fontSize: 14,
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontFamily: AppStyles.fontFamily.boldFont,
      paddingTop: featuredTextPadding
    },
    productCardDescription: {
      textAlign: "left",
      fontSize: 13,
      color: '#000',
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
      height:50,
      marginLeft:20,
      marginRight:20,
      justifyContent:'center',
      alignItems:'center'
      // alignSelf: "flex-end",

    },
    inputContainer:{
      borderColor:'#a3a3a3',
      borderWidth:1,
      height:50,
      width:'95%',
      marginLeft:10,
      marginRight:10,
      borderRadius:10,marginTop:10
    },
    imageBackgroundContainer: {
      flex: 1.9,
      backgroundColor: "#d9d7da",
    },
    colorview:{
      borderColor:'#a3a3a3',
      borderWidth:1,
      backgroundColor:'#fff',
      width:'auto',
      padding:5,
      paddingLeft:8,
      paddingRight:8,
      borderRadius:50,
      marginLeft:10,
      marginTop:5
    },
    colorText:{
      color:'#000',
      fontSize:15
    },
    titlecolor:{
      textAlign:'center',
       textAlignVertical:'center', 
       fontSize:18, 
       marginLeft:8,
       fontFamily: AppStyles.fontFamily.regularFont,

    },
    filtercontainer:{
      flexDirection:'row',
      height:25,
      backgroundColor:'#e7e7e7',
      marginBottom:10
    },
    filtertxt:{
      fontFamily: AppStyles.fontFamily.regularFont,
      fontSize:16,
      textAlign:'center'
    },
    sortingView:{
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center', 
      flex: 6 , 
      borderRightWidth:1, 
      borderRightColor:'#a3a3a3'
    },
    bottomsortContainer:{
      paddingTop:25,
      paddingLeft:25,
    },
    sortingbottomtxt:{
      fontFamily: AppStyles.fontFamily.regularFont,
      fontSize:16,
      marginTop:10,
    },
    applybutton:{
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      height:40,
      marginLeft:20,
      marginRight:20,
      justifyContent:'center',
      alignItems:'center',
      marginTop:10,
      width:'40%',
      alignSelf:'center'
      

    }
  });
};

export default dynamicStyles;
