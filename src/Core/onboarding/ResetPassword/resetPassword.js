import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Keyboard, Picker, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import resetPassword from '../../../services/ResetPassword';

function ResetPasswordScreen({ route, navigation }) {


    const [password, setpassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setisLoading] = useState(false)
   



    const submit = async () => {

        let id = await AsyncStorage.getItem('ResetUserid')
        let token = await AsyncStorage.getItem('ResetreqToken')

        
        if (password != '' && confirmPassword != '') {
            setisLoading(true)
            let body = JSON.stringify({
                id: id,
                password: password,
                reqToken: token
            })
            const data = await resetPassword(body)
          
            if (data.success) {
                setisLoading(false)
               
                navigation.popToTop('AuthStackNavigator')

            }

        } else if (password != confirmPassword) {
            Alert.alert(
                '',
                "Password and Confirm PAssword does not match",
                [{ text: 'OK' }],
                {
                    cancelable: false,
                },
            );
        } else {
            Alert.alert(
                '',
                "Please fill up",
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

            <ScrollView style={styles.mainView}>
                <View style={styles.formView}>
                    {/* Name. */}
                    <View style={styles.textInputView}>
                        <TextInput
                            style={styles.textInput}
                            keyboardType='default'
                            secureTextEntry
                            placeholder="Enter Your New Password"
                            onChangeText={(password) => setpassword(password)} />
                    </View>
                    <View style={styles.textInputView}>
                        <TextInput
                            style={styles.textInput}
                            keyboardType='default'
                            secureTextEntry
                            placeholder="Enter Your Confirm Password"
                            onChangeText={(password) => setConfirmPassword(password)} />
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
        </SafeAreaView>
    );

}
export default ResetPasswordScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    textView: {
        marginTop: 40,
    },
    titleText: {
        textAlign: 'left',
        fontSize: 22,
        color: '#212A37',
    },
    mainView: {
        flex: 1,

    },
    formView: {
        marginLeft: 10,
        marginRight: 10
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
    rowView: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    simpleText: {
        textAlign: 'center',
        fontSize: 15
    },
    labelView: {
        marginHorizontal: 10,
        marginVertical: 10,
    },
    labelText: {
        fontSize: 18,
        color: '#212A37',
    },
    inputView: {
        marginVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
    },
    pickerStyle: {
        color: '#e7e7e7',
        justifyContent: 'center',
        height: 44,
    },
    error: {
        color: 'red',
        fontWeight: 'bold'
    }
});