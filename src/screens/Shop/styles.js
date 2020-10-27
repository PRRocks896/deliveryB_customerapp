import { StyleSheet, Dimensions } from "react-native";
import AppStyles from "../../AppStyles";
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bestsellerMainSkeleton: {
    width: 165,
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
  shopCategorySkeleton: {
    width: 350,
    height: 80,
    margin: 20,
    borderRadius: 10
  },
  shopmainSkeleton: {
    flexDirection: "row", alignItems: "center"
  },

  card: {
    margin: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    maxWidth: '60%',
    width: '45%',
    marginLeft: 10,
    marginRight: 10,
  },
  serviceImage: {
    width: '100%',
    height: 200
  },
  productCardPrice: {
    textAlign: "left",
    fontSize: 14,
    color: '#a3a3a3',
    fontFamily: AppStyles.fontFamily.boldFont,

  },
  productCardDescription: {
    textAlign: "left",
    fontSize: 13,
    color: '#000',
    fontFamily: AppStyles.fontFamily.regularFont,
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
    backgroundColor: '#fff'
  },
  descriptionContainer: {
    height: 'auto'
  },
  headerContainerStyle: {
    width: "96%",
    alignSelf: "center",
    height: "4%",
    position: "absolute",
    top: "2%",
  },
  title: {
    fontFamily: AppStyles.fontFamily.regularFont,
    color: '#A9A9A9',
    paddingTop: 20,
    paddingLeft: 15,
    fontSize: 17
  },
  price: {
    fontFamily: AppStyles.fontFamily.regularFont,
    color: '#A9A9A9',
    paddingTop: 7,
    paddingLeft: 15,
    fontSize: 15
  },
  addToBagContainerStyle: {
    backgroundColor: '#404040',
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
  }
});

export default styles;
