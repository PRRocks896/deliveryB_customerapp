import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  AsyncStorage,
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
function SmsAuthenticationScreen(props) {
  // console.log("props,", props.navigation.state.params.isSigningUp, props)
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

  const { isSigningUp } = props.navigation.state.params;
  const [otpcode, setOtpCode] = useState('')

  useEffect(() => {
    if (phoneRef && phoneRef.current) {
      setCountriesPickerData(phoneRef.current.getPickerData());
    }
  }, [phoneRef]);


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
  const signInWithPhoneNumber = async (userValidPhoneNumber) => {
    console.log("For Sign up", userValidPhoneNumber)
    setLoading(true);
    let body = JSON.stringify({ mobile: userValidPhoneNumber })
    const data = await signup(body);
    // console.log("Data in smsAuth screen", data)
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
      Alert.alert(
        '',
        data.message,
        [{ text: IMLocalized('OK') }],
        { cancelable: false },
      );
    }
  };

  /**
   * 
   * @param {number} smsCode otp code
   * For Otp verification
   */
  const signUpWithPhoneNumber = async (smsCode) => {
    console.log("Call else for otp verification", useridsignup, smsCode)
    // props.navigation.navigate('AddProfileScreen');
    let body = JSON.stringify({ id: useridsignup, otp: smsCode })
    const data = await verifyOTP(body);
    console.log("Data in verify  screen", data)

    AsyncStorage.setItem('reqToken', data.data.reqToken)
    if (data.success) {
      setLoading(false);
      props.navigation.navigate('AddProfileScreen');
    } else {
      setLoading(false);
      Alert.alert(
        '',
        data.message,
        [{ text: IMLocalized('OK') }],
        { cancelable: false },
      );
    }
  };

  const onPressSend = () => {

    if (phoneRef.current.isValidNumber()) {
      const userValidPhoneNumber = phoneRef.current.getValue();
      setLoading(true);
      setPhoneNumber(userValidPhoneNumber);
      console.log("in onPressSend", isSigningUp, userValidPhoneNumber)
      if (!isSigningUp) {
      } else {
        // Sign up user
        signInWithPhoneNumber(userValidPhoneNumber);
      }
    } else {
      Alert.alert(
        '',
        IMLocalized('Please enter a valid phone number.'),
        [{ text: IMLocalized('OK') }],
        {
          cancelable: false,
        },
      );
    }
  };

  const onPressFlag = () => {
    setCountryModalVisible(true);
  };

  const onPressCancelContryModalPicker = () => {
    setCountryModalVisible(false);
  };

  /**
   * 
   * @param {number} newCode otp code
   * for otp verification check
   */
  const onFinishCheckingCode = async (newCode) => {
    console.log("newCode", newCode, isSigningUp)
    setLoading(true);
    if (isSigningUp) {
      signUpWithPhoneNumber(newCode);
    } else {
    }
  };

  const phoneInputRender = () => {
    return (
      <>
        <PhoneInput
          style={styles.InputContainer}
          flagStyle={styles.flagStyle}
          textStyle={styles.phoneInputTextStyle}
          ref={phoneRef}
          initialCountry='in'
          onPressFlag={onPressFlag}
          offset={10}
          allowZeroAfterCountryCode
          textProps={{
            placeholder: IMLocalized('Phone number'),
            placeholderTextColor: '#aaaaaa',
          }}
        />
        {countriesPickerData && (
          <CountriesModalPicker
            data={countriesPickerData}
            appStyles={appStyles}
            onChange={country => {
              selectCountry(country);
            }}
            cancelText={IMLocalized('Cancel')}
            visible={countryModalVisible}
            onCancel={onPressCancelContryModalPicker}
          />
        )}
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
    console.log("for otp scrren ")
    return (
      <>
        <OTP otp="9999" code={(code) => setOtpCode(code)} status={(a) => { a == '200' ? onFinishCheckingCode(otpcode) : null }} />
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => onFinishCheckingCode(otpcode)}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    );
  };

  const selectCountry = country => {
    phoneRef.current.selectCountry(country.iso2);
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
    setLoading(true)
    let userId = await AsyncStorage.getItem('userId')
    let mobileNo = phoneRef.current.getValue()
    if (mobileNo != '' && password != '') {
      console.log("login------------------------",mobileNo.length)
      if(mobileNo.length < 13 || mobileNo.length > 13){
        setLoading(false)
        console.log("mobile in validation",mobile)
        Alert.alert(
          '',
          IMLocalized('Please enter a valid phone number.'),
          [{ text: IMLocalized('OK') }],
          {
            cancelable: false,
          },
        );
      }else{

        let body = JSON.stringify({
          mobile: mobileNo,
          password: password,
        })
        const data = await signin(body);
        console.log("data in sign in ", data)
        AsyncStorage.setItem("LoginData", JSON.stringify(data))
        AsyncStorage.setItem("userId", data.userId)
        if (data.success == false) {
          setLoading(false)
          console.log(data.message)
          Alert.alert(
            '',
            data.message,
            [{ text: IMLocalized('OK') }],
            {
              cancelable: false,
            },
          );
        } else {
          setLoading(false)
          getCurrentProfileDetails()
          getAddressid()
          props.navigation.navigate('MainStack', { user: data.userId });
        }
      }

    } else {
      setLoading(false)
      Alert.alert(
        '',
        IMLocalized('Please enter a details.'),
        [{ text: IMLocalized('OK') }],
        {
          cancelable: false,
        },
      );
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
      console.log("address id ", data.data._id)
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
    console.log("user data", data)
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

  /**
   * For Display Login Screen
   */
  const renderAsLoginState = () => {

    return (
      <>
        <Text style={styles.title}>{IMLocalized('Sign In')}</Text>
        <PhoneInput
          style={styles.InputContainer}
          flagStyle={styles.flagStyle}
          textStyle={styles.phoneInputTextStyle}
          ref={phoneRef}
          onPressFlag={onPressFlag}
          offset={10}
          initialCountry='in'
          allowZeroAfterCountryCode
          textProps={{
            placeholder: IMLocalized('Phone number'),
            placeholderTextColor: '#aaaaaa',
          }}
        />
        {countriesPickerData && (
          <CountriesModalPicker
            data={countriesPickerData}
            appStyles={appStyles}
            onChange={country => {
              selectCountry(country);
            }}
            cancelText={IMLocalized('Cancel')}
            visible={countryModalVisible}
            onCancel={onPressCancelContryModalPicker}
          />
        )}
        <View style={[styles.InputContainer, { flexDirection: 'row' }]}>
          <TextInput
            style={{ flex: 8 }}
            secureTextEntry={visibility ? false : true}
            autoCapitalize='none'
            placeholder="Enter password"
            placeholderTextColor='#aaaaaa'
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => checkVisibility()}>
            {
              visibility ?
                <Icon name={'visibility'} size={20} color={'#000'} />
                :
                <Icon name={'visibility-off'} size={20} color={'#000'} />
            }
          </TouchableOpacity>
        </View>
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
        <TermsOfUseView tosLink={appConfig.tosLink} style={styles.tos} />
      )}
      {loading && <TNActivityIndicator appStyles={appStyles} />}
    </View>
  );
};


export default connect(null, {
  setUserData,
})(SmsAuthenticationScreen);
