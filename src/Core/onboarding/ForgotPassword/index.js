import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Keyboard, Picker, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import addProfile from '../../../services/Profile';
import forgotpassword from '../../../services/ForgotPassword';
import OTP from '../SmsAuthenticationScreen/otpInput'
import verifyOTP from '../../../services/OTPVerification';
import { EventRegister } from 'react-native-event-listeners'

function ForgotPasswordScreen({ navigation }) {

    const [mobile, setMobile] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [isshowOtpScreen, setisshowOtpScreen] = useState(false)
    const [otpCode, setOtpCode] = useState('')
    const [userid, setuserid] = useState('')

    const submit = async () => {
        setisLoading(true)
        if (mobile != '') {
            let body = JSON.stringify({
                mobile: `+91${mobile}`
            })
            const data = await forgotpassword(body)
            console.log('forgot password screen res', data)
            if (data.success) {
                setisLoading(false)
                setuserid(data.data.userId)
                console.log("data.data.userId", data.data.userId)
                setisshowOtpScreen(true)
            }
        } else {
            Alert.alert(
                '',
                "Please add number ",
                [{ text: 'OK' }],
                {
                    cancelable: false,
                },
            );
        }
    }
    const onFinishCheckingCode = async (code) => {
        if (code != '') {
            setisLoading(true)
            console.log("userid", userid)
            let body = JSON.stringify({ id: userid, otp: code })
            console.log("body in screen", body)
            const data = await verifyOTP(body);
            console.log("verify otp screen res", data)
            if (data.success) {
                setisLoading(false)
                console.log(data.data.reqToken, data.data.userId)
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

    return (
        <SafeAreaView style={styles.container}>

            {/* Status Bar Color */}
            <StatusBar barStyle="dark-content" />
            {
                !isshowOtpScreen ?
                    <ScrollView style={styles.mainView}>
                        <View style={styles.formView}>
                            {/* Name. */}
                            <View style={styles.textInputView}>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType='number-pad'
                                    maxLength={10}
                                    placeholder="Enter Your Number"
                                    onChangeText={(number) => setMobile(number)} />
                            </View>

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
    }
});