import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";
import { connect, disconnect } from "../../../utils/socket";
import AsyncStorage from "@react-native-community/async-storage";
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/MaterialIcons'
import onBookinAcceptService from "../../../services/Order/onbookinaccept";
import Toast from 'react-native-simple-toast';
import getAddressviaUSer from "../../../services/SavedAddress/getAddressviaUser";

function ShowDeliveryBoyList(props) {

    const { title, dboylist, customerLat, customerLong, callFunction } = props

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [dialogVisible, setdialogVisible] = useState(false)
    const [detailshoreDboy, setdetailshoreDboy] = useState([])
    const [isAccept, setisAccept] = useState(false)
    const [issocketAccept, setissocketAccept] = useState(false)

    const [isAggreeLoading, setisAggreeLoading] = useState(false)

    const [clickdboyData, setclickdboyData] = useState({})


    useEffect( () => {
        getAddress()
    },[])

    const getAddress = async () => {
        let userid = await AsyncStorage.getItem('userId')
        // get address via user
        const data = await getAddressviaUSer(userid);
        if (data.data) {
          let dataAddress = data.data.address.filter(item => item.isDefault == true)
          AsyncStorage.setItem("CustomerAddress", JSON.stringify(dataAddress[0]))
          AsyncStorage.setItem("AddressId", data.data._id)
        }
    }

    /**
     * Hire Delivery Boy
     * @param {any} dBoyid 
     * @param {number} distance 
     */
    const hiredBoy = async (dBoyid, distance, datadboy, bookingid) => {
        setisAggreeLoading(false)
        //  onAccept(datadboy,dBoyid)
        setdialogVisible(false)
        let userid = await AsyncStorage.getItem('userId')
        let profile = await AsyncStorage.getItem('CurrentUser')
        let parsedProfileData = JSON.parse(profile)
        let address = await AsyncStorage.getItem('CustomerAddress')
        let parsedAddress = JSON.parse(address)

        console.log("Addresss===============",parsedAddress)
        let cAddress = parsedAddress.address_line_1 + ',' + parsedAddress.address_line_2 + ',' + parsedAddress.district + ',' + parsedAddress.state
        let body = {
            customerName: parsedProfileData.data.name,
            customerContact: parsedProfileData.data.mobile,
            customerKM: distance,
            customerLat: customerLat,
            customerLong: customerLong,
            customerAddress: cAddress,
            deliveryboyID: dBoyid,
            customerID: userid,
            booking_id: bookingid
        }
        console.log("call=========================================", dBoyid, userid, body)
        let socket = connect()
        socket.emit('hireDeliveryBoy', dBoyid, body)
        // disconnect()


    }

    const acceptSocketcall = async (datadboy, dBoyid) => {

        console.log("call================================acceptSocketcall")
        let userid = await AsyncStorage.getItem('userId')
        let socket = connect()
        socket.on(`notifyCustomer-${userid}`, function (data) {
            console.log("Response from Delivery boy", data)
            if (data) {

                if (data.message == 'ACCEPT') {
                    console.log("call if", data)
                    setisAccept(true)
                    props.navigation.navigate('DBoyDetails', { details: datadboy, bookingid: data.booking_id })
                    setisAggreeLoading(false)
                } else if (data.message == 'REJECT') {
                    console.log("call else if", data)
                    setisAccept(false)
                    setisAggreeLoading(false)
                    Alert.alert(
                        "Delivery boy is not available",
                        "Please try to choose another Delivery boy.",
                        [
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                            },
                            { text: "OK", onPress: () => console.log("OK Pressed") }
                        ],
                        { cancelable: false }
                    );
                } else {
                    setisAggreeLoading(false)
                    console.log("call else ", data.message)
                    Toast.show(data.message, Toast.LONG, [
                        'UIAlertController',
                    ]);
                }
            }
        })
        // disconnect()
    }

    const onAccept = async (dboyid, distance, datadboy) => {
        console.log("dboyid============", dboyid)
        setisAggreeLoading(true)
        let userid = await AsyncStorage.getItem('userId')
        const bodydata = JSON.stringify({
            "customer_id": userid,
            "booking_number": `deliveryboyBooking-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            "delivery_charge": 0,
            "delivery_boy": dboyid
        })
        const acceptresponse = await onBookinAcceptService(bodydata)
        console.log("response of acceot", acceptresponse)
        if (acceptresponse.statusCode == 200) {
            hiredBoy(dboyid, distance, datadboy, acceptresponse.data._id)
        } else {
            hiredBoy(dboyid, distance, datadboy, acceptresponse.data._id)

            setisAggreeLoading(false)
            Toast.show(acceptresponse.message, Toast.LONG, [
                'UIAlertController',
            ]);
        }

    }

    // cid 

    const displaydboylist = () => {
        return (
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={dboylist}
                renderItem={(item) => {
                    // console.log(":::::::::::::::::::::::::::::::::::::::::::::", item.item)
                    return (
                        <>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.dboyView}
                                onPress={() => [isAccept ? props.navigation.navigate('DBoyDetails', { details: item.item.deliveryboy }) : setdetailshoreDboy(item.item.deliveryboy)]}
                            >
                                {
                                    item.item.deliveryboy?.user_id !== null ?
                                        <>
                                            <View style={[styles.dboyContainer, { marginLeft: 5 }]}>
                                                <ActivityIndicator size={'small'} color={'#000'}
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }} />
                                                <Image style={styles.delievryboyimg} source={item.item.deliveryboy?.user_id.hasOwnProperty('profilePicture') ? { uri: item.item.deliveryboy.user_id.profilePicture } : require('../../../../assets/icons/user.png')} />
                                            </View>
                                            <View>
                                                <Text style={[styles.productCardPrice, { marginLeft: 5, }]}> {item.item.deliveryboy?.user_id.name} </Text>
                                                <Text style={styles.productCardDescription}> {(item.item.distance).toFixed(2)} km </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => [setdialogVisible(true), setclickdboyData(item.item)]} style={[styles.applybutton, { width: '90%' }]}>
                                                <Text style={{ color: '#fff' }}>{'Hire'}</Text>

                                            </TouchableOpacity>
                                        </>
                                        : null
                                }
                            </TouchableOpacity>

                        </>
                    )
                }}

            />
        )
    }

    return (

        <View style={styles.container} >
            <View style={[styles.unitContainer, { flexDirection: 'row' }]}>
                <View style={{ flex: 9 }}>
                    <Text style={styles.unitTitle}>{title}</Text>
                </View>
                <TouchableOpacity onPress={callFunction} style={{ flex: 3 }}>
                    <Icon name={'refresh'} color={'#a3a3a3'} size={26} style={{ textAlign: 'center', textAlignVertical: 'center', marginTop: 3 }} />
                </TouchableOpacity>
            </View>
            {
                dboylist.length && displaydboylist()
            }

            <Dialog
                visible={dialogVisible}
                title="Terms and Conditions"
                onTouchOutside={() => setdialogVisible(false)}
                titleStyle={styles.dialogtitle}>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name={'fiber-manual-record'} size={12} color={'#a3a3a3'} style={{ marginTop: 5 }} />
                        <Text style={styles.dialogtxt}>  {'It will carry up to 15 kg.'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name={'fiber-manual-record'} size={12} color={'#a3a3a3'} style={{ marginTop: 5 }} />
                        <Text style={styles.dialogtxt}>  {'Within 2km charge is 30 Rs and above 2 km charge 10 Rs per km.'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => [setdialogVisible(false), setisAggreeLoading(false)]} style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                            <Text style={styles.buttontxt}>Cancel</Text>
                        </TouchableOpacity>
                        {
                            isAggreeLoading ?
                                <TouchableOpacity style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                                    <ActivityIndicator color={'#fff'} size={'small'} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => [
                                    onAccept(clickdboyData.deliveryboy._id, clickdboyData.distance, clickdboyData.deliveryboy),
                                    acceptSocketcall(clickdboyData.deliveryboy, clickdboyData.deliveryboy._id)]}
                                    style={[styles.buttoncontainer, { flex: 6, width: '90%' }
                                    ]}>
                                    <Text style={styles.buttontxt}>Agree</Text>
                                </TouchableOpacity>
                        }
                    </View>
                </View>
            </Dialog>

        </View>
    );
}

export default ShowDeliveryBoyList;
