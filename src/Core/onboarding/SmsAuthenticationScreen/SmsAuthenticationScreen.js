import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,

} from 'react-native';
import Button from 'react-native-button';
import PhoneInput from 'react-native-phone-input';
import { useColorScheme } from 'react-native-appearance';
import TNActivityIndicator from '../../truly-native/TNActivityIndicator';
import CountriesModalPicker from '../../truly-native/CountriesModalPicker/CountriesModalPicker';
import { IMLocalized } from '../../localization/IMLocalization';
import { setUserData } from '../redux/auth';
import { connect } from 'react-redux';
import TermsOfUseView from '../components/TermsOfUseView';
import dynamicStyles from './styles';
import signup from '../../../services/SignUp';
import verifyOTP from '../../../services/OTPVerification';
import OTP from '../../onboarding/SmsAuthenticationScreen/otpInput'
import signin from '../../../services/SignIn';
import getProfileDetails from '../../../services/Profile/getProfile';
import deviceStorage from '../../../utils/deviceStorage';
import Icon from 'react-native-vector-icons/MaterialIcons'
import getAddressviaUSer from '../../../services/SavedAddress/getAddressviaUser';
import Toast from 'react-native-simple-toast';
import firebase from 'react-native-firebase';

import IntlPhoneInput from 'react-native-intl-phone-input';
import AsyncStorage from '@react-native-community/async-storage';

