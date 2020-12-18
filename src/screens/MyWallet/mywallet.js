"use strict";
import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, RefreshControl, FlatList, TextInput, BackHandler, PermissionsAndroid } from 'react-native';
import AppStyles from '../../AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Dialog } from 'react-native-simple-dialogs';
import getamountWallet from '../../services/Wallet/getamountWallet';
import AsyncStorage from '@react-native-community/async-storage';
import getwallettransactions from '../../services/Wallet/getwalletTransaction';
import Appstyle from '../../AppStyles'
import moment from "moment";
import { EventRegister } from 'react-native-event-listeners'
import { ActivityIndicator } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import payfromwallet from '../../services/Wallet/payfromwallet';
import createOrderRazorpay from '../../services/Order/createrazorpayorder';
import RazorpayCheckout from 'react-native-razorpay';
import addamountwallet from '../../services/Wallet/addamountwallet';
import { Alert } from 'react-native';
import Config from '../../config';

export default class MyWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClickbtn: false,
            dialogVisible: false,
            amount: '',
            isLoading: false,
            walleteamount: '0',
            transctionslist: [],
            dataRefresh: false,
            amountError: '',
            refreshing: false,
            fetchingStatus: false,
            setOnLoad: false,

            qrvalue: '',
            opneScanner: false,
            qrdialodvisible: false,
            qramount: '',
            qramountError: '',
            qrLoading: false,
            page: 1
        };
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()

            });
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    }
    onOpenlink() {
        //Function to open URL, If scanned 
        Linking.openURL(this.state.qrvalue);
        //Linking used to open the URL in any browser that you have installed
    }
    onBarcodeScan = async (qrvalue) => {

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", qrvalue)

        //called after te successful scanning of QRCode/Barcode
        this.setState({ qrvalue: qrvalue });


        this.setState({ opneScanner: false, qrdialodvisible: true });
    }
    onOpneScanner() {
        var that = this;
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
                        that.setState({ qrvalue: '' });
                        that.setState({ opneScanner: true });
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
            that.setState({ qrvalue: '' });
            that.setState({ opneScanner: true });
        }
    }

    /**
      * for back to prev screen
      */
    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;

    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    loadwalletdata = async () => {
        EventRegister.addEventListener('WalletRefresh', (data) => this.setState({ walleteamount: data }))
        EventRegister.addEventListener('WalletRefreshTransaction', (data) => this.setState({ transctionslist: data }))

        let mobile = await AsyncStorage.getItem('CurrentUser')
        let mobileParsed = JSON.parse(mobile)
        let phoneno = mobileParsed.data.mobile

        const data = await getamountWallet(phoneno)

        if (data.success) {

            this.setState({ walleteamount: data.data.balance })
        }
        let body = JSON.stringify({
            "where": {

            },
            "pagination": {
                "sortBy": "createdAt",
                "descending": true,
                "rowsPerPage": 10,
                "page": this.state.page
            }
        })
        console.log("body", body)
        const transctions = await getwallettransactions(phoneno, body)
        console.log("resp", transctions.data.list.length)
        this.setState({ transctionslist: this.state.page == 1 ? transctions.data.list : [...this.state.transctionslist, ...transctions.data.list], setOnLoad: true })

    }
    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.loadwalletdata()

    }
    orderDetails = () => {
        const { transctionslist, refreshing } = this.state
        return (
            <FlatList
                data={transctionslist}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    this.componentDidMount()
                }} />}
                renderItem={({ item, index }) => {
                    const date = moment(item.createdAt).format('DD/MM/YYYY HH:mm')

                    return (
                        <View style={{ marginBottom: 10, margin: 3 }}>
                            <View style={[styles.card, styles.detailMainCard]}>
                                <View style={{ flex: 8, flexDirection: 'column', justifyContent: 'center' }}>
                                    <View style={styles.row}>
                                        <Text style={styles.tital}>Details: </Text>
                                        <Text style={styles.subtitle}> {item.transaction_details}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.tital}>Type: </Text>
                                        <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}> {item.transaction_type}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.tital}>Amount: </Text>
                                        <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}> {item.amount}</Text>
                                    </View>
                                </View>
                                <View style={[styles.row, { position: 'absolute', right: 10, bottom: 10, marginTop: 10 }]}>
                                    <Text style={styles.timedate}>{date}</Text>
                                </View>


                            </View>
                        </View>
                    )
                }}
                keyExtractor={(item) => item._id}
                onEndReachedThreshold={0.8}
                onEndReached={this.LoadMoreRandomData}
                ListFooterComponent={this.BottomView()}
            />
        )
    }
    LoadMoreRandomData = () => {
        this.setState({
            page: this.state.page + 1
        }, () => this.loadwalletdata())
    }
    BottomView = () => {
        return (
            <View>
                {
                    (this.state.fetchingStatus)
                        ?
                        <ActivityIndicator size="large" color="#000" style={{ marginLeft: 6 }} />
                        :
                        null
                }
            </View>
        )
    }
    addqramount = async () => {
        let mobileno = await AsyncStorage.getItem('UserMobile')
        // console.log("USer Mobile no", mobileno)
        const { qramount, qramountError, qrdialodvisible, walleteamount, qrvalue } = this.state
        // console.log("Add Qr amount", this.state.walleteamount, this.state.qramount)
        if (qramount == '') {
            this.setState({ qramountError: "Please Enter Amount" })
        } else if (walleteamount < qramount) {
            // console.log("Value=============", parseFloat(qramount) - parseFloat(walleteamount))
            let money = parseFloat(qramount) - parseFloat(walleteamount)
            this.setState({ qramountError: `Insufficient Balance, Please add ${money} to your wallet` })
        } else {
            this.setState({ qrLoading: true })
            // console.log(">>>>>>>>>>>>>>>>>>",qramount,qrvalue,mobileno)
            let body = JSON.stringify({
                amount: parseFloat(qramount),
                shop_mobile: qrvalue
            })

            console.log("body=========", body)
            const response = await payfromwallet(body, mobileno)
            console.log("response", response)
            if (response.statusCode == 200) {
                this.componentDidMount()
                this.setState({ qrdialodvisible: false, qrLoading: false, qramount:'' })
            } else {
                this.setState({ qramountError: response.message, qrLoading: false , qramount:''})
            }
        }
    }


    addFromRazorpay = async () => {
        if (this.state.amount !== '') {

            this.setState({isLoading: true})
            let body = JSON.stringify({
                "amount": parseFloat(this.state.amount) * 100,
                "currency": "INR",
                "receipt": 'receipt#' + Math.floor(100000000 + Math.random() * 900000000),
                "notes": "Test Payment"
            })
            console.log("============body", body)
            const response = await createOrderRazorpay(body)
            console.log("Response of razor pay order", response)

            if (response && response.id && response.status == 'created') {
                this.razorpayopen(response.id)
            }
        }
    }

    razorpayopen = async (orderid) => {

        let profile = await AsyncStorage.getItem('CurrentUser')
        let parsedData = JSON.parse(profile)
        let name = parsedData.data.name
        let email = parsedData.data.email
        let contact = parsedData.data.mobile
       
        let amount = Math.floor(this.state.amount) * 100
        var options = {
            description: 'Tribata',
            image: 'https://linkpicture.com/q/logo_227.png',
            currency: 'INR',
            // key: 'rzp_live_SJvGLjm6gU2DCI',
            key: Config.razorpaykey,
            amount: amount * 100,
            name: name,
            order_id: orderid,
            prefill: {
                email: email,
                contact: contact,
                name: name
            },
            theme: { color: '#53a20e' }
        }
        RazorpayCheckout.open(options).then((data) => {
            console.log("On Success response", data)
            if (data.hasOwnProperty('razorpay_payment_id')) {
                this.addtowalletamoutfun()
                // this.setState({ transactionid: data.razorpay_payment_id })
                // this.setState({ chargeConfirm: 'OTHER' })
               
            } else {
                Alert.alert("", "Something went wrong")
            }
        }).catch((error) => {
            console.log("Error", error.code, error.description)
            
        });
    }

    addtowalletamoutfun = async () => {
        let mobile = await AsyncStorage.getItem('CurrentUser')
        let mobileParsed = JSON.parse(mobile)
        let phoneNo = mobileParsed.data.mobile
        let body = JSON.stringify({
            amount: parseFloat(this.state.amount)
        })
        const data = await addamountwallet(body, phoneNo)
        if (data.success) {
            this.setState({isLoading: false, dialogVisible: false, amount:'', amountError:''})
            this.loadwalletdata()
        } else {
            this.setState({isLoading: false, dialogVisible: false,  amount:'', amountError:''})
            Alert.alert(
                "",
                data.message,
                [
                    { text: "Ok", },
                ],
            );
        }
     }

    render() {
        const { isLoading, amount, walleteamount, refreshing } = this.state
        if (!this.state.opneScanner) {
            return (
                <View style={[styles.container, { backgroundColor: '#fff' }]}>
                    <View style={[styles.card, styles.row]}>
                        <Image style={styles.imgrs} source={AppStyles.iconSet.rupee} />
                        <Text style={styles.rstxt}>{walleteamount}</Text>
                    </View>

                    <Text style={{ fontSize: 18 }}>Payment History</Text>
                    {this.orderDetails()}

                    <TouchableOpacity
                        onPress={() => this.onOpneScanner()}
                        style={[styles.fotterbtn, { bottom: 80 }]}>
                        <Image source={require('../../../assets/images/qr-code.png')} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => this.setState({ dialogVisible: true })}
                        style={styles.fotterbtn}>
                        <Icon name={'add'} size={35} color={'#fff'} />
                    </TouchableOpacity>



                    <Dialog
                        visible={this.state.dialogVisible}
                        title="Add amount to your wallet"
                        onTouchOutside={() => this.setState({ dialogVisible: false })}>
                        <View>
                            <TextInput
                                keyboardType='number-pad'
                                underlineColorAndroid="transparent"
                                placeholder='Enter Amount'
                                style={styles.cvvinput}
                                maxLength={5}
                                onChangeText={(text) => this.setState({ amount: text })}
                            />
                            {
                                this.state.amountError !== '' ?
                                    <View>
                                        <Text style={styles.errortxt}>{this.state.amountError}</Text>
                                    </View>
                                    : null
                            }
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 6 }}>

                                    <View style={styles.addbtnContainer}>
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.setState({ dialogVisible: false, amountError: '' })}>

                                            <Text style={styles.addtext}>Cancel</Text>

                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 6 }}>

                                    <View style={styles.addbtnContainer}>
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => amount.length !== 0 ? this.addFromRazorpay() : this.setState({ amountError: 'Please Enter Amount' })}>
                                            {
                                                isLoading ?
                                                    <ActivityIndicator color={'#000'} size="small" />
                                                    :
                                                    <Text style={styles.addtext}>Add</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>

                    </Dialog>

                    <Dialog
                        visible={this.state.qrdialodvisible}
                        title={`Pay to ${this.state.qrvalue}`}
                        onTouchOutside={() => this.setState({ qrdialodvisible: false })}>
                        <View>
                            <TextInput
                                keyboardType='number-pad'
                                underlineColorAndroid="transparent"
                                placeholder='Enter Amount'
                                style={styles.cvvinput}
                                maxLength={5}
                                onChangeText={(text) => this.setState({ qramount: text })}
                            />
                            {
                                this.state.qramountError !== '' ?
                                    <View>
                                        <Text style={styles.errortxt}>{this.state.qramountError}</Text>
                                    </View>
                                    : null
                            }
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 6 }}>

                                    <View style={styles.addbtnContainer}>
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.setState({ qrdialodvisible: false, qramountError: '' })}>

                                            <Text style={styles.addtext}>Cancel</Text>

                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 6 }}>

                                    <View style={styles.addbtnContainer}>
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.addqramount()}>
                                            {
                                                this.state.qrLoading ?
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
                </View>
            )
        }

        return (
            <>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => this.setState({ opneScanner: !this.state.opneScanner })} style={{ position: 'absolute', top: 15, right: 15, zIndex: 1 }}>
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
                        onReadCode={event =>{
                            this.onBarcodeScan(event.nativeEvent.codeStringValue)
                            console.log("event==============", event.nativeEvent)
                        }
                        }
                    />
                </View>


            </>
        )

    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    card: {
        marginTop: 5,
        backgroundColor: '#555555',
        padding: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5,
        height: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rstxt: {
        fontFamily: AppStyles.fontFamily.boldFont,
        fontSize: 30,
        color: '#fff'
    },
    mainView: {
        flex: 1,
        marginTop: 10
    },
    detailMainCard: {
        backgroundColor: '#fff',
        height: 'auto',
        flexDirection: 'row',
        padding: 10
    },
    fotterbtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: '#555555',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addbtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    addcvvbutton: {
        borderColor: '#a3a3a3',
        borderRadius: 5,
        width: '90%',
        height: 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        padding: 15
    },
    addtext: {
        fontSize: 20
    },
    cvvinput: {
        borderBottomWidth: 1,
        borderBottomColor: '#a3a3a3'
    },
    tital: {
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 15
    },
    subtitle: {
        fontFamily: Appstyle.fontFamily.lightFont
    },
    row: {
        flexDirection: 'row'
    },
    timedate: {
        color: '#a3a3a3',
        fontFamily: Appstyle.fontFamily.semiBoldFont,
        fontSize: 12
    },
    imgrs: {
        width: 25,
        height: 25,
        marginTop: 3
    }, errortxt: {
        color: 'red'
    }
});