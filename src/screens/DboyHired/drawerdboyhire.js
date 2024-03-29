import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../../components/Home/styles";
import { useColorScheme } from "react-native-appearance";
import { connect, disconnect } from "../../utils/socket";
import AsyncStorage from "@react-native-community/async-storage";
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/MaterialIcons'

import Toast from 'react-native-simple-toast';
import onBookinAcceptService from "../../services/Order/onbookinaccept";

function DrawerDeliveryBoyList(props) {

    const { title, dboylist, customerLat, customerLong, callFunction } = props

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [dialogVisible, setdialogVisible] = useState(false)
    const [detailshoreDboy, setdetailshoreDboy] = useState([])
    const [isAccept, setisAccept] = useState(false)
    const [issocketAccept, setissocketAccept] = useState(false)

    const [isAggreeLoading, setisAggreeLoading] = useState(false)

    const [clickdboyData, setclickdboyData] = useState({})


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
        console.log("call=========================================", userid, body)
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
            // hiredBoy(dboyid, distance, datadboy, acceptresponse.data._id)

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
                data={dboylist}
                renderItem={(item) => {
                    return (
                        <>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.dboyView, { flex: 1,
                                    flexDirection: 'column',
                                    maxWidth:'50%', 
                                    justifyContent:'center',
                                    alignItems:'center',
                                    margin: 1}]}
                                onPress={() => [isAccept ? props.navigation.navigate('DBoyDetails', { details: item.item.deliveryboy }) : setdetailshoreDboy(item.item.deliveryboy)]}
                            >
                                <View style={[styles.dboyContainer, { marginLeft: 5 , justifyContent:'center', alignItems:'center'}]}>
                                    <Image style={styles.delievryboyimg} source={item.item.deliveryboy.user_id.hasOwnProperty('profilePicture') ? { uri: item.item.deliveryboy.user_id.profilePicture } : require('../../../assets/icons/user.png')} />
                                </View>
                                <View style={{justifyContent:'center', alignItems:'center'}}>
                                    <Text style={[styles.productCardPrice, { marginLeft: 5, }]}> {item.item.deliveryboy.user_id.name} </Text>
                                    <Text style={styles.productCardDescription}> {(item.item.distance).toFixed(2)} km </Text>
                                </View>
                                <TouchableOpacity onPress={() => [setdialogVisible(true), setclickdboyData(item.item)]} style={[styles.applybutton, { width: '90%' }]}>
                                    <Text style={{ color: '#fff' }}>{'Hire'}</Text>

                                </TouchableOpacity>
                            </TouchableOpacity>

                        </>
                    )
                }}
                numColumns={2}
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



export default DrawerDeliveryBoyList;


// {
//     "__v":0,
//     "_id":"5fc1d78343a0e2596d0a7d3d",
//     "createdAt":"2020-11-28T04:52:19.587Z",
//     "deliverytype":"2",
//     "email":"rajeshkrishnan654@gmail.com",
//     "isActive":true,
//     "isVerified":true,
//     "mobile":"+919972035242",
//     "name":"Rajesh",
//     "otp":"548466",
//     "password":"$2a$10$vrBJMpAxLJuLWktFeZlUweu0HPVw0ZB9AKco5R2JeMozmXtFZ3bNS",
//     "reqToken":"hiqhuhnxki17xrs6",
//     "role":"Delivery",
//     "updatedAt":"2020-11-28T05:00:03.240Z"
//  }

// {
//     "index":1,
//     "item":{
//        "deliveryboy":{
//           "__v":0,
//           "_id":"5fcc8e47e42b7d3f701c832d",
//           "createdAt":"2020-12-06T07:54:47.455Z",
//           "dl":"https://tribata.s3.ap-south-1.amazonaws.com/image-3fb0b89d-e191-4198-b0ab-3883120575b8.jpg",
//           "franchiseID":"5fcc8d46e42b7d3f701c832b",
//           "idproof":"https://tribata.s3.ap-south-1.amazonaws.com/image-5895e357-9380-4c4b-b3e6-5ac00b788702.jpg",
//           "isActive":true,
//           "isFranchiseSubmitted":true,
//           "isOccupied":false,
//           "isOnline":true,
//           "isPersonalDetail":true,
//           "isPersonalDocumentSubmitted":true,
//           "isPhysicalVerification":true,
//           "isVehicleDetailSubmitted":true,
//           "lat":13.075566,
//           "long":77.5045267,
//           "rc":"https://tribata.s3.ap-south-1.amazonaws.com/rc.jpeg",
//           "registrationNumber":"364848494u",
//           "updatedAt":"2020-12-07T10:47:53.689Z",
//           "user_id":[
//              "Object"
//           ],
//           "vehicleBackPhoto":"https://tribata.s3.ap-south-1.amazonaws.com/vehicleback.jpeg",
//           "vehicleFrontPhoto":"https://tribata.s3.ap-south-1.amazonaws.com/vehiclefront.jpeg"
//        },
//        "distance":1248.3139984165332
//     },
//     "separators":{
//        "highlight":[
//           "Function highlight"
//        ],
//        "unhighlight":[
//           "Function unhighlight"
//        ],
//        "updateProps":[
//           "Function updateProps"
//        ]
//     }
//  }