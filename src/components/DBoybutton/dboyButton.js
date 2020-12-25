import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, Text, View, Platform, PermissionsAndroid, Dimensions, TextInput } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import Icon from 'react-native-vector-icons/MaterialIcons'
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
let width = Dimensions.get('screen').width
let height = Dimensions.get('window').height
import { Dialog } from 'react-native-simple-dialogs';
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-community/async-storage";
import payfromwallet from "../../services/Wallet/payfromwallet";
import getamountWallet from "../../services/Wallet/getamountWallet";

function DBoyButton(props) {
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);


  
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={props.onPress}>
                <Image source={require('../../../assets/images/dboybutton.png')} style={{ width: 25, height: 25, marginRight: 10 }} />
            </TouchableOpacity>
        </View>
      
    );
}


export default DBoyButton
