import React, { useEffect, useState } from "react";
import { ScrollView, View, TextInput, FlatList, TouchableOpacity, Linking, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";
import { Dialog } from 'react-native-simple-dialogs';
import AsyncStorage from "@react-native-community/async-storage";
import paytoDBoyService from "../../../services/Wallet/sendtoDBoy";
import { connect } from "../../../utils/socket";
import bookingChargeService from "../../../services/Order/bookingchargepat";
import bookingStatusService from "../../../services/Order/changeBookingStatus";
import Toast from 'react-native-simple-toast';

function DBoyDetails(props) {

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);

    const details = props.navigation.state.params.details

    const [dialogVisible, setdialogVisible] = useState(false)
    const [amount, setamount] = useState(0)
    const [amountError, setamountError] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [purpose, setpurpose] = useState('')
    const [realise, setrealise] = useState(false)

    // console.log("details", details)

    const paydata = async () => {
        let usermobile = await AsyncStorage.getItem('UserMobile')
        let dBoymobile = details.user_id.mobile
        let bookingid = props.navigation.state.params.bookingid
        console.log("booking id========================", amount,  props.navigation.state.params)
        if (amount !== 0) {
            setisLoading(true)
            let body = JSON.stringify({
                from_mobile: usermobile,
                to_mobile: dBoymobile,
                amount: parseFloat(amount),
                purpose: purpose
            })
            const response = await paytoDBoyService(body)
            console.log("Response of pay", response)
            if (response.statusCode == 200) {
                let databody = JSON.stringify({
                    "delivery_charges": parseFloat(amount)
                })
                console.log("body of pay", databody, bookingid)
                const responsedata = await bookingChargeService(databody, bookingid)
                console.log("response=========of pay ", responsedata)
                if (responsedata.statusCode == 200) {
                    setisLoading(false)
                    setrealise(true)
                    setdialogVisible(false)

                } else {
                    Alert.alert("", responsedata.message)
                }
            } else {
                Alert.alert("", response.message)
                setisLoading(false)
                setdialogVisible(false)
            }
        }

        if (amount == '') setamountError("Please Enter Amount")
    }

    const realiseDBoy = async () => {
        let id = details.user_id._id
        let bookingid = props.navigation.state.params.bookingid
        let socket = connect()
        console.log("id===============================", id)
        let databody = {
            userID: id,
            isOccupied: false,
        }
        socket.emit('deliveryboyHired', databody)
        const body = JSON.stringify({
            "status": "COMPLETED"
        })
        const response = await bookingStatusService(body, bookingid)
        if (response.statusCode == 200) {
            props.navigation.goBack()

        } else {
            Toast.show(response.message, Toast.LONG, [
                'UIAlertController',
            ]);
        }
    }
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
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${details.user_id.mobile}`)} style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                    <Text style={styles.buttontxt}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => [realise ? realiseDBoy() : setdialogVisible(true)]}
                    style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                    <Text style={styles.buttontxt}>{realise ? 'Release' : 'Pay'}</Text>
                </TouchableOpacity>
            </View>

            <Dialog
                visible={dialogVisible}
                title={`Pay to ${details.user_id.name}`}
                onTouchOutside={() => setdialogVisible(false)}>
                <View>
                    <TextInput
                        keyboardType='number-pad'
                        underlineColorAndroid="transparent"
                        placeholder='Enter Amount'
                        style={styles.cvvinput}
                        maxLength={5}
                        keyboardType={'number-pad'}
                        onChangeText={(text) => setamount(text)}
                    />
                    {
                        amountError !== '' ?
                            <View>
                                <Text style={styles.errortxt}>{amountError}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        underlineColorAndroid="transparent"
                        placeholder='Enter Message'
                        style={styles.cvvinput}

                        onChangeText={(text) => setpurpose(text)}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 6 }}>

                            <View style={styles.addbtnContainer}>
                                <TouchableOpacity style={styles.addcvvbutton} onPress={() => [setamountError(''), setdialogVisible(false),    setisLoading(false)]}>

                                    <Text style={styles.addtext}>Cancel</Text>

                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 6 }}>

                            <View style={styles.addbtnContainer}>
                                <TouchableOpacity style={styles.addcvvbutton} onPress={() => paydata()}>
                                    {
                                        isLoading ?
                                            <ActivityIndicator color={'#000'} size="small" />
                                            :
                                            <Text style={styles.addtext}>{'Pay'}</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

            </Dialog>
        </View>
    );

}



export default DBoyDetails;
