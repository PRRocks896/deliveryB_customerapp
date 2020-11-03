import React, { Component } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, BackHandler, RefreshControl , Linking} from 'react-native'
import Appstyle from '../../AppStyles'
import getorderbyidDetails from "../../services/Order/oderbyid";
import serviceDetailsData from "../../services/ShopServices/getserviceorderdetails";
import shopdetails from '../../services/ShopDetails/shopdetails'
import { List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
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
            paymentstatus:''


        }

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                // this.componentDidMount()

            });
    }
    componentDidMount = async () => {
            this.changedateformate()
    }
            changedateformate = () => {
                const time = this.props.navigation.state.params.data.slot_time
                        console.log("Time", time)
                    let timeformate = `${time}:00`
                    let hour = (timeformate.split(':'))[0]
                    let part = hour > 12 ? 'pm' : 'am';
                    hour = hour > 12 ? hour - 12 : hour;
                    hour = (hour + '').length == 1 ? `0${hour}` : hour;
                    let data = `${hour}: 00 ${part}`
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER TIME", data)
                  this.setState({slottime: data})
                    return (`${hour} ${part}`)
               
            }


    render() {
        const {slottime} = this.state
        const data = this.props.navigation.state.params.data
        if (this.props.navigation.state.params.type == 'Order') {
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
                                        style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center'}]}>
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
        }else{
            console.log("Data=====service===",data)
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
                                        style={[styles.buttoncontainer, styles.row, { justifyContent: 'center', alignItems: 'center'}]}>
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
        margin:10
    }

})