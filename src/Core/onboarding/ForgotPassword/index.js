import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert, BackHandler, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import forgotpassword from '../../../services/ForgotPassword';
import OTP from '../SmsAuthenticationScreen/otpInput'
import verifyOTP from '../../../services/OTPVerification';
import IntlPhoneInput from 'react-native-intl-phone-input';


function ForgotPasswordScreen({ navigation }) {

    const [mobile, setMobile] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [isshowOtpScreen, setisshowOtpScreen] = useState(false)
    const [otpCode, setOtpCode] = useState('')
    const [userid, setuserid] = useState('')
    const phoneRef = useRef(null);
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [countriesPickerData, setCountriesPickerData] = useState(null);
    const [dialcode, setdialcode] = useState('')

    const [mobileError, setmobileError] = useState('')
    useEffect(() => {
        if (phoneRef && phoneRef.current) {
            setCountriesPickerData(phoneRef.current.getPickerData());
        }
        const backAction = () => {
            navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [phoneRef]);

    const submit = async () => {
        if (mobile != '') {
            if (mobile.length > 10 || mobile.length < 10) {
                // Toast.show('Please Enter Valid number', Toast.LONG);
                setmobileError("Please Enter Valid No.")
            } else {
                setisLoading(true)

                let body = JSON.stringify({
                    mobile: dialcode + mobile,
                    role: 'Customer'
                })
              
                const data = await forgotpassword(body)
              
                if (data.success) {
                    setisLoading(false)
                    setuserid(data.data.userId)
                    
                    setisshowOtpScreen(true)
                } else {
                    setisLoading(false)
                    // Toast.show(data.message, Toast.LONG);
                    setmobileError(data.message)
                }

            }
        } else {
            // Toast.show( "Please add number ", Toast.LONG);
            setmobileError("Please Enter Mobile No.")

        }
    }
    const onFinishCheckingCode = async (code) => {
        if (code != '') {
            setisLoading(true)
            
            let body = JSON.stringify({ id: userid, otp: code })
           
            const data = await verifyOTP(body);
           
            if (data.success) {
                setisLoading(false)
               
                AsyncStorage.setItem("ResetreqToken", data.data.reqToken)
                AsyncStorage.setItem("ResetUserid", data.data.userId)
                navigation.navigate('ResetPasswordScreen');
            }
        } else {
            Alert.alert(
                '',
                "Please add Otp ",
                [{ text: 'OK' }],
                {
                    cancelable: false,
                },
            );
        }
    }

    const onChangeText = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
        setMobile(unmaskedPhoneNumber)
        setdialcode(dialCode)
    };
  
    return (
        <SafeAreaView style={styles.container}>

            {/* Status Bar Color */}
            <StatusBar barStyle="dark-content" />
            {
                !isshowOtpScreen ?
                    <ScrollView style={styles.mainView}>
                        <View style={styles.formView}>
                            {/* Name. */}
                            <View style={styles.InputContainer}>

                                <IntlPhoneInput onChangeText={onChangeText} defaultCountry="IN" />
                            </View>
                            {
                                mobileError !== '' ?
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: 'red', textAlign: 'center' }}>{mobileError}</Text>
                                    </View>
                                    : null
                            }

                            {/* Submit Button */}
                            <TouchableOpacity disabled={isLoading} onPress={() => submit()} style={styles.buttonView}>
                                {!isLoading ?
                                    <Text style={styles.buttonText}>Submit</Text>
                                    :
                                    <ActivityIndicator color={'#fff'} size="large" />
                                }
                            </TouchableOpacity>

                        </View>
                    </ScrollView>

                    :
                    <>
                        <OTP otp="9999" code={(code) => setOtpCode(code)} status={(a) => { a == '200' ? this.props.navigation.navigate('App') : null }} />
                        <TouchableOpacity style={[styles.buttonView, { marginLeft: 35, marginRight: 35 }]} onPress={() => onFinishCheckingCode(otpCode)}>
                            {!isLoading ?
                                <Text style={styles.buttonText}>Verify</Text>
                                :
                                <ActivityIndicator color={'#fff'} size="large" />
                            }
                        </TouchableOpacity>
                    </>
            }
        </SafeAreaView>
    );

}
export default ForgotPasswordScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainView: {
        flex: 1,
    },
    formView: {
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
    },
    textInputView: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        paddingHorizontal: 20,
        paddingVertical: 7,
        marginVertical: 12
    },
    textInput: {
        padding: 0,
        fontSize: 17
    },
    buttonView: {
        backgroundColor: '#535454',
        paddingVertical: 10,
        borderRadius: 10,
        marginVertical: 25
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,

    },
    inputView: {
        marginVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
    },
    error: {
        color: 'red',
        fontWeight: 'bold'
    },
    InputContainer: {
        height: 60,
        borderWidth: 1,
        borderColor: '#a3a3a3',
        paddingLeft: 3,
        color: '#000',
        width: '100%',
        // alignSelf: 'center',
        marginTop: 20,
        // alignItems: 'center',
        borderRadius: 5,
    },
});