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

function ScanAndPayButton(props) {
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [opneScanner, setopneScanner] = useState(false)
    const [qrvalue, setqrvalue] = useState('')
    const [qrdialodvisible, setqrdialodvisible] = useState(false)
    const [qramount, setqramount] = useState('')
    const [qramountError, setqramountError] = useState('')
    const [qrLoading, setqrLoading] = useState(false)

    const onBarcodeScan = async (qrvalue) => {

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", qrvalue)

        setqrvalue(qrvalue)
        setopneScanner(false)
        setqrdialodvisible(true)
        setqramountError('')
        setqramount('')
    }
    const onOpneScanner = async () => {
        console.log("call")

        //To Start Scanning
        if (Platform.OS === 'android') {
            async function requestCameraPermission() {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.CAMERA, {
                        'title': 'CameraExample App Camera Permission',
                        'message': 'CameraExample App needs access to your camera '
                    }
                    )
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        //If CAMERA Permission is granted
                        setqrvalue('')
                        setopneScanner(true)
                    } else {
                        alert("CAMERA permission denied");
                    }
                } catch (err) {
                    alert("Camera permission err", err);
                    console.warn(err);
                }
            }
            //Calling the camera permission function
            requestCameraPermission();
        } else {
            setqrvalue('')
            setopneScanner(true)
        }
    }

    addqramount = async () => {


        let walleteamount;
        let mobileno = await AsyncStorage.getItem('UserMobile')
        const data = await getamountWallet(mobileno)

        if (data.success) {
            walleteamount = data.data.balance
        }

        if (qramount == '') {
            setqramountError("Please Enter Amount")
        } else if (walleteamount < qramount) {
            // console.log("Value=============", parseFloat(qramount) - parseFloat(walleteamount))
            let money = parseFloat(qramount) - parseFloat(walleteamount)
            setqramountError(`Insufficient Balance, Please add ${money} to your wallet`)
        } else {
            setqrLoading(true)
            // console.log(">>>>>>>>>>>>>>>>>>",qramount,qrvalue,mobileno)
            let body = JSON.stringify({
                amount: parseFloat(qramount),
                shop_mobile: qrvalue
            })

            console.log("body=========", body)
            const response = await payfromwallet(body, mobileno)
            console.log("response", response)
            if (response.statusCode == 200) {
                setqrLoading(false)
                setqrdialodvisible(false)
                setqramount('')
            } else {
                setqramountError(response.message)
                setqrLoading(false)
                setqramount('')
            }
        }
    }
    return (<>
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => onOpneScanner()}>
                <Image source={require('../../../assets/images/qr-code(home).png')} style={{ width: 25, height: 25, marginRight: 10 }} />
            </TouchableOpacity>
        </View>
        <Dialog
            visible={qrdialodvisible}
            title={`Pay to ${qrvalue}`}
            onTouchOutside={() => setqrdialodvisible(false)}>
            <View style={{ zIndex: 1 }}>
                <TextInput
                    keyboardType='number-pad'
                    underlineColorAndroid="transparent"
                    placeholder='Enter Amount'
                    style={styles.cvvinput}
                    maxLength={5}
                    onChangeText={(text) => setqramount(text)}
                />
                {
                    qramountError !== '' ?
                        <View>
                            <Text style={styles.errortxt}>{qramountError}</Text>
                        </View>
                        : null
                }
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 6 }}>

                        <View style={styles.addbtnContainer}>
                            <TouchableOpacity style={styles.addcvvbutton} onPress={() => [setqrdialodvisible(false), setqramountError(''), setqrLoading(false)]}>
                                <Text style={styles.addtext}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 6 }}>

                        <View style={styles.addbtnContainer}>
                            <TouchableOpacity style={styles.addcvvbutton} onPress={() => addqramount()}>
                                {
                                    qrLoading ?
                                        <ActivityIndicator color={'#000'} size="small" />
                                        :
                                        <Text style={styles.addtext}>Pay</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

        </Dialog>
        {
            opneScanner ?
                <View style={{ flex: 1, zIndex: 11111, width: width }}>
                    <TouchableOpacity onPress={() => setopneScanner(!opneScanner)} style={{ position: 'absolute', top: 15, right: 15, zIndex: 1 }}>
                        <Icon name={'close'} size={30} color={'#fff'} />
                    </TouchableOpacity>
                    <CameraKitCameraScreen
                        showFrame={false}
                        //Show/hide scan frame
                        scanBarcode={true}
                        //Can restrict for the QR Code only
                        laserColor={'blue'}
                        //Color can be of your choice
                        frameColor={'yellow'}
                        //If frame is visible then frame color
                        colorForScannerFrame={'black'}
                        //Scanner Frame color
                        onReadCode={event => {
                            onBarcodeScan(event.nativeEvent.codeStringValue)
                            console.log("event==============", event.nativeEvent.codeStringValue)
                        }
                        }

                    />


                </View>
                : null

        }
    </>
    );
}


export default ScanAndPayButton