function SmsAuthenticationScreen(props) {

  const appConfig =
    props.navigation.state.params.appConfig ||
    props.navigation.getParam('appConfig');
  const appStyles =
    props.navigation.state.params.appStyles ||
    props.navigation.getParam('appStyles');

  const colorScheme = useColorScheme();
  const styles = dynamicStyles(appStyles, colorScheme);

  const [loading, setLoading] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(false);
  const [countriesPickerData, setCountriesPickerData] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const myCodeInput = useRef(null);
  const phoneRef = useRef(null);
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [visibility, setvisibility] = useState(false)
  const [useridsignup, setuseridsignup] = useState('')

  const [mobileError, setmobileError] = useState('')
  const [passwordError, setpasswordError] = useState('')

  const { isSigningUp } = props.navigation.state.params;
  const [otpcode, setOtpCode] = useState('')
  const [dialcode, setdialcode] = useState('')
  useEffect(() => {
    if (phoneRef && phoneRef.current) {
      setCountriesPickerData(phoneRef.current.getPickerData());
    }
    checkPermission()
  }, [phoneRef]);

  const checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  }


  const getToken = async () => {
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

  const requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }
  /**
   * For show & hide Password
   */
  const checkVisibility = () => {
    setvisibility(!visibility)
  }

  /**
   * 
   * @param {number} userValidPhoneNumber user phone no
   * for Sign up user
   */
  const signInWithPhoneNumber = async () => {


    if (mobile !== '') {
      setLoading(true);
      let body = JSON.stringify({ mobile: dialcode + mobile })


      const data = await signup(body);

      console.log("signup======================", data)

      if (data.success) {
        props.setUserData({
          user: data.data,
        });
        setLoading(false)
        setIsPhoneVisible(false);
        setVerificationId(data._id);
        AsyncStorage.setItem("userSignupData", JSON.stringify(data))
        setuseridsignup(data.data._id)
        AsyncStorage.setItem("useridSignup", data.data._id)
      } else {
        setLoading(false);
        Toast.show(data.message, Toast.LONG);
        setmobileError(data.message)

      }
    } else {
      setmobileError("Please Enter Mobile No.")
    }
  };

  /**
   * 
   * @param {number} smsCode otp code
   * For Otp verification
   */
  const signUpWithPhoneNumber = async (smsCode) => {

    // props.navigation.navigate('AddProfileScreen');
    let body = JSON.stringify({ id: useridsignup, otp: smsCode })
    const data = await verifyOTP(body);

    console.log("Verify otp", data)
    AsyncStorage.setItem('reqToken', data.data.reqToken)
    if (data.success) {
      setLoading(false);
      props.navigation.navigate('AddProfileScreen');
    } else {
      setLoading(false);
      Toast.show(data.message, Toast.LONG);
    }
  };

  const onPressSend = () => {


    if (!isSigningUp) {
    } else {
      // Sign up user
      signInWithPhoneNumber();
    }

  };



  /**
   * 
   * @param {number} newCode otp code
   * for otp verification check
   */
  const onFinishCheckingCode = async (newCode) => {

    setLoading(true);
    if (isSigningUp) {
      signUpWithPhoneNumber(newCode);
    } else {
    }
  };
  const onChangeText = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    setMobile(unmaskedPhoneNumber)
    setdialcode(dialCode)
  };

  const phoneInputRender = () => {
    return (
      <>
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

        <Button
          containerStyle={styles.sendContainer}
          style={styles.sendText}
          onPress={() => onPressSend()}>
          {IMLocalized('Send code')}
        </Button>
      </>
    );
  };

  /**
   * otp box open 
   */
  const codeInputRender = () => {

    return (
      <>
        <OTP otp="9999" code={(code) => setOtpCode(code)} status={(a) => { a == '200' ? onFinishCheckingCode(otpcode) : null }} />
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => onFinishCheckingCode(otpcode)}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    );
  };



  const renderAsSignUpState = () => {
    return (
      <>
        <Text style={styles.title}>{IMLocalized('Create new account')}</Text>
        {isPhoneVisible ? phoneInputRender() : codeInputRender()}

      </>
    );
  };

  /**
   * For user Login 
   */
  const loginfun = async () => {
    let userId = await AsyncStorage.getItem('userId')
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log("login fcm================", fcmToken)
    // let mobileNo = phoneRef.current.getValue()
    if (mobile != '' && password != '' && fcmToken !== null) {
      setLoading(true)

      if (mobile.length < 10 || mobile.length > 10) {
        setLoading(false)

        Toast.show('Please enter a valid phone number.', Toast.LONG);

      }
      else {

        let body = JSON.stringify({
          mobile: dialcode + mobile,
          password: password,
          fcmToken:fcmToken
        })
        const data = await signin(body);
        console.log("sigin response", data)
        AsyncStorage.setItem("LoginData", JSON.stringify(data))
        AsyncStorage.setItem("userId", data.userId)
        AsyncStorage.setItem("UserMobile", dialcode + mobile)
        if (data.success == false) {
          setLoading(false)

          Toast.show(data.message, Toast.LONG);

        } else {
          setLoading(false)
          getCurrentProfileDetails()
          getAddressid()
          props.navigation.navigate('MainStack', { user: data.userId });
        }
      }

    } else {
      setLoading(false)

      // Toast.show('Please enter a details.', Toast.LONG);

      if (mobile == '') setmobileError('Please Enter Mobile No.')
      if (password == '') setpasswordError('Please Enter Password')
      if (fcmToken == null) setpasswordError('Somthing Went Wrong')

    }

  }

  /**
   * Get Address id 
   * For get Orders
   */
  const getAddressid = async () => {
    let userid = await AsyncStorage.getItem('userId')

    // get address via user
    const data = await getAddressviaUSer(userid);

    if (data.data) {
      let dataAddress = data.data.address.filter(item => item.isDefault == true)
      AsyncStorage.setItem("CustomerAddress", JSON.stringify(dataAddress[0]))
      AsyncStorage.setItem("AddressId", data.data._id)
    }
  }
  /**
   * Get Profile Details
   */
  const getCurrentProfileDetails = async () => {

    let loginData = await AsyncStorage.getItem('LoginData')
    let details = JSON.parse(loginData)
    let body = JSON.stringify({
      id: details.userId,
      reqToken: details.reqToken,
    })
    const data = await getProfileDetails(body);

    if (data.success) {

      let user = data.data
      props.setUserData({
        user: user,
        stripeCustomer: ''
      });
      deviceStorage.setUserData(data.data)
      AsyncStorage.setItem("CurrentUser", JSON.stringify(data))
      let profile = await AsyncStorage.getItem('CurrentUser')
    }
  }
  const onChangeTextlogin = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    setMobile(unmaskedPhoneNumber)
    setdialcode(dialCode)
  };
  /**
   * For Display Login Screen
   */
  const renderAsLoginState = () => {

    return (
      <>
        <Text style={styles.title}>{IMLocalized('Sign In')}</Text>
        <View style={styles.InputContainer}>

          <IntlPhoneInput onChangeText={onChangeTextlogin} defaultCountry="IN" />
        </View>
        {
          mobileError !== '' ?
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>{mobileError}</Text>
            </View>
            : null
        }
        <View style={[styles.InputContainer, { flexDirection: 'row' }]}>
          <TextInput
            style={{ flex: 8 }}
            secureTextEntry={visibility ? false : true}
            autoCapitalize='none'
            placeholder="Enter password"
            placeholderTextColor='#aaaaaa'
            onChangeText={(text) => setPassword(text)}
          />

          <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={() => checkVisibility()}>
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
        <TouchableOpacity style={styles.forgotview} onPress={() => props.navigation.navigate('ForgotPasswordScreen')}>
          <Text style={styles.forgottext}>Forgot Password ?</Text>
        </TouchableOpacity>
        <Button
          containerStyle={styles.sendContainer}
          style={styles.sendText}
          onPress={() => loginfun()}>
          {IMLocalized('Log in')}
        </Button>
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => props.navigation.goBack()}>
        <Image
          style={appStyles.styleSet.backArrowStyle}
          source={appStyles.iconSet.backArrow}
        />
      </TouchableOpacity>
      {isSigningUp ? renderAsSignUpState() : renderAsLoginState()}
      {isSigningUp && (
        <TermsOfUseView tosLink={'https://www.tribataholidays.co.in/terms.html'} style={styles.tos} />
      )}
      {loading && <TNActivityIndicator appStyles={appStyles} />}
    </View>
  );
};


export default connect(null, {
  setUserData,
})(SmsAuthenticationScreen);
