import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, Text, View, Platform, PermissionsAndroid, Dimensions, TextInput } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
let width = Dimensions.get('screen').width
let height = Dimensions.get('window').height


function DBoyButton(props) {
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);


  
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={props.onPress}>
                <Image source={require('../../../assets/images/dboybutton.png')} style={{ width: 28, height: 28, marginRight: 10 }} />
            </TouchableOpacity>
        </View>
      
    );
}


export default DBoyButton
