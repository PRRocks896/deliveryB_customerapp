import React, { useEffect, useState, useRef } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, PermissionsAndroid, Alert, Share, ActivityIndicator, StyleSheet, } from "react-native";

import { Component } from "react";


class ProductDetailsPageScreen extends Component {


    static navigationOptions = ({ navigation, screenProps }) => {
        console.log("navigation.state.params", navigation.state.params)
        // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
        return {
            title:
                typeof navigation.state.params === "undefined" ||
                    typeof navigation.state.params.title === "undefined"
                    ? "Product"
                    : (navigation.state.params.title).replace(/_/g, " "),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
          

        };
        this.appConfig =
            props.navigation.state.params.appConfig ||
            props.navigation.getParam("appConfig");

    }

    componentDidMount = () => {
     
    }

 

    render() {

        return(
            <View>
                <Text>hiiiii</Text>
            </View>
        )
              
    }
}



export default ProductDetailsPageScreen;


const styless = StyleSheet.create({
  
})