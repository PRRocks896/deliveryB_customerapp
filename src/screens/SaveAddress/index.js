import React, { Component } from "react";
import PropTypes from "prop-types";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    FlatList,
    Alert,
    BackHandler
} from "react-native";
import {
    Header,
    ProcedureImage,
    ShippingDetails,
    HeaderButton
} from "../../components";
import AppStyles from "../../AppStyles";
import { Dialog } from 'react-native-simple-dialogs';
import AsyncStorage from "@react-native-community/async-storage";
import getAddressviaUSer from "../../services/SavedAddress/getAddressviaUser";
import Icon from 'react-native-vector-icons/FontAwesome'
import { RadioButton } from 'react-native-paper';
import updateAddress from "../../services/SavedAddress/updateAddress";


class SaveAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
            name: '',
            email: '',
            address1: '',
            address2: '',
            city: '',
            zipcode: '',
            state: '',
            address: [],
            addressid: '',
            radiovalue: '',
            value: ''

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
    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        let userid = await AsyncStorage.getItem('userId')
        // get address via user
        const data = await getAddressviaUSer(userid);
        if (data.data) {
            this.setState({ address: data.data.address, addressid: data.data._id })
            console.log("address id ", data.data._id)
            AsyncStorage.setItem("AddressId", data.data._id)
            this.state.address.map((item) => {
                console.log(item.isDefault)
                if (item.isDefault == true) this.setState({ value: item._id })
            })
        }
    }
    /**
     * 
     * @param {number} index click address's index
     * update address's idDefault value, on click radio button
     */
    updateaddress = async (index) => {
        let userId = await AsyncStorage.getItem('userId')
        let id = this.state.addressid
        const { address } = this.state
        address.map((item, indexofAddress) => {
            if (indexofAddress == index) item.isDefault = true
            else item.isDefault = false
        })
        let body = JSON.stringify({
            user_id: userId,
            address: address
        })
        const data = await updateAddress(body, id)
    }
    /**
     * display Address 
     */
    getAddress = () => {
        const { address, addressid, radiovalue, value } = this.state
        return (
            <FlatList
                data={address}
                renderItem={(item, indexofaddress) => {
                    return (
                        <TouchableOpacity style={[styles.row, styles.card]} >
                            <RadioButton.Group onValueChange={value => [this.updateaddress(item.index), this.setState({ value: value })]} value={value}>
                                <View style={{ flex: 2, alignItems: 'center', justifyContent: "center", padding: 10 }}>
                                    <RadioButton value={item.item._id} />
                                </View>
                                <View style={{ flex: 2, alignItems: 'center', justifyContent: "center", padding: 10 }}>
                                    <View style={[styles.homeAddressCircle, { backgroundColor: '#686868' }]}>
                                        <Icon name={'building'} size={25} color='#e7e7e7' />
                                    </View>
                                </View>
                                <View style={{ flex: 7, padding: 10 }}>
                                    <Text style={styles.title}>{item.item.name} Address</Text>
                                    <Text style={{ color: '#000', fontSize: 12 }}>{item.item.address_line_1}</Text>
                                    <Text style={{ color: '#000', fontSize: 12 }}>{item.item.address_line_2}</Text>
                                </View>
                                <TouchableOpacity style={styles.homeAddEditView} onPress={() => this.props.navigation.navigate("SaveAddressScreen", { mainAddressId: addressid, onClickaddress: item })}>
                                    <Icon name={'pencil-square-o'} size={25} color='#000' />
                                </TouchableOpacity>
                            </RadioButton.Group>
                        </TouchableOpacity>
                    )
                }}

            />
        )
    }
    render() {

        return (
            <View style={{ flex: 1 }}>
                <ProcedureImage source={AppStyles.imageSet.box} />
                <View >
                    {this.getAddress()}
                </View>
                <TouchableOpacity style={styles.footerbtn} onPress={() => this.props.navigation.navigate("SaveAddressScreen", { addressLength: this.state.address.length, mainAddressId: this.state.addressid, address: this.state.address })}>
                    <Image style={styles.addicon} source={AppStyles.iconSet.plus} />
                </TouchableOpacity>
            </View>
        );
    }
}


export default SaveAddress;
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
    footerbtn: {
        position: 'absolute',
        bottom: 10,
        right: 20,
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addicon: {
        width: 30,
        height: 30,
        color: '#000'
    },
    card: {
        margin: 5,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5,
        marginTop: 10
    },
    title: {
        fontFamily: AppStyles.fontFamily.regularFont,
        fontSize: 20
    },
    row: {
        flexDirection: 'row',
    },
    homeAddressCircle: {
        backgroundColor: '#e7e7e7',
        borderColor: '#e7e7e7',
        width: 50,
        height: 50,
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 2,
        justifyContent: 'center'
    },
    homeAddEditView: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 2.5,
        backgroundColor: '#e7e7e7',
        padding: 0,
        borderTopEndRadius: 10,
        borderBottomEndRadius: 10
    },

})