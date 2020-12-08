import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";

function DBoyDetails() {

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);

    return (

        <View style={[styles.container, { marginLeft: 10, marginRight: 10 }]} >
            <View style={styles.card}>
                <Text>Details</Text>
                <Text>Name</Text>
                <Text>Phone No.</Text>
                <Text>Details</Text>
            </View>
            <View style={[styles.card, {flexDirection:'row'}]}>
                    <View style={{flex:6}}>
                        <Text>call</Text>
                    </View>
                    <View style={{flex:6}}>
                    <Text>Massage</Text>
                    </View>
            </View>


        </View>
    );

}



export default DBoyDetails;
