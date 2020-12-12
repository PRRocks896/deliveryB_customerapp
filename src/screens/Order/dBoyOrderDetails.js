import React, { Component } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert } from 'react-native'
import Appstyle from '../../AppStyles'
import { List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Dialog } from 'react-native-simple-dialogs';

import { connect } from "../../utils/socket";
import detailsdboyService from "../../services/Order/getdboydetails";
import paytoDBoyService from "../../services/Wallet/sendtoDBoy";
import bookingChargeService from "../../services/Order/bookingchargepat";
import bookingStatusService from "../../services/Order/changeBookingStatus";
import AsyncStorage from "@react-native-community/async-storage";
import Toast from 'react-native-simple-toast';

const LATITUDE = 22.2856;
const LONGITUDE = 70.7561;
class DBoyOrderDetailsScreen extends Component {
    constructor(props) {
        super(props);


        this.state = {
            orderid: '',
            status: '',
            slottime: '',
            slotdate: '',
            amount: '',

            delierytype: this.props.navigation.state.params.deliverytype,
            payment_method: '',
            quantity: '',
            shopname: '',
            paymentstatus: '',


            dname: '',
            dPhone: '',
            dphonemo: '',
            dialogVisible: false,
            realise: false,
            amount: '',
            amountError: '',
            isLoading: false,
            purpose: '',

            isshowPaybtn: false

        }

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                // this.componentDidMount()

            });
    }

    componentDidMount = async () => {
        

        let id = this.props.navigation.state.params.data.delivery_boy.user_id
        const response = await detailsdboyService(id)
        console.log("response dboy details", response)
        if (response.statusCode == 200) {
            this.setState({ dname: response.data[0].user_id.name, dPhone: response.data[0].user_id.mobile })
        }
        const details = this.props.navigation.state.params.data
        console.log("details.delivery_charg", details.delivery_charge)
        if (details.delivery_charge == 0) {
            this.setState({ isshowPaybtn: true })
        }
    }


    paydata = async () => {
        const { amount, purpose , dPhone} = this.state
        const bookingData = this.props.navigation.state.params.data
        let usermobile = await AsyncStorage.getItem('UserMobile')
        let dBoymobile = dPhone
        let bookingid = bookingData._id
        this.setState({ isLoading: true })

        if (amount !== '') {
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
                console.log("body of pay", databody)
                const responsedata = await bookingChargeService(databody, bookingid)
                console.log("response=========of pay ", responsedata)
                if (responsedata.statusCode == 200) {
                    this.setState({ isLoading: false, realise: true, dialogVisible: false })

                } else {
                    Alert.alert("", responsedata.message)
                }
            } else {
                Alert.alert("", response.message)
                this.setState({ isLoading: false, dialogVisible: false })


            }
        }

        if (amount == '') this.setState({ amountError: "Please Enter Amount" })
    }

    realiseDBoy = async () => {
        const bookingData = this.props.navigation.state.params.data
        let id = bookingData.delivery_boy._id
        let bookingid = bookingData._id
        let socket = connect()
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
            this.props.navigation.goBack()

        } else {
            Toast.show(response.message, Toast.LONG, [
                'UIAlertController',
            ]);
        }
    }
    render() {
        const { dname, dPhone, realise } = this.state
        const data = this.props.navigation.state.params.data // Data from params (orderscreen and servicebookscreen)
        // console.log("==============================data", data)

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={[styles.card, styles.marginTop]}>
                    <View style={styles.row}>
                        <Text style={styles.tital}>Your Booking number :  </Text>
                        <Text style={styles.subtitle}>{data.booking_number}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.tital}>Booking Status:  </Text>
                        <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.status}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.tital}>Total amount:  </Text>
                        <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(data.delivery_charge).toFixed(2)}</Text>
                    </View>

                    {
                        data.hasOwnProperty('delivery_boy') ?
                            <>
                                <View style={styles.row}>
                                    <Text style={styles.tital}>DeliveryBoy Name:  </Text>
                                    <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{dname}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.tital}>DeliveryBoy Contact:  </Text>
                                    <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{dPhone}</Text>
                                </View>
                                {
                                    this.state.isshowPaybtn ?
                                        <View style={{ flexDirection: 'row' }}>
                                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${dPhone}`)} style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                                                <Text style={styles.buttontxt}>Call</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => [realise ? this.realiseDBoy() : this.setState({ dialogVisible: true })]}
                                                style={[styles.buttoncontainer, { flex: 6, width: '90%' }]}>
                                                <Text style={styles.buttontxt}>{realise ? 'Release' : 'Pay'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : null
                                }

                            </>
                            : null
                    }

                    <Dialog
                        visible={this.state.dialogVisible}
                        title={`Pay to ${dname}`}
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
                            <TextInput
                                underlineColorAndroid="transparent"
                                placeholder='Enter Message'
                                style={styles.cvvinput}

                                onChangeText={(text) => this.setState({ purpose: text })}
                            />
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
                                        <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.paydata()}>
                                            {
                                                this.state.isLoading ?
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
            </View>
        );


    }
}


export default DBoyOrderDetailsScreen;

const styles = StyleSheet.create({
    card: {
        margin: 5,
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5
    },
    marginTop: {
        marginTop: 10
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
    buttoncontainer: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        marginTop: 10,
        margin: 10
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
        paddingLeft:15,
        paddingRight:15,
        padding:15
      },
      addtext: {
        fontSize: 20
      },
})