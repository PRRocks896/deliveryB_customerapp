import React, { Component } from "react";
import PropTypes from "prop-types";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Picker,
    Alert,
    BackHandler
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import addAddress from '../../services/SavedAddress/addAddress'
import getAddress from "../../services/SavedAddress/getAddress";
import updateAddress from "../../services/SavedAddress/updateAddress";
import { ScrollView } from "react-native-gesture-handler";

class SaveAddressScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
            address_line_1: '',
            address_line_2: '',
            district: '',
            pinCode: '',
            state: '',
            country: '',
            name: 'Home',
            mobile: '',
            isParamsData: false,
            addressLength: this.props.navigation.state.params.addressLength,

            mobilenoError: '',
            address1Error: '',
            address2Error: '',
            pincodeError: '',
            cityError: '',
            stateError: '',
            countryError: '',


        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    /**
     * for back to prev screen
     */
    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;
    }

    /**
     * get address from perticuler clicked address
     */
    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        let paramsData = this.props.navigation.state.params
        let index = paramsData.onClickaddress.index
        if (paramsData) {
            this.setState({ isParamsData: true })
            // get address details by params data id
            const data = await getAddress(paramsData.mainAddressId);
            let address = data.data.address
            if (address[index]._id == paramsData.onClickaddress.item._id) {
                this.setState({
                    address_line_1: paramsData.onClickaddress.item.address_line_1,
                    address_line_2: paramsData.onClickaddress.item.address_line_2,
                    mobile: paramsData.onClickaddress.item.mobile,
                    district: paramsData.onClickaddress.item.district,
                    pinCode: paramsData.onClickaddress.item.pinCode,
                    state: paramsData.onClickaddress.item.state,
                    country: paramsData.onClickaddress.item.country,
                    name: paramsData.onClickaddress.item.name
                })
            }
        } else {
            this.setState({ isParamsData: false })
        }


    }
    /**
     * Add Address
     */
    addaddress = async () => {
        let userId = await AsyncStorage.getItem('userId')
        let id = this.props.navigation.state.params.mainAddressId
        const { country, address_line_1, address_line_2, district, pinCode, state, name, mobile, addressLength } = this.state
        
        if (address_line_1 != '' && district != '' && pinCode != '' && state != '' && mobile != '' && country != '') {
            if (addressLength == 0) {
              
                let body = JSON.stringify({
                    user_id: userId,
                    address: [
                        {
                            name: name,
                            address_line_1: address_line_1,
                            address_line_2: address_line_2,
                            district: district,
                            state: state,
                            pinCode: pinCode,
                            country: country,
                            mobile: mobile
                        }
                    ]
                })
                // add address from here, call api
                const data = await addAddress(body);
               
                if (data.success) {
                    this.props.navigation.goBack()
                } else {
                    Alert.alert(data.message);
                    this.props.navigation.goBack()
                }
            } else {
                //  if address already available then append address from here
                
                let body = JSON.stringify({
                    user_id: userId,
                    address: [
                        ...this.props.navigation.state.params.address,
                        {
                            name: name,
                            address_line_1: address_line_1,
                            address_line_2: address_line_2,
                            district: district,
                            state: state,
                            pinCode: pinCode,
                            country: country,
                            mobile: mobile
                        }
                    ]
                })
               
                const data = await updateAddress(body, id)
                
                if (data.success) {
                    this.props.navigation.goBack()
                } else {
                    Alert.alert(data.message);
                    this.props.navigation.goBack()
                }
            }

        } else {
           
        
            if (mobile == '') this.setState({ mobilenoError: 'Please Enter Mobile No.' })
            if (address_line_1 == '') this.setState({ address1Error: "Please Enter Address line 1" })
            if (address_line_2 == '') this.setState({ address2Error: "Please Enter Address line 2" })
            if (pinCode == '') this.setState({ pincodeError: "Please Enter Pin Code" })
            if (state == '') this.setState({ stateError: "Please Enter State" })
            if (country == '') this.setState({ countryError: "Please Enter Country" })
            if (district == '') this.setState({ cityError: "Please Enter City" })

        }
    }
    /**
     * Update Address
     */
    updateAddress = async () => {
        let userId = await AsyncStorage.getItem('userId')
       
        let id = this.props.navigation.state.params.mainAddressId
        const { country, address_line_1, address_line_2, district, pinCode, state, name, mobile } = this.state
        let appendaddress = this.props.navigation.state.params.address
        let clickedaddressid = this.props.navigation.state.params.obclickaddressid
        

        let found = appendaddress.some(i => i._id == clickedaddressid)
      
        if (found == true) {
            let index = appendaddress.findIndex(i => i._id == clickedaddressid)
            appendaddress.splice(index, 1)
           
        }

        if (address_line_1 != '' && district != '' && pinCode != '' && state != '' && mobile != '' && country != '') {
            let body = JSON.stringify({
                user_id: userId,
                address: [
                    ...appendaddress,
                    {
                        name: name,
                        address_line_1: address_line_1,
                        address_line_2: address_line_2,
                        district: district,
                        state: state,
                        pinCode: pinCode,
                        country: country,
                        mobile: mobile
                    }
                ]
            })
            const data = await updateAddress(body, id)
            if (data.success) {
                this.props.navigation.goBack()
            } else {
                Alert.alert(data.messageCode);
                this.props.navigation.goBack()
            }
        } else {
            if (mobile == '') this.setState({ mobilenoError: 'Please Enter Mobile No.' })
            if (address_line_1 == '') this.setState({ address1Error: "Please Enter Address line 1" })
            if (address_line_2 == '') this.setState({ address2Error: "Please Enter Address line 2" })
            if (pinCode == '') this.setState({ pincodeError: "Please Enter Pin Code" })
            if (state == '') this.setState({ stateError: "Please Enter State" })
            if (country == '') this.setState({ countryError: "Please Enter Country" })
            if (district == '') this.setState({ cityError: "Please Enter City" })
        }
    }
    render() {
        const { name, address_line_1, address_line_2, mobile, district, pinCode, state, country, isParamsData,
            mobilenoError, address1Error, address2Error, pincodeError, cityError, stateError, countryError } = this.state
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ marginLeft: 10, marginRightL: 10 }}>
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='number-pad'
                        placeholder="Mobile No."
                        maxLength={10}
                        value={mobile}
                        onChangeText={(text) => this.setState({ mobile: text })}
                    />
                    {
                        mobilenoError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{mobilenoError}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={address_line_1}
                        maxLength={100}
                        placeholder="Enter Address 1"
                        onChangeText={(text) => this.setState({ address_line_1: text })}
                    />

                    {
                        address1Error !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{address1Error}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={address_line_2}
                        placeholder="Enter Address 2"
                        maxLength={100}
                        onChangeText={(text) => this.setState({ address_line_2: text })}
                    />
                    {
                        address2Error !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{address2Error}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='number-pad'
                        autoCapitalize='none'
                        value={pinCode}
                        placeholder="Pin code"
                        maxLength={6}
                        onChangeText={(text) => this.setState({ pinCode: text })}
                    />
                    {
                        pincodeError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{pincodeError}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={district}
                        placeholder="City"
                        maxLength={50}
                        onChangeText={(text) => this.setState({ district: text })}
                    />
                    {
                        cityError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{cityError}</Text>
                            </View>
                            : null
                    }

                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={state}
                        placeholder="State"
                        maxLength={50}
                        onChangeText={(text) => this.setState({ state: text })}
                    />
                    {
                        stateError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{stateError}</Text>
                            </View>
                            : null
                    }
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={country}
                        placeholder="Country"
                        maxLength={50}
                        onChangeText={(text) => this.setState({ country: text })}
                    />
                    {
                        countryError !== '' ?
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'red', textAlign: 'center' }}>{countryError}</Text>
                            </View>
                            : null
                    }
                    <Picker
                        selectedValue={name}
                        style={styles.picker}
                        onValueChange={(itemValue, itemIndex) => this.setState({ name: itemValue })}>
                        <Picker.Item label="Home" value="Home" />
                        <Picker.Item label="Office" value="Office" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                    <View style={styles.btnContainer}>
                        {
                            !isParamsData ?
                                <TouchableOpacity style={styles.button} onPress={() => this.addaddress()}>
                                    <Text style={{ fontSize: 20 }}>Add Address</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={styles.button} onPress={() => this.updateAddress()}>
                                    <Text style={{ fontSize: 20 }}>Update Address</Text>
                                </TouchableOpacity>
                        }
                    </View>
                </View>

            </ScrollView>
        );
    }
}


export default SaveAddressScreen;
const styles = StyleSheet.create({
    addbutton: {
        margin: 5,
        padding: 10,
        borderColor: '#000',
        borderWidth: 1
    },
    InputContainer: {
        height: 42,
        borderWidth: 1,
        borderColor: '#e7e7e7',
        color: '#000',
        width: '100%',
        marginTop: 5,
        alignItems: 'center'
    },
    container: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5
    },
    picker: {
        height: 50,
        width: '100%'
    },
    button: {
        width: '60%',
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#e7e7e7',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    btnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    }

})