import React, { useState, useEffect } from "react";
import { Text, View, Alert, TextInput, TouchableOpacity } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import { Component } from "react";
import Toast from 'react-native-simple-toast';

import { IMLocalized } from "../../Core/localization/IMLocalization";
import { StyleSheet } from "react-native";
import IntlPhoneInput from 'react-native-intl-phone-input';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Button from 'react-native-button';
import AsyncStorage from "@react-native-community/async-storage";
import signin from "../../services/SignIn";
import getAddressviaUSer from "../../services/SavedAddress/getAddressviaUser";
import getProfileDetails from "../../services/Profile/getProfile";
import removeitemforlocalProducts from "../../services/AddToBag/deletebagforlocalproducts";
import firebase from 'react-native-firebase';
import { EventRegister } from 'react-native-event-listeners'
import { Linking } from "react-native";
import signup from "../../services/SignUp";
import OTP from '../../Core/onboarding/SmsAuthenticationScreen/otpInput'
import verifyOTP from "../../services/OTPVerification";
import TNActivityIndicator from "../../Core/truly-native/TNActivityIndicator";
import appStyles from '../../../src/AppStyles'
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";
class WelcomePage extends Component {

    constructor(props) {
        super(props)
        this.state = {

            password: '',
            mobile: '',
            visibility: false,
            dialcode: '',
            loading: false,

            mobileError: '',
            passwordError: '',
            screenName: 'Login',
            signupiduser: '',

            otpcode:'',

        }
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()

            });
    }

    componentDidMount() {
        this.setState({ screenName: 'Login'})
        this.checkPermission()

    }

    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }
    getToken = async () => {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        console.log("fcm token===================", fcmToken)
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                console.log("fcm token============================", fcmToken)
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }
    }

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }


    onChangeTextlogin = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
        console.log("=======================", unmaskedPhoneNumber)
        this.setState({ mobile: unmaskedPhoneNumber, dialcode: dialCode })
    };
    checkVisibility = () => {
        this.setState({ visibility: !this.state.visibility })
    }
    /**
       * For user Login 
       */
    loginfun = async () => {
        let userId = await AsyncStorage.getItem('userId')
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        console.log("login fcm================", fcmToken)
        const { mobile, password, dialcode, loading } = this.state
        if (mobile != '' && password != '' && fcmToken !== null) {
            this.setState({ loading: true })

            if (mobile.length < 10 || mobile.length > 10) {
                this.setState({ loading: false })
                Toast.show('Please enter a valid phone number.', Toast.LONG);

            }
            else {

                let body = JSON.stringify({
                    mobile: dialcode + mobile,
                    password: password,
                    fcmToken: fcmToken
                })

                console.log("body=================", body)
                const data = await signin(body);
                console.log("sigin response", data)
                if (data.success == false) {
                    this.setState({ loading: false })
                    Toast.show(data.message, Toast.LONG);
                } else {
                    this.setState({ loading: false, mobile: '', password: '', dialcode: '', mobileError: '', passwordError: '' })
                    EventRegister.emit('USerLoginId', data.userId)

                    AsyncStorage.setItem('TOKEN', data.token)
                    AsyncStorage.setItem("LoginData", JSON.stringify(data))
                    AsyncStorage.setItem("userId", data.userId)
                    AsyncStorage.setItem("UserMobile", dialcode + mobile)
                    AsyncStorage.setItem('reqToken', data.reqToken)
                    this.getAddressid()
                    this.getCurrentProfileDetails()
                    this.addtobagLocalProducts()

                }
            }

        } else {
            this.setState({ loading: false })
            if (mobile == '') this.setState({ mobileError: 'Please Enter Mobile No. ' })
            if (password == '') this.setState({ passwordError: 'Please Enter Password' })
            if (fcmToken == null) this.setState({ passwordError: 'Somthing Went Wrong' })

        }

    }

    /**
     * Get Address id 
     * For get Orders
     */
    getAddressid = async () => {
        let userid = await AsyncStorage.getItem('userId')
        // get address via user
        const data = await getAddressviaUSer(userid);
        if (data.data) {
            let dataAddress = data.data.address.filter(item => item.isDefault == true)
            AsyncStorage.setItem("CustomerAddress", JSON.stringify(dataAddress[0]))
            AsyncStorage.setItem("AddressId", data.data._id)
        }
    }

    getCurrentProfileDetails = async () => {

        let loginData = await AsyncStorage.getItem('LoginData')
        let details = JSON.parse(loginData)
        let body = JSON.stringify({
            id: details.userId,
            reqToken: details.reqToken,
        })
        const data = await getProfileDetails(body);

        if (data.success) {

            let user = data.data
            AsyncStorage.setItem("CurrentUser", JSON.stringify(data))
            let profile = await AsyncStorage.getItem('CurrentUser')
        }
    }

    addtobagLocalProducts = async () => {

        // props.navigation.navigate('MainStack', { user: userid });
        let userid = await AsyncStorage.getItem('userId')
        let localdata = await AsyncStorage.getItem('Ofline_Products')
        if (localdata !== null) {
            let localdataParsed = JSON.parse(localdata)
            let localIDs = []
            localdataParsed.filter(data => {
                localIDs.push(data.productid)
            })
            console.log("local ids=============", localIDs)
            let body = JSON.stringify({
                productIds: localIDs
            })
            const response = await removeitemforlocalProducts(body)
            console.log("Response for local products", response)
            if (response.statusCode == 200) {
                localdataParsed.map((item) => {
                    addToBagProduct(item.item, false, item.selecteditemcolor, item.selecteditemSize, item.qty, item.selectedshopID)
                })
                // this.props.navigation.navigate('Drawer', { user: userid });
                this.props.navigation.goBack()
            } else {
                // this.props.navigation.navigate('Drawer', { user: userid });
                this.props.navigation.goBack()
            }
        } else {
            console.log("call main stack ", userid)
            // this.props.navigation.navigate('Drawer', { user: userid });
            this.props.navigation.goBack()
        }
    }

    onPressSend = async () => {
        const { mobileError, mobile, dialcode } = this.state
        if (mobile !== '') {
           this.setState({ loading : true })
            let body = JSON.stringify({ mobile: dialcode + mobile })

            const data = await signup(body);

            console.log("signup======================", data)

            if (data.success) {
            
                this.setState({ loading : false })

                AsyncStorage.setItem("userSignupData", JSON.stringify(data))
                this.setState({ signupiduser: data.data._id , screenName: 'OtpInput'})
                AsyncStorage.setItem("useridSignup", data.data._id)
            } else {

                Toast.show(data.message, Toast.LONG);
                this.setState({ mobileError: data.message, loading: false})


            }
        } else {
            this.setState({ mobileError: 'Please Enter Mobile No.' })
        }
    }
    onFinishCheckingCode = async(newcode) => {
        const { signupiduser } = this.state
        if(newcode !== '') {
            this.setState({ loading: true })
            let body = JSON.stringify({ id: signupiduser, otp: newcode })
            const data = await verifyOTP(body);
        
            console.log("Verify otp", data)
            AsyncStorage.setItem('reqToken', data.data.reqToken)
            if (data.success) {
                this.setState({ loading: false, })
              this.props.navigation.navigate('AddProfileScreen');
            } else {
                this.setState({ loading: false ,  })
              Toast.show(data.message, Toast.LONG);
            }
        }else{
            this.setState({ loading: false , })
            Toast.show("Somthing went wrong", Toast.LONG);
        }
    }
    render() {
        const {loading,  password, visibility, mobileError, passwordError, screenName } = this.state

        if (screenName == 'Login') {
            return (
                <View style={styless.container}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={{ marginTop: 10, marginLeft: 10 }}>
                        <Icon name={'arrow-back'} color={'#000'} size={35} />
                    </TouchableOpacity>
                    <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styless.mainTitle}>Sign In</Text>
                    </View>

                    <View style={[styless.InputContainer, { marginBottom: 10 }]}>
                        <IntlPhoneInput onChangeText={this.onChangeTextlogin} defaultCountry="IN" />
                    </View>

                    {
                        mobileError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{mobileError}</Text>
                            </View>
                            : null
                    }
                    <View style={[styless.InputContainer, { flexDirection: 'row' }]}>
                        <TextInput
                            style={{ flex: 8 }}
                            secureTextEntry={visibility ? false : true}
                            autoCapitalize='none'
                            placeholder="Enter password"
                            placeholderTextColor='#aaaaaa'
                            onChangeText={(text) => this.setState({ password: text })}
                        />

                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={() => this.checkVisibility()}>
                            {
                                visibility ?
                                    <Icon name={'visibility'} size={20} color={'#000'} />
                                    :
                                    <Icon name={'visibility-off'} size={20} color={'#000'} />
                            }
                        </TouchableOpacity>
                    </View>
                    {
                        passwordError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{passwordError}</Text>
                            </View>
                            : null
                    }
                    <TouchableOpacity style={styless.forgotview} onPress={() => this.props.navigation.navigate('ForgotPasswordScreen')}>
                        <Text style={styless.forgottext}>Forgot Password ?</Text>
                    </TouchableOpacity>
                    <Button
                        containerStyle={styless.sendContainer}
                        style={styless.sendText}
                        onPress={() => this.loginfun()}>
                        {IMLocalized('Log in')}
                    </Button>
                    {loading && <TNActivityIndicator appStyles={appStyles} />}
                    <TouchableOpacity style={styless.signupdata} onPress={() => this.setState({ screenName: 'Signup' })}>
                        <Text style={styless.signupheretxt}>New here? Create your account</Text>
                    </TouchableOpacity>
                </View>
            )
        } else if (screenName == 'Signup') {
            return (
                <View style={styless.container}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={{ marginTop: 10, marginLeft: 10 }}>
                        <Icon name={'arrow-back'} color={'#000'} size={35} />
                    </TouchableOpacity>
                    <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styless.mainTitle}>Create new account</Text>
                    </View>

                    <View style={[styless.InputContainer, { marginBottom: 10 }]}>
                        <IntlPhoneInput onChangeText={this.onChangeTextlogin} defaultCountry="IN" />
                    </View>

                    {
                        mobileError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{mobileError}</Text>
                            </View>
                            : null
                    }

                    <Button
                        containerStyle={styless.sendContainer}
                        style={styless.sendText}
                        onPress={() => this.onPressSend()}>
                        {IMLocalized('Sign up')}
                    </Button>
                    <TouchableOpacity style={styless.signupdata}>
                        <Text style={styless.signupheretxt}>By creating an account you agree with our</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.tribataholidays.co.in/terms.html')}>
                            <Text style={[styless.signupheretxt, { color: 'blue' }]}>Terms of Use</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                    {loading && <TNActivityIndicator appStyles={appStyles} />}
                </View>
            )
        } else if (screenName == 'OtpInput') {
            return (
                <View style={styless.container}>
                     <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center', marginBottom:15 }}>
                        <Text style={styless.mainTitle}>Enter Otp </Text>
                    </View>

                    <OTP otp="9999" code={(code) => this.setState({ otpcode : code })} status={(a) => { a == '200' ? this.onFinishCheckingCode(this.state.otpcode) : null }} />
                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => this.onFinishCheckingCode(this.state.otpcode)}>
                        <Text>Verify</Text>
                    </TouchableOpacity>
                    {loading && <TNActivityIndicator appStyles={appStyles} />}
                </View>
            )
        }
    }


}


export default WelcomePage

const styless = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainTitle: {
        fontWeight: 'bold',
        fontSize: 28,
        color: '#808080'
    },
    InputContainer: {
        height: 60,
        borderWidth: 1,
        borderColor: '#a3a3a3',
        paddingLeft: 3,
        color: '#000',
        width: '95%',
        // alignSelf: 'center',
        marginTop: 20,
        // alignItems: 'center',
        borderRadius: 5,
        marginLeft: 10,
        marginRight: 10
    },
    forgotview: {
        position: 'relative',
        right: 20,
        alignSelf: 'flex-end',
        marginTop: 20
    },
    forgottext: {
        color: 'blue',
        fontSize: 15
    },
    sendContainer: {
        width: '70%',
        backgroundColor: '#A9A9A9',
        borderRadius: 25,
        padding: 10,
        marginTop: 30,
        alignSelf: 'center',
    },
    sendText: {
        color: '#ffffff',
    },
    signupdata: {
        marginTop: 10
    },
    signupheretxt: {
        color: '#000',
        textAlign: 'center'
    }

})