import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Linking, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";

function DBoyDetails(props) {

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    console.log("props details", props.navigation.state.params.details)
    const details = props.navigation.state.params.details
    return (

        <View style={[styles.container, { marginLeft: 10, marginRight: 10 }]} >
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.tital}>Name :  </Text>
                    <Text style={styles.subtitle}>{details.user_id.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.tital}>Email :  </Text>
                    <Text style={styles.subtitle}>{details.user_id.email}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.tital}>Mobile :  </Text>
                    <Text style={styles.subtitle}>{details.user_id.mobile}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress ={ () => Linking.openURL(`tel:${details.user_id.mobile}`)} style={[styles.buttoncontainer, { flex: 6 , width:'90%'}]}>
                    <Text style={styles.buttontxt}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttoncontainer, { flex: 6 , width:'90%'}]}>
                    <Text style={styles.buttontxt}>Pay</Text>
                </TouchableOpacity>
            </View>


        </View>
    );

}



export default DBoyDetails;
