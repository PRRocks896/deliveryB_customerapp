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
import CodeField from 'react-native-confirmation-code-field';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useColorScheme } from 'react-native-appearance';
import TNActivityIndicator from '../../truly-native/TNActivityIndicator';
import TNProfilePictureSelector from '../../truly-native/TNProfilePictureSelector/TNProfilePictureSelector';
import CountriesModalPicker from '../../truly-native/CountriesModalPicker/CountriesModalPicker';
import { IMLocalized } from '../../localization/IMLocalization';
import { setUserData } from '../redux/auth';
import { connect } from 'react-redux';
import authManager from '../utils/authManager';
import { localizedErrorMessage } from '../utils/ErrorCode';
import TermsOfUseView from '../components/TermsOfUseView';
import dynamicStyles from './styles';
import signup from '../../../services/SignUp';
import verifyOTP from '../../../services/OTPVerification';
import OTP from '../../onboarding/SmsAuthenticationScreen/otpInput'
import signin from '../../../services/SignIn';
import getProfileDetails from '../../../services/Profile/getProfile';
import deviceStorage from '../../../utils/deviceStorage';
import Icon from 'react-native-vector-icons/MaterialIcons'
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(false);
  const [countriesPickerData, setCountriesPickerData] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [profilePictureURL, setProfilePictureURL] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const myCodeInput = useRef(null);
  const phoneRef = useRef(null);
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [visibility, setvisibility] = useState(false)
  const [useridsignup, setuseridsignup] = useState('')

  const { isSigningUp } = props.navigation.state.params;
  const [otpcode, setOtpCode] = useState('')

  useEffect(() => {
    if (phoneRef && phoneRef.current) {
      setCountriesPickerData(phoneRef.current.getPickerData());
    }
  }, [phoneRef]);



  const checkVisibility = () => {
    setvisibility(!visibility)
  }

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
      let userId = await AsyncStorage.getItem('userSignupData')
    } else {
      setLoading(false);
      Alert.alert(
        '',
        data.messageCode,
        [{ text: IMLocalized('OK') }],
        { cancelable: false },
      );
    }
  };

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
        data.messageCode,
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
        authManager.retrieveUserByPhone(userValidPhoneNumber).then(response => {
          if (response.success) {
            signInWithPhoneNumber(userValidPhoneNumber);
          } else {
            setPhoneNumber(null);
            setLoading(false);
            Alert.alert(
              '',
              IMLocalized(
                'You cannot log in. There is no account with this phone number.',
              ),
              [{ text: IMLocalized('OK') }],
              {
                cancelable: false,
              },
            );
          }
        });
      } else {

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

  const onFinishCheckingCode = async (newCode) => {
    console.log("newCode", newCode, isSigningUp)
    setLoading(true);
    if (isSigningUp) {
      signUpWithPhoneNumber(newCode);
    } else {

      authManager.loginWithSMSCode(newCode, verificationId).then(response => {
        if (response.error) {
          Alert.alert(
            '',
            localizedErrorMessage(response.error),
            [{ text: IMLocalized('OK') }],
            { cancelable: false },
          );
        } else {
          const user = response.user;
          // props.setUserData({ user });
          props.navigation.navigate('MainStack', { user: user });
        }
        setLoading(false);
      });
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

  const codeInputRender = () => {
    console.log("for otp scrren ")
    return (
      <>
        <OTP otp="9999" code={(code) => setOtpCode(code)} status={(a) => { a == '200' ? this.props.navigation.navigate('App') : null }} />
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
    // console.log("renderAsSignUpState")
    return (
      <>
        <Text style={styles.title}>{IMLocalized('Create new account')}</Text>
        {isPhoneVisible ? phoneInputRender() : codeInputRender()}

      </>
    );
  };
  const loginfun = async () => {
    setLoading(true)
    let userId = await AsyncStorage.getItem('userId')
    if (email != '' && password != '') {

      let body = JSON.stringify({
        email: email,
        password: password,
      })
      const data = await signin(body);
      console.log("data in sign in ", data)
      AsyncStorage.setItem("LoginData", JSON.stringify(data))
      AsyncStorage.setItem("userId", data.userId)
      if (data.success == false) {
        setLoading(false)
        console.log(data.messageCode)
        Alert.alert(
          '',
          data.messageCode,
          [{ text: IMLocalized('OK') }],
          {
            cancelable: false,
          },
        );
      } else {
        setLoading(false)
        getCurrentProfileDetails()
        // props.setUserData({
        //   user: data.userId,
        // });
        props.navigation.navigate('MainStack', { user: data.userId });
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

  const renderAsLoginState = () => {

    return (
      <>
        <Text style={styles.title}>{IMLocalized('Sign In')}</Text>
        <TextInput
          style={styles.InputContainer}
          keyboardType='email-address'
          autoCapitalize='none'
          placeholder="Enter Email"
          placeholderTextColor='#aaaaaa'
          onChangeText={(text) => setEmail(text)}
        />
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
    <View style={styles.container}>
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
