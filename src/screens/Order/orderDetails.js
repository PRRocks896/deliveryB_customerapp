import React, { Component } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, PermissionsAndroid, RefreshControl, Linking, Alert } from 'react-native'
import Appstyle from '../../AppStyles'
import { List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Geolocation from 'react-native-geolocation-service';
import { connect } from "../../utils/socket";
const LATITUDE = 22.2856;
const LONGITUDE = 70.7561;
class OrderDetailsScreen extends Component {
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


            latitude: LATITUDE,
            longitude: LONGITUDE

        }

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                // this.componentDidMount()

            });
    }
    componentDidMount = async () => {

        this.socket = connect();
        this.socket.on("connection", function (data) {
            console.log("Socket is connect", data)
        })
        this.changedateformate()
        this.permissionforlocation()
    }

    permissionforlocation = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Tribata app',
                    'message': 'Example App access to your location '
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // Get Current Location 
                this.getLocation();

            } else {
                Alert.alert("Location permission denied");
            }
        } catch (err) {
            console.warn(err)
        }
    }


    getLocation = async () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                };
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                alert(error.message);
                this.setState({
                    error: error.message,
                })
            },
            { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
        );
    }
    /**
     * Change date formate for service slot time
     */
    changedateformate = () => {
        const time = this.props.navigation.state.params.data.slot_time
        let timeformate = `${time}:00`
        let hour = (timeformate.split(':'))[0]
        let part = hour > 12 ? 'pm' : 'am';
        hour = hour > 12 ? hour - 12 : hour;
        hour = (hour + '').length == 1 ? `0${hour}` : hour;
        let data = `${hour}: 00 ${part}`
        this.setState({ slottime: data })
        return (`${hour} ${part}`)

    }


    render() {
        const { slottime } = this.state
        const data = this.props.navigation.state.params.data // Data from params (orderscreen and servicebookscreen)
        console.log("==============================", data.hasOwnProperty('delivery_boy'))
        if (this.props.navigation.state.params.type == 'Order') {
            console.log("order", data.status)
            if (data.status == 'PICKUP_READY' || data.status == 'ORDER_PICKED') {
                return (
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={[styles.card, styles.marginTop]}>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Your Order number :  </Text>
                                <Text style={styles.subtitle}>{data.order_number}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Order Status:  </Text>
                                <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.status}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.amount}</Text>
                            </View>

                            {
                                data.hasOwnProperty('delivery_boy') ?
                                    <>
                                        <View style={styles.row}>
                                            <Text style={styles.tital}>DeliveryBoy Name:  </Text>
                                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.delivery_boy.name}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.tital}>DeliveryBoy Contact:  </Text>
                                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.delivery_boy.mobile}</Text>
                                        </View>
                                    </>
                                    : null
                            }
                              <List.Section>
                                <List.Accordion
                                    style={{ padding: 0 }}
                                    title="Shop Details">
                                    <View style={{ marginLeft: 5 }}>
                                        <View style={styles.row}>
                                            <Icon name={'person'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.name}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.shopAddress}</Text>
                                        </View>

                                    </View>
                                </List.Accordion>
                            </List.Section>

                            {
                                data.deliveryType == 'SELF_PICKED' ?
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(`google.navigation:q=${data.shop_id.shopLatitude}+${data.shop_id.shopLongitude}`)}
                                        style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                        <Text style={styles.tital}>{'Get Shop Location'}</Text>
                                    </TouchableOpacity>
                                    :
                                    data.hasOwnProperty('delivery_boy') ?
                                        <TouchableOpacity
                                            onPress={() => this.props.navigation.navigate('TrackOrderComp', { latitudeself: this.state.latitude, longitudeself: this.state.longitude, deliveryboyid: data.hasOwnProperty('delivery_boy') ? data.delivery_boy._id : '' })}
                                            style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>{'Track Order'}</Text>
                                        </TouchableOpacity>
                                        : null
                            }

                          
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={[styles.card, styles.marginTop]}>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Your Order number :  </Text>
                                <Text style={styles.subtitle}>{data.order_number}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Order Status:  </Text>
                                <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.status}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.amount}</Text>
                            </View>

                            <List.Section>
                                <List.Accordion
                                    style={{ padding: 0 }}
                                    title="Shop Details">
                                    <View style={{ marginLeft: 5 }}>
                                        <View style={styles.row}>
                                            <Icon name={'person'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.name}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.shopAddress}</Text>
                                        </View>
                                        {
                                            data.deliveryType == 'SELF_PICKED' ?
                                                <TouchableOpacity
                                                    onPress={() => Linking.openURL(`google.navigation:q=${data.shop_id.shopLatitude}+${data.shop_id.shopLongitude}`)}
                                                    style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                                    <Text style={styles.tital}>{'Get Shop Location'}</Text>
                                                </TouchableOpacity>
                                                : null
                                        }
                                    </View>
                                </List.Accordion>
                            </List.Section>
                        </View>
                    </View>
                );
            }
        } else {
            console.log("Data=====service===", data)
            return (
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={[styles.card, styles.marginTop]}>
                        <View style={styles.row}>
                            <Text style={styles.tital}>Your Service number :  </Text>
                            <Text style={styles.subtitle}>{data.booking_number}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.tital}>Service Status:  </Text>
                            <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.status}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.tital}>Slot Time:  </Text>
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{slottime}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.tital}>Slot Date:  </Text>
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.slot_date}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.tital}>Total amount:  </Text>
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.amount}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.tital}>Payment:  </Text>
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.payment_method == 'COD' ? 'He/She has to pay to shop' : 'Already paid'}</Text>
                        </View>

                        <List.Section>
                            <List.Accordion
                                style={{ padding: 0 }}
                                title="Shop Details">
                                <View style={{ marginLeft: 5 }}>
                                    <View style={styles.row}>
                                        <Icon name={'person'} color={'#a3a3a3'} size={25} />
                                        <Text style={styles.tital}>  {data.shop_id.name}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                        <Text style={styles.tital}>  {data.shop_id.shopAddress}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(`google.navigation:q=${data.shop_id.shopLatitude}+${data.shop_id.shopLongitude}`)}
                                        style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                        <Text style={styles.tital}>{'Get Shop Location'}</Text>
                                    </TouchableOpacity>

                                </View>
                            </List.Accordion>
                        </List.Section>
                    </View>
                </View>
            );
        }
    }
}


export default OrderDetailsScreen;

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