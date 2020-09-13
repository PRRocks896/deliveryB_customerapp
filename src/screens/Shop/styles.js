import { StyleSheet } from "react-native";
// import AppStyles from "../../AppStyles";

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
  shopmainSkeleton:{
    flexDirection: "row", alignItems: "center"
  }

});

export default styles;
