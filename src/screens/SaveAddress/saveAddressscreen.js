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
    BackHandler,
    CheckBox
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import addAddress from '../../services/SavedAddress/addAddress'
import getAddress from "../../services/SavedAddress/getAddress";
import updateAddress from "../../services/SavedAddress/updateAddress";
import { ScrollView } from "react-native-gesture-handler";
import GoogleMapComponent from "./googleMap";
import { EventRegister } from 'react-native-event-listeners'
import { ActivityIndicator } from "react-native-paper";

var latitudedata;
let longitudedata;
let addressArray;
let lat;
let long;
let isData;
class SaveAddressScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
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

            latitude: '',
            longitude: '',

            mapAddress: '',
            isSelectedCheckbox: false,
            addressLoading: false
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()
            });
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
        // For Shop Latitude
        EventRegister.addEventListener('Lat', (data) => {
            latitudedata = data
        })

        // For Shop Longitude
        EventRegister.addEventListener('Long', (data) => {
            longitudedata = data
        })
        EventRegister.addEventListener('address', (data) => {
            addressArray = data
        })
        EventRegister.addEventListener('FullAddress', (data) => {
            this.setState({ mapAddress: data })
        })

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        let paramsData = this.props.navigation.state.params

        console.log("data=============================", paramsData.onClickaddress)
        let index = paramsData.onClickaddress.index
        if (paramsData) {
            this.setState({ isParamsData: true })
            // get address details by params data id
            const data = await getAddress(paramsData.mainAddressId);
            let address = data.data.address
            if (address[index]._id == paramsData.onClickaddress.item._id) {
                console.log("address get======================in didmount", address[index]._id, paramsData.onClickaddress.item._id)

                lat = paramsData.onClickaddress.item.lat
                long = paramsData.onClickaddress.item.long
                isData = true
                this.setState({
                    address_line_1: paramsData.onClickaddress.item.address_line_1,
                    address_line_2: paramsData.onClickaddress.item.address_line_2,
                    mobile: paramsData.onClickaddress.item.mobile,
                    district: paramsData.onClickaddress.item.district,
                    pinCode: paramsData.onClickaddress.item.pinCode,
                    state: paramsData.onClickaddress.item.state,
                    country: paramsData.onClickaddress.item.country,
                    name: paramsData.onClickaddress.item.name,
                    latitude: paramsData.onClickaddress.item.lat,
                    longitude: paramsData.onClickaddress.item.long,
                    isParamsData: true
                })
            }
        } else {
            this.setState({ isParamsData: false })
            isData = false
        }


    }
    /**
     * Add Address
     */
    addaddress = async () => {
        let userId = await AsyncStorage.getItem('userId')
        let phoneNo = await AsyncStorage.getItem('UserMobile')
        let id = this.props.navigation.state.params.mainAddressId
        const { name, addressLength } = this.state

        EventRegister.addEventListener('Lat', (data) => {
            latitudedata = data
        })
        EventRegister.addEventListener('Long', (data) => {
            longitudedata = data
        })
        EventRegister.addEventListener('address', (data) => {
            addressArray = data
        })

        let address_line_1;
        let address_line_2;
        let district;
        let state;
        let country;
        let pinCode;
        console.log("addressArray", addressArray)

        addressArray.map(item => {
            console.log(item.types[0])
            if (item.types.includes('postal_code')) {
                pinCode = item.long_name
            } else if (item.types.includes('country')) {
                country = item.long_name
            } else if (item.types.includes('administrative_area_level_1')) {
                state = item.long_name
            } else if (item.types.includes('locality')) {
                district = item.long_name
            } else if (item.types.includes('sublocality_level_1')) {
                address_line_2 = item.long_name
            } else if (item.types.includes('sublocality_level_2') || item.types.includes('route') || item.types.includes('premise')) {
                address_line_1 = item.long_name
            } else if (item.types.includes('street_number')) {
                address_line_1 = address_line_1 + ',' + item.long_name
            }
        })
        console.log("lat long", typeof (latitudedata), longitudedata)
        console.log("addressss lengt===============================", address_line_1,address_line_2,district, pinCode,state, country   )
        if ( address_line_2 !== undefined && district != undefined && pinCode != undefined && state != undefined && country != undefined) {
            if (addressLength == 0) {
                this.setState({ addressLoading: true })
                let body = JSON.stringify({
                    user_id: userId,
                    address: [
                        {
                            name: name,
                            address_line_1: address_line_1 == undefined ? '' : address_line_1,
                            address_line_2: address_line_2,
                            district: district,
                            state: state,
                            pinCode: pinCode,
                            country: country,
                            mobile: phoneNo,
                            lat: (latitudedata).toString(),
                            long: (longitudedata).toString()
                        }
                    ]
                })
                // add address from here, call api
                const data = await addAddress(body);

                console.log("Add Address", data)
                if (data.success) {
                    this.props.navigation.goBack()
                    this.setState({ addressLoading: false })
                } else {
                    Alert.alert(data.message);
                    this.props.navigation.goBack()
                    this.setState({ addressLoading: false })
                }
            } else {
                this.setState({ addressLoading: true })
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
                            mobile: phoneNo,
                            lat: (latitudedata).toString(),
                            long: (longitudedata).toString()
                        }
                    ]
                })

                const data = await updateAddress(body, id)
                if (data.success) {
                    this.props.navigation.goBack()
                    this.setState({ addressLoading: false })
                } else {
                    Alert.alert(data.message);
                    this.props.navigation.goBack()
                    this.setState({ addressLoading: false })
                }
            }
        } else {

        }
    }
    /**
     * Update Address
     */
    updateAddress = async () => {
        let userId = await AsyncStorage.getItem('userId')
        let phoneNo = await AsyncStorage.getItem('UserMobile')

        let id = this.props.navigation.state.params.mainAddressId
        const { name } = this.state
        let appendaddress = this.props.navigation.state.params.address
        let clickedaddressid = this.props.navigation.state.params.obclickaddressid

        EventRegister.addEventListener('Lat', (data) => {
            latitudedata = data
        })
        EventRegister.addEventListener('Long', (data) => {
            longitudedata = data
        })
        EventRegister.addEventListener('address', (data) => {
            addressArray = data
        })

        console.log("Lat long data", latitudedata, longitudedata, addressArray)
        let address_line_1;
        let address_line_2;
        let district;
        let state;
        let country;
        let pinCode;

        addressArray.map(item => {
            console.log(item.types[0])
            if (item.types.includes('postal_code')) {
                pinCode = item.long_name
            } else if (item.types.includes('country')) {
                country = item.long_name
            } else if (item.types.includes('administrative_area_level_1')) {
                state = item.long_name
            } else if (item.types.includes('locality')) {
                district = item.long_name
            } else if (item.types.includes('sublocality_level_1')) {
                address_line_2 = item.long_name
            } else if (item.types.includes('sublocality_level_2') || item.types.includes('route')) {
                address_line_1 = item.long_name
            } else if (item.types.includes('street_number')) {
                address_line_1 = address_line_1 + ',' + item.long_name
            }
        })


        let found = appendaddress.some(i => i._id == clickedaddressid)

        if (found == true) {
            let index = appendaddress.findIndex(i => i._id == clickedaddressid)
            appendaddress.splice(index, 1)

        }
        if (address_line_1 != '' && district != '' && pinCode != '' && state != '' && phoneNo != '' && country != '') {
            this.setState({ addressLoading: true })
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
                        mobile: phoneNo,
                        lat: (latitudedata).toString(),
                        long: (longitudedata).toString()
                    }
                ]
            })
            const data = await updateAddress(body, id)
            console.log("Data update address", data)
            if (data.success) {
                this.props.navigation.goBack()
                this.setState({ addressLoading: false })
            } else {
                Alert.alert(data.messageCode);
                this.props.navigation.goBack()
                this.setState({ addressLoading: false })
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
        const { name, latitude, longitude, mobile, district, pinCode, state, country, isParamsData,
            mobilenoError, address1Error, address2Error, pincodeError, cityError, stateError, countryError } = this.state
        console.log("paramsdata", isParamsData)
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ marginLeft: 10, marginRightL: 10 }}>
                    <View style={{ marginTop: 20 }}>

                        <View style={{ height: 500, marginTop: 10 }}>
                            {/* For Load Google Map for get user's Location */}

                            <GoogleMapComponent latitude={parseFloat(lat)} longitude={parseFloat(long)} isparamsData={isData} />

                        </View>
                    </View>
                    {
                        isParamsData ?
                            <>
                                <View style={{ flexDirection: 'row' }}>
                                    <CheckBox
                                        value={this.state.isSelectedCheckbox}
                                        onValueChange={(value) => this.setState({ isSelectedCheckbox: value })}
                                        style={styles.checkbox}
                                    />
                                    <Text style={{ textAlignVertical: 'center' }}>  Same as Above</Text>
                                </View>

                                {

                                    this.state.isSelectedCheckbox == false ?
                                        <View style={styles.oldAddressbox}>
                                            <Text>{this.state.address_line_1 + ', ' + this.state.address_line_2 + ', ' + this.state.district + ', ' + this.state.pinCode + ', ' + this.state.state + ', ' + this.state.country}</Text>
                                        </View>
                                        :
                                        <View style={styles.oldAddressbox}>
                                            <Text>{this.state.mapAddress}</Text>
                                        </View>
                                }
                            </>
                            : null
                    }


                    <Picker
                        selectedValue={name}
                        style={styles.picker}
                        enabled={!isParamsData ? true : false}
                        onValueChange={(itemValue, itemIndex) => this.setState({ name: itemValue })}>
                        <Picker.Item label="Home" value="Home" />
                        <Picker.Item label="Office" value="Office" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                    <View style={styles.btnContainer}>
                        {
                            !isParamsData ?
                                this.state.addressLoading ?
                                    <TouchableOpacity style={styles.button} >
                                        <ActivityIndicator size={'small'} color={'#000'} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={styles.button} onPress={() => this.addaddress()}>
                                        <Text style={{ fontSize: 20 }}>Add Address</Text>
                                    </TouchableOpacity>
                                :
                                this.state.addressLoading ?
                                    <TouchableOpacity style={styles.button} >
                                        <ActivityIndicator size={'small'} color={'#000'} />
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
    },
    oldAddressbox: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#e7e7e7',
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 10
    }

})