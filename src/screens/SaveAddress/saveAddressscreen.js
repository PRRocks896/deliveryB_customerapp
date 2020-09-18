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
            addressLength: this.props.navigation.state.params.addressLength

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
        // console.log(address_line_1, address_line_2, district, pinCode, state, mobile, country)
        if (address_line_1 != '' && address_line_2 != '' && district != '' && pinCode != '' && state != '' && mobile != '' && country != '') {
            if (addressLength == 0) {
                // console.log("in if call")
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
                // console.log("Add Address", data)
                if (data.success) {
                    this.props.navigation.goBack()
                } else {
                    Alert.alert(data.messageCode);
                    this.props.navigation.goBack()
                }
            } else {
                //  if address already available then append address from here
                // console.log("call else in address", this.props.navigation.state.params.address)
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
                // console.log("body", body)
                const data = await updateAddress(body, id)
                // console.log("Final update address", data)
                if (data.success) {
                    this.props.navigation.goBack()
                } else {
                    Alert.alert(data.messageCode);
                    this.props.navigation.goBack()
                }
            }

        } else {
            // console.log("call else")
            Alert.alert("Please fill all details");

        }
    }
    /**
     * Update Address
     */
    updateAddress = async () => {
        let userId = await AsyncStorage.getItem('userId')
        // console.log("Update", this.props.navigation.state.params.mainAddressId,    this.props.navigation.state.params.address,)
        let id = this.props.navigation.state.params.mainAddressId
        const { country, address_line_1, address_line_2, district, pinCode, state, name, mobile } = this.state
        let appendaddress = this.props.navigation.state.params.address
        let clickedaddressid = this.props.navigation.state.params.obclickaddressid
        // console.log("For only update", appendaddress, clickedaddressid)

        let found = appendaddress.some(i => i._id == clickedaddressid)
        // console.log("Found", found)
        if (found == true) {
            let index = appendaddress.findIndex(i => i._id == clickedaddressid)
            // console.log("index", index)
            appendaddress.splice(index, 1)
            // console.log(appendaddress.length, "finalAddressArray", appendaddress)
        }

        if (address_line_1 != '' && address_line_2 != '' && district != '' && pinCode != '' && state != '' && mobile != '' && country != '') {
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
            console.log("Final update address", data)
            if (data.success) {
                this.props.navigation.goBack()
            } else {
                Alert.alert(data.messageCode);
                this.props.navigation.goBack()
            }
        } else {
            // console.log("call else")
            Alert.alert("Please fill all details");
        }
    }
    render() {
        const { name, address_line_1, address_line_2, mobile, district, pinCode, state, country, isParamsData } = this.state
        return (
            <View style={styles.container}>
                <View>
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='number-pad'
                        placeholder="Mobile No."
                        value={mobile}
                        onChangeText={(text) => this.setState({ mobile: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={address_line_1}
                        placeholder="Enter Address 1"
                        onChangeText={(text) => this.setState({ address_line_1: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={address_line_2}
                        placeholder="Enter Address 2"
                        onChangeText={(text) => this.setState({ address_line_2: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={district}
                        placeholder="City"
                        onChangeText={(text) => this.setState({ district: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='number-pad'
                        autoCapitalize='none'
                        value={pinCode}
                        placeholder="Zip code"
                        onChangeText={(text) => this.setState({ pinCode: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={state}
                        placeholder="State"
                        onChangeText={(text) => this.setState({ state: text })}
                    />
                    <TextInput
                        style={styles.InputContainer}
                        keyboardType='default'
                        autoCapitalize='none'
                        value={country}
                        placeholder="Country"
                        onChangeText={(text) => this.setState({ country: text })}
                    />

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

            </View>
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