import React, { Component } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, PermissionsAndroid, RefreshControl, Linking, Alert } from 'react-native'
import Appstyle from '../../AppStyles'
import { List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Geolocation from 'react-native-geolocation-service';
import { connect } from "../../utils/socket";
import detailsdboyService from "../../services/Order/getdboydetails";
const LATITUDE = 22.2856;
const LONGITUDE = 70.7561;
class DBoyOrderDetailsScreen extends Component {
    constructor(props) {
        super(props);


        this.state = {
            orderid: '',
            status: '',
            slottime: '',
            slotdate: '',
            amount: '',

            delierytype: this.props.navigation.state.params.deliverytype,
            payment_method: '',
            quantity: '',
            shopname: '',
            paymentstatus: '',


           dname:'',
           dPhone:''

        }

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                // this.componentDidMount()

            });
    }
   
componentDidMount =  async() => {
    let id = this.props.navigation.state.params.data.delivery_boy.user_id
    const response = await detailsdboyService(id)
    console.log("response dboy details", response)
    if(response.statusCode == 200){
        this.setState({dname: response.data[0].user_id.name, dPhone: response.data[0].user_id.mobile})
    }
}
 

    render() {
        const { dname,  dPhone} = this.state
        const data = this.props.navigation.state.params.data // Data from params (orderscreen and servicebookscreen)
        console.log("==============================data", data)

                return (
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={[styles.card, styles.marginTop]}>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Your Booking number :  </Text>
                                <Text style={styles.subtitle}>{data.booking_number}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Booking Status:  </Text>
                                <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.status}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(data.delivery_charge).toFixed(2)}</Text>
                            </View>

                            {
                                data.hasOwnProperty('delivery_boy') ?
                                    <>
                                        <View style={styles.row}>
                                            <Text style={styles.tital}>DeliveryBoy Name:  </Text>
                                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{dname}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.tital}>DeliveryBoy Contact:  </Text>
                                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{dPhone}</Text>
                                        </View>
                                    </>
                                    : null
                            }
                        </View>
                    </View>
                );
          
        
    }
}


export default DBoyOrderDetailsScreen;

const styles = StyleSheet.create({
    card: {
        margin: 5,
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5
    },
    marginTop: {
        marginTop: 10
    },
    tital: {
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 15
    },
    subtitle: {
        fontFamily: Appstyle.fontFamily.lightFont
    },
    row: {
        flexDirection: 'row'
    },
    buttoncontainer: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        marginTop: 10,
        margin: 10
    }

})