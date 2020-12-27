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
import { ActivityIndicator, RadioButton } from 'react-native-paper';
import updateAddress from "../../services/SavedAddress/updateAddress";
import { ScrollView } from "react-native-gesture-handler";


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
            value: '',
            isLoading: false,


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
        console.log("start==================================")
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({ isLoading: true })
        let userid = await AsyncStorage.getItem('userId')
        // get address via user
        const data = await getAddressviaUSer(userid);
        if (data.data) {
            this.setState({ address: data.data.address, addressid: data.data._id, isLoading: false })
            AsyncStorage.setItem("AddressId", data.data._id)

            let dataAddress = data.data.address.filter(item => item.isDefault == true)
            AsyncStorage.setItem("CustomerAddress", JSON.stringify(dataAddress[0]))


            this.state.address.map((item) => {
                if (item.isDefault == true) this.setState({ value: item._id })
            })
        } else {
            this.setState({ isLoading: false })
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

    removeItem = async (clickid) => {

        let userId = await AsyncStorage.getItem('userId')
        let phoneNo = await AsyncStorage.getItem('UserMobile')

        let found = this.state.address.some(i => i._id == clickid)
        if (found == true) {
            let index = this.state.address.findIndex(i => i._id == clickid)
            this.state.address.splice(index, 1)
        }
        let body = JSON.stringify({
            user_id: userId,
            address: [
                ... this.state.address,
            ]
        })
        const data = await updateAddress(body, this.state.addressid)
        console.log("Data update address", data)
        if (data.success) {
            this.componentDidMount()
        } else {
            Alert.alert(data.messageCode);

        }
    }

    /**
     * Delete Address
     * @param {any} clickid 
     */
    deleteAddress = async (clickid) => {
        Alert.alert(
            'Remove Address',
            "Are you sure you want to remove this address.",
            [{
                text: 'REMOVE',
                onPress: () => this.removeItem(clickid)
            }, { text: 'CANCEL' }],

        );

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
                    console.log("item.item.address_line_1", item.item.address_line_1)
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
                                <TouchableOpacity style={[styles.homeAddEditView, { borderTopEndRadius: 0, borderBottomEndRadius: 0 }]} onPress={() => this.props.navigation.navigate("SaveAddressScreen", { mainAddressId: addressid, onClickaddress: item, address: this.state.address, obclickaddressid: item.item._id })}>
                                    <Icon name={'pencil-square-o'} size={25} color='#000' />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.homeAddEditView]} onPress={() => this.deleteAddress(item.item._id)}>
                                    <Icon name={'trash'} size={25} color='#000' />
                                </TouchableOpacity>
                            </RadioButton.Group>
                        </TouchableOpacity>
                    )
                }}

            />
        )
    }
    render() {
        const { address } = this.state
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.isLoading ? <ActivityIndicator size={'small'} color={'#000'} />
                        :
                        <ScrollView contentContainerStyle={{flexGrow:1}}>
                            {address.length !== 0 ?
                                this.getAddress()
                                :
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={{ width: 350, height: 350, marginTop: -100 }} resizeMode={'contain'} source={require('../../../assets/images/locationimg.png')} />
                                    <Text style={{ fontSize: 20 , marginTop:-50, fontFamily:AppStyles.fontFamily.semiBoldFont}}>No Saved Address Found</Text>

                                </View>
                            }
                        </ScrollView>
                }
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