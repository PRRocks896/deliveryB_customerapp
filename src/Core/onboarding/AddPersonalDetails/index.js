import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Keyboard, Picker, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import addProfile from '../../../services/Profile';
import createWallet from '../../../services/Wallet/createWallet';
import api from '../../../services/url.service';

const AddProfileScreen = props => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setpassword] = useState('')
    const [isLoading, setisLoading] = useState(false)

    const [nameError, setnameError] = useState('')
    const [emailError, setemailError] = useState('')
    const [passwordError, setpasswordError] = useState('')
    const [apiError, setApiError] = useState('')

    
    const submit = async () => {
        let userId = await AsyncStorage.getItem('useridSignup')
        let phoneno = await AsyncStorage.getItem('userSignupData')
        let parsedphonNo = JSON.parse(phoneno)
       
        if (name != '' && email != '', password != '') {
            if(password.length < 6){
                setpasswordError("Enter password minimum 6 character")
            }else{
                setisLoading(true)
                
                let body = JSON.stringify({
                    id: userId,
                    username: name,
                    email: email,
                    role: 'Customer',
                    password: password,
                    deliverytype: "0"
                })
                const data = await addProfile(body);
                AsyncStorage.setItem('username', name);
                AsyncStorage.setItem('email', email);
                setisLoading(false)
                if (data.statusCode == 200) {
                    let body = JSON.stringify({
                        user_mobile:parsedphonNo.data.mobile,
                        name:name
                    })
                    const datawallet = await createWallet(body)
                   
                    if(datawallet.statusCode == 200){
                        setisLoading(false)
                        props.navigation.popToTop('AuthStackNavigator')
                    }else{
                       
                        setisLoading(false)
                        setApiError(datawallet.message)
                    }
                } else {
                   
                    setisLoading(false)
                    setApiError(data.message)
                }
                setisLoading(false)
            }

        } else {
            setisLoading(false)
            if (name == '') {
                setnameError('Please Enter Name')
            }
            else {
                setnameError('')
            }
            if (email == '') {
                setemailError('Please Enter Email')
            }
            else {
                setemailError('')
            }
            if (password == '') {
                setpasswordError("Please Enter Password")
            }
            else {
                setpasswordError('')
            }

        }

        // this.props.navigation.navigate('PersonalDocument')
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
                            placeholder="Enter Your Name"
                            onChangeText={(Name) => setName(Name)} />
                    </View>
                    {
                        nameError != '' ?
                            <View>
                                <Text style={styles.error}>{nameError}</Text>
                            </View>
                            : null
                    }
                    {/* Email */}
                    <View style={styles.textInputView}>
                        <TextInput
                            autoCapitalize='none'
                            style={styles.textInput}
                            keyboardType='email-address'
                            placeholder="Enter Email Address"
                            // onEndEditing={() => onChangeEmail()}
                            onChangeText={(email) => setEmail(email.toLowerCase())}
                        />
                    </View>
                    {
                        emailError != '' ?
                            <View>
                                <Text style={styles.error}>{emailError}</Text>
                            </View>
                            : null
                    }

                    {/* Password */}
                    <View style={styles.textInputView}>
                        <TextInput
                            autoCapitalize='none'
                            secureTextEntry
                            style={styles.textInput}
                            placeholder="Enter Password"
                            onChangeText={(password) => setpassword(password)}
                        />
                    </View>
                    {
                        passwordError != '' ?
                            <View>
                                <Text style={styles.error}>{passwordError}</Text>
                            </View>
                            : null
                    }


                    {/* Submit Button */}
                    <TouchableOpacity>
                        {!isLoading ?
                            <TouchableOpacity disabled={isLoading} onPress={() => submit()} style={styles.buttonView}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            :
                            <ActivityIndicator color={'#000'} size="large" />
                        }
                    </TouchableOpacity>
                    {
                        apiError != '' ?
                            <View>
                                <Text style={styles.error}>{apiError}</Text>
                            </View>
                            : null
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}
export default AddProfileScreen

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