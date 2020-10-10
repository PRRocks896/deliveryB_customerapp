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
import Toast from 'react-native-simple-toast';

import IntlPhoneInput from 'react-native-intl-phone-input';

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
  const [dialcode, setdialcode] = useState('')
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
  const signInWithPhoneNumber = async () => {
    console.log("For Sign up", dialcode+mobile)
    setLoading(true);
    let body = JSON.stringify({ mobile:  dialcode+mobile})
    const data = await signup(body);
    console.log("Data in smsAuth screen", data)
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
      Toast.show(data.message, Toast.LONG);
    }
  };

  const onPressSend = () => {

    // if (phoneRef.current.isValidNumber()) {
    //   const userValidPhoneNumber = phoneRef.current.getValue();
    //   setLoading(true);
    //   setPhoneNumber(userValidPhoneNumber);
    //   console.log("in onPressSend", isSigningUp, userValidPhoneNumber)
      if (!isSigningUp) {
      } else {
        // Sign up user
        signInWithPhoneNumber();
      }
    // } else {
    //   Toast.show('Please enter a valid phone number.', Toast.LONG);
     
    // }
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
    let userId = await AsyncStorage.getItem('userId')
    // let mobileNo = phoneRef.current.getValue()
    if (mobile != '' && password != '') {
      setLoading(true)
      console.log("login------------------------",mobile)
      if(mobile.length < 10 || mobile.length > 10){
        setLoading(false)
        console.log("mobile in validation",mobile)
        Toast.show('Please enter a valid phone number.', Toast.LONG);
      
      }
      else{

        let body = JSON.stringify({
          mobile: dialcode +  mobile,
          password: password,
        })
        const data = await signin(body);
        console.log("data in sign in ", data)
        AsyncStorage.setItem("LoginData", JSON.stringify(data))
        AsyncStorage.setItem("userId", data.userId)
        if (data.success == false) {
          setLoading(false)
          console.log(data.message)
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
      console.log("call else")
      Toast.show('Please enter a details.', Toast.LONG);
     
   
    }

  }

  /**
   * Get Address id 
   * For get Orders
   */
  const getAddressid = async () => {
    let userid = await AsyncStorage.getItem('userId')
    console.log("userid", userid)
    // get address via user
    const data = await getAddressviaUSer(userid);
    console.log("data.data._id>>>>>>>>", data)
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
       
        <View style={[styles.InputContainer, { flexDirection: 'row' }]}>
          <TextInput
            style={{ flex: 8 }}
            secureTextEntry={visibility ? false : true}
            autoCapitalize='none'
            placeholder="Enter password"
            placeholderTextColor='#aaaaaa'
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity style={{ flex: 1,justifyContent:'center' }} onPress={() => checkVisibility()}>
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
        <TermsOfUseView tosLink={'https://www.tribataholidays.co.in/terms.html'} style={styles.tos} />
      )}
      {loading && <TNActivityIndicator appStyles={appStyles} />}
    </View>
  );
};


export default connect(null, {
  setUserData,
})(SmsAuthenticationScreen);
