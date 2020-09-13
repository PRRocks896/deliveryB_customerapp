import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import PropTypes from "prop-types";
import EditProfileItemField from "./EditProfileItemField";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import AsyncStorage from "@react-native-community/async-storage";
import { Dialog } from 'react-native-simple-dialogs';
import OTP from '../../Core/onboarding/SmsAuthenticationScreen/otpInput'
import changeMobilereq from "../../services/ChangeMobile/changemobilereq";
import { cos } from "react-native-reanimated";
import changeMobilEdit from "../../services/ChangeMobile/changemobileedit";

function EditProfile(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { user } = props
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dialogVisible, setdialogVisible] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setisLoading] = useState(false)
  const [respOtp, setRespOtp] = useState('')
  const [iseditemail, setiseditemail] = useState(false)


  useEffect(() => {
    props.onProfileDataChange({ firstName, lastName, phone, email });
  }, [firstName, lastName, phone, email]);

  useEffect(() => {
    getUserDetails()
  }, []);

  const onFirstNamechange = text => {
    setFirstName(text);
  };

  const onLastNamechange = text => {
    setLastName(text);
  };
  const onEmailchange = text => {
    setEmail(text);
  };

  const onPhonechange = number => {
    setPhone(number);
  };

  const getUserDetails = async () => {
    let data = await AsyncStorage.getItem('CurrentUser')
    let userData = JSON.parse(data)
    setFirstName(userData.data.name.split(' ')[0] ? userData.data.name.split(' ')[0] : '')
    setLastName(userData.data.name.split(' ')[1] ? userData.data.name.split(' ')[1] : '')
    setEmail(userData.data.email)
    setPhone(userData.data.mobile)
  }
  const mobileReq = async () => {
    console.log("call verify")
    let userId = await AsyncStorage.getItem('userId')
    let body = JSON.stringify({
      id: userId
    })
    setdialogVisible(true)
    const data = await changeMobilereq(body)
    console.log("change req", data)
    if (data.success) {
      setRespOtp(data.data.otp)
      console.log("change movbile req", data.data.otp)
    }
  }
  const onFinishCheckingCode = async () => {
    setdialogVisible(true)
    if (respOtp == otpCode) {
      setiseditemail(true)
      setdialogVisible(false)
    } else {
      setdialogVisible(false)
      Alert.alert("Somthing went wrong")
    }
  }
  const changemobilenumber = async () => {
    if (phone !== '') {
      let checkno = phone.includes('+91')
      let mobilNumber
      if (checkno == false) mobilNumber = `+91${phone}`
      else mobilNumber = phone
      let body = JSON.stringify({
        otp: otpCode,
        mobile: mobilNumber
      })
      const data = await changeMobilEdit(body)
      if (data.success) {
        setiseditemail(false)
        Alert.alert(
          "",
          data.messageCode,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ],
          { cancelable: false }
        );

      }
      else {
        setiseditemail(false)
        Alert.alert(
          "",
          data.messageCode,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        "",
        "Please add phone number",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ],
        { cancelable: false }
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.labelView}>
          <Text style={styles.label}>PUBLIC PROFILE</Text>
        </View>
        <View style={styles.contentView}>
          <EditProfileItemField
            onChange={onFirstNamechange}
            value={firstName}
            title={"First Name"}
            placeholder={"Your first name"}
            isEditable={true}
          />
          <View style={styles.lineView} />
          <EditProfileItemField
            onChange={onLastNamechange}
            value={lastName}
            title={"Last Name"}
            placeholder={"Your last name"}
            isEditable={true}
          />
        </View>
        <View style={styles.labelView}>
          <Text style={styles.label}>PRIVATE DETAILS</Text>
        </View>
        <View style={styles.contentView}>
          <EditProfileItemField
            value={email}
            title={"E-mail Address"}
            placeholder={"Your email"}
            isEditable={true}
            onChange={onEmailchange}
          />
          <View style={styles.lineView} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 10 }}>
              <EditProfileItemField
                onChange={onPhonechange}
                value={phone}
                title={"Phone Number"}
                keyboardType={"numeric"}
                placeholder={"Your phone number"}
                isEditable={iseditemail}
              />
            </View>
            {
              iseditemail == false ?
                <TouchableOpacity
                  onPress={() => mobileReq()}
                  style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15 }}>Verify</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                  onPress={() => changemobilenumber()}
                  style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15 }}>Edit</Text>
                </TouchableOpacity>
            }
          </View>
        </View>
      </View>
      <Dialog
        visible={dialogVisible}
        title="For Otp verification"
        onTouchOutside={() => setdialogVisible(false)}
      >
        <View>
          <OTP otp="9999" code={(code) => setOtpCode(code)} status={(a) => { a == '200' ? this.props.navigation.navigate('App') : null }} />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {!isLoading ?
              <TouchableOpacity style={styless.buttonView} onPress={() => onFinishCheckingCode()}>
                <Text style={styless.buttonText}>Verify</Text>
              </TouchableOpacity>
              :
              <ActivityIndicator color={'#fff'} size="large" />
            }
          </View>
        </View>
      </Dialog>
    </ScrollView>
  );
}

EditProfile.propTypes = {
  user: PropTypes.object,
  onProfileDataChange: PropTypes.func
};

export default EditProfile;

const styless = StyleSheet.create({
  buttonView: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#a3a3a3',
    borderWidth: 1,

  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,

  },
})
