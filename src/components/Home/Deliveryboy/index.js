import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";
import { connect } from "../../../utils/socket";
import AsyncStorage from "@react-native-community/async-storage";
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/MaterialIcons'

function ShowDeliveryBoyList(props) {

    const { title, dboylist, customerLat, customerLong } = props

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [dialogVisible, setdialogVisible] = useState(false)
    const [detailshoreDboy, setdetailshoreDboy] = useState([])
    const [isAccept, setisAccept] = useState(false)

    /**
     * Hire Delivery Boy
     * @param {any} dBoyid 
     * @param {number} distance 
     */
    const hiredBoy = async (dBoyid, distance, datadboy) => {

      
        setdialogVisible(false)
        let userid = await AsyncStorage.getItem('userId')
        let profile = await AsyncStorage.getItem('CurrentUser')
        let parsedProfileData = JSON.parse(profile)

        let address = await AsyncStorage.getItem('CustomerAddress')
        let parsedAddress = JSON.parse(address)
        console.log("dboyid=============",dBoyid , address)
        let cAddress =  parsedAddress.address_line_1 + ',' + parsedAddress.address_line_2 + ',' + parsedAddress.district + ',' + parsedAddress.state
        let body = {
            customerName: parsedProfileData.data.name,
            customerContact: parsedProfileData.data.mobile,
            customerKM: distance,
            customerLat: customerLat,
            customerLong: customerLong,
            customerAddress: cAddress,
            deliveryboyID:dBoyid, 
            customerID:userid
        }

        let socket = connect()
        socket.emit('hireDeliveryBoy', dBoyid, body)

        socket.on(`notifyCustomer-${userid}`,  function (data) {
            console.log("Response from Delivery boy", data)
            if(data) {
                if(data.message == 'ACCEPT'){
                    console.log("detailshoreDboy", datadboy)
                    setisAccept(true)
                    props.navigation.navigate('DBoyDetails', { details: datadboy })
                }else if (data.message == 'REJECT'){
                    console.log("call else if", data)
                    setisAccept(false)
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
                }
            }
        })

    }

    // cid 

    const displaydboylist = () => {
        return (
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={dboylist}
                renderItem={(item) => {

                    return (
                        <>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.dboyView}
                            onPress={() =>  [ isAccept ? props.navigation.navigate('DBoyDetails', { details: item.item.deliveryboy }): setdetailshoreDboy(item.item.deliveryboy)]}
                        >
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
                                <Image style={styles.delievryboyimg} source={item.item.deliveryboy.user_id.hasOwnProperty('profilePicture') ? { uri: item.item.deliveryboy.user_id.profilePicture } : require('../../../../assets/icons/user.png')} />
                            </View>
                            <View>
                                <Text style={[styles.productCardPrice, { marginLeft: 5, }]}> {item.item.deliveryboy.user_id.name} </Text>
                                <Text style={styles.productCardDescription}> {(item.item.distance).toFixed(2)} km </Text>
                            </View>
                            <TouchableOpacity onPress={() => setdialogVisible(true)} style={[styles.applybutton, { width: '90%' }]}>
                                <Text style={{ color: '#fff' }}>{'Hire'}</Text>

                            </TouchableOpacity>
                        </TouchableOpacity>
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
                                 <TouchableOpacity onPress={() => setdialogVisible(false)} style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                                     <Text style={styles.buttontxt}>Cancel</Text>
                                 </TouchableOpacity>
                                 <TouchableOpacity onPress={() => hiredBoy(item.item.deliveryboy.user_id._id, item.item.distance, item.item.deliveryboy)} style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                                     <Text style={styles.buttontxt}>Agree</Text>
                                 </TouchableOpacity>
                             </View>
                         </View>
                     </Dialog>
                     </>
                    )
                }}
           
            />
        )
    }

    return (

        <View style={styles.container} >
            <View style={[styles.unitContainer, { flexDirection: 'row' }]}>
                <Text style={styles.unitTitle}>{title}</Text>
            </View>
            {
                dboylist.length && displaydboylist()
            }
           
        </View>
    );

}



export default ShowDeliveryBoyList;


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