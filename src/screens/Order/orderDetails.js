import React, { Component } from "react";
import { StyleSheet, Image, FlatList, TextInput, View, Text, TouchableOpacity, PermissionsAndroid, RefreshControl, Linking, Alert } from 'react-native'
import Appstyle from '../../AppStyles'
import { ActivityIndicator, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Geolocation from 'react-native-geolocation-service';
import { connect } from "../../utils/socket";
import getProductsbyProductidService from "../../services/Products/getproductbyproductid";
import { Dialog } from 'react-native-simple-dialogs';
import { AirbnbRating, Rating } from 'react-native-elements';
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";
import { addRating, getRatingbyProduct, getshopRatingbyProduct,shopaddRating  } from "../../services/Review";
import Toast from 'react-native-simple-toast';



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
            longitude: LONGITUDE,



            productsArray: [],
            dialogVisible: false,
            ratingProductId: '',
            review: '',
            ratingvalue: 0,
            ratingLoader: false,

            shopdialogVisible: false,
            ratingShopid:'',
            shoprating:0,
            shopReview:'',
            shopLoader: false

           


        }

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                // this.componentDidMount()

            });
    }
    componentDidMount = async () => {

        console.log("Order Details", this.props.navigation.state.params.data.products[0].product_id.productMasterId)

        this.socket = connect();
        this.socket.on("connection", function (data) {
            console.log("Socket is connect", data)
        })
        this.changedateformate()
        this.permissionforlocation()

        if (this.props.navigation.state.params.type == 'Order') {
            this.getProductDetails()
        }
    }

    getProductDetails = async () => {
        let data = this.props.navigation.state.params.data.products
        let obj
        let products = []
        data.map(async (item) => {
            let id = item.product_id.productMasterId
            const response = await getProductsbyProductidService(id)
            if (response.statusCode == 200) {
                obj = {
                    productname: response.data.name,
                    productdesc: response.data.description,
                    productImg: response.data.productImage[0],
                    productid: response.data._id
                }
                products.push(obj)
            }
        })

        this.setState({ productsArray: products })
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

    getproductReview = async (id) => {
        const response = await getRatingbyProduct(id)
        console.log("response of getting product rating", response)
        if (response.statusCode == 200) {
            console.log("id", response.data[0].rating)
            this.setState({ ratingvalue: response.data[0].rating })
        }
    }

    completedorder = () => {
        const data = this.props.navigation.state.params.data
        return (
            <FlatList
                data={this.state.productsArray}
                renderItem={(item) => {
                    return (
                        <View style={[styles.marginTop, { flexDirection: 'row' }]}>
                            <View style={{ flex: 3 }}>
                                <Image resizeMode={'contain'} style={{ width: '100%', height: 100 }} source={{ uri: item.item.productImg }} />
                            </View>
                            <View style={{ flex: 8 }}>
                                <Text style={styles.tital}>  {item.item.productname}</Text>
                                <Text style={styles.tital}>  {item.item.productdesc}</Text>
                                {
                                    data.status == 'ORDER_COMPLETED' ?
                                        <TouchableOpacity onPress={() => [this.setState({ dialogVisible: true, ratingProductId: item.item.productid }), this.getproductReview(item.item.productid)]}>
                                            <Text style={[styles.tital, { marginTop: 10, color: 'green' }]}>  {'Give Review'}</Text>
                                        </TouchableOpacity>
                                        : null
                                }
                            </View>
                        </View>
                    )
                }}
            />
        )
    }

    ratingCompleted = async () => {
        this.setState({ ratingLoader: true })
        console.log('call', this.state.ratingvalue, this.state.ratingProductId)
        let userid = await AsyncStorage.getItem('userId')
        let body = JSON.stringify({
            "customer_id": userid,
            "rating": this.state.ratingvalue,
            "review": this.state.review
        })
        const response = await addRating(body, this.state.ratingProductId)
        if (response.statusCode == 200) {
            this.setState({ ratingLoader: false, dialogVisible: false, review: '', ratingProductId: '', ratingvalue: 0 })
            Toast.show('Thanks for the rating!!', Toast.SHORT, [
                'UIAlertController',
            ]);
        } else {
            this.setState({ ratingLoader: false, dialogVisible: false, review: '', ratingProductId: '', ratingvalue: 0 })
        }
    }


    ShopratingCompleted = async () => {
        this.setState({ shopLoader: true })
        console.log('call', this.state.shoprating, this.state.ratingShopid)
        let userid = await AsyncStorage.getItem('userId')
        let body = JSON.stringify({
            "customer_id": userid,
            "rating": this.state.shoprating,
            "review": this.state.shopReview
        })
        const response = await shopaddRating(body, this.state.ratingShopid)
        if (response.statusCode == 200) {
            this.setState({ shopLoader: false, shopdialogVisible: false, shopReview: '', ratingShopid: '', shoprating: 0 })
            Toast.show('Thanks for the rating!!', Toast.SHORT, [
                'UIAlertController',
            ]);
        } else {
            this.setState({ shopLoader: false, shopdialogVisible: false, shopReview: '', ratingShopid: '', shoprating: 0 })
        }
    }

    getShopReview =  async (id) => {
        const response = await getshopRatingbyProduct(id)
        console.log("response of getting product rating", response)
        if (response.statusCode == 200) {
            console.log("id", response.data[0].rating)
            this.setState({ shoprating: response.data[0].rating })
        }
    }


    render() {
        const { slottime } = this.state
        const data = this.props.navigation.state.params.data

        console.log("data===========params", data)

        if (this.props.navigation.state.params.type == 'Order') {
            console.log("order", data.status)
            if (data.status == 'PICKUP_READY' || data.status == 'ORDER_PICKED') {
                return (
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={data.products.length > 3 && { height: 380 }}>

                            {this.completedorder()}
                            <View style={[styles.card, { marginTop: 10 }]}>
                                <View style={[styles.row, { marginTop: 10 }]}>
                                    <Text style={styles.tital}>Total amount:  </Text>
                                    <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(data.amount).toFixed(2)}</Text>
                                </View>
                                {
                                    data.hasOwnProperty('delivery_boy') ?
                                        <>
                                            <View style={styles.row}>
                                                <Text style={styles.tital}>  {'Shop Details'}</Text>
                                            </View>
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
                                {
                                    data.hasOwnProperty('shop_id') && data.shop_id !== null ?

                                        <View style={{ marginLeft: 5 }}>
                                            <View style={styles.row}>
                                                <Text style={styles.tital}>  {'Shop Details'}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Icon name={'person'} color={'#a3a3a3'} size={25} />
                                                <Text style={styles.tital}>  {data.shop_id.name}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                                <Text style={styles.tital}>  {data.shop_id.shopAddress}</Text>
                                            </View>

                                        </View>

                                        : <View style={{ marginTop: 10 }}>
                                            <Text>{'Shop Details Not Found!'}</Text>
                                        </View>
                                }

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
                    </View>
                );
            } else {
                return (
                    <View style={{ flex: 1, backgroundColor: '#fff', marginLeft: 10, marginRight: 10 }}>
                        <View style={data.products.length > 3 && { height: 380 }}>
                            {this.completedorder()}

                        </View>
                        <View style={[styles.card, { marginTop: 10 }]}>
                            <View style={[styles.row, { marginTop: 10 }]}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(data.amount).toFixed(2)}</Text>
                            </View>

                            {
                                data.hasOwnProperty('shop_id') && data.shop_id !== null ?
                                    <View style={{ marginLeft: 5 }}>
                                        <View style={styles.row}>
                                            <Text style={styles.tital}>  {'Shop Details'}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Icon name={'person'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.name}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Icon name={'place'} color={'#a3a3a3'} size={25} />
                                            <Text style={styles.tital}>  {data.shop_id.shopAddress}</Text>
                                        </View>

                                        {
                                            data.status == 'ORDER_COMPLETED' ?
                                                <TouchableOpacity onPress={() => [this.setState({ shopdialogVisible: true, ratingShopid: data.shop_id._id }), this.getShopReview(data.shop_id._id)]}>
                                                    <Text style={[styles.tital, { marginTop: 10, color: 'green' }]}>  {'Give Review'}</Text>
                                                </TouchableOpacity>
                                                : null
                                        }
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

                                    : <View style={{ marginTop: 10 }}>
                                        <Text>{'Shop Details Not Found!'}</Text>
                                    </View>}

                        </View>

                        <Dialog
                            visible={this.state.shopdialogVisible}
                            title="Give Rating"
                            onTouchOutside={() => this.setState({ shopdialogVisible: false })} >
                            <View>
                                <AirbnbRating
                                    count={5}
                                    reviews={["Terrible", "Bad", "Good", "Very Good", "Amazing"]}
                                    defaultRating={this.state.shoprating}
                                    size={20}
                                    selectedColor={'#000'}
                                    onFinishRating={(value) => this.setState({ shoprating: value })}
                                />
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.tital}>  {'Review (optional)'} </Text>
                                    <TextInput
                                        style={{ height: 40, borderBottomColor: 'gray', borderBottomWidth: 1, marginTop: 10 }}
                                        onChangeText={text => this.setState({ shopReview: text })}
                                        value={this.state.shopReview}
                                        placeholder={'Add Review'}
                                    />
                                </View>
                                {
                                    this.state.shopLoader ?

                                        <TouchableOpacity
                                            style={[styles.buttoncontainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <ActivityIndicator size={'small'} color={'#000'} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            onPress={() => this.ShopratingCompleted()}
                                            style={[styles.buttoncontainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <Text style={styles.tital}>{'Submit'}</Text>
                                        </TouchableOpacity>
                                }

                            </View>

                        </Dialog>
                        <Dialog
                            visible={this.state.dialogVisible}
                            title="Give Rating"
                            onTouchOutside={() => this.setState({ dialogVisible: false })} >
                            <View>
                                <AirbnbRating
                                    count={5}
                                    reviews={["Terrible", "Bad", "Good", "Very Good", "Amazing"]}
                                    defaultRating={this.state.ratingvalue}
                                    size={20}
                                    selectedColor={'#000'}
                                    onFinishRating={(value) => this.setState({ ratingvalue: value })}
                                />
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.tital}>  {'Review (optional)'} </Text>
                                    <TextInput
                                        style={{ height: 40, borderBottomColor: 'gray', borderBottomWidth: 1, marginTop: 10 }}
                                        onChangeText={text => this.setState({ review: text })}
                                        value={this.state.review}
                                        placeholder={'Add Review'}
                                    />
                                </View>
                                {
                                    this.state.ratingLoader ?

                                        <TouchableOpacity
                                            style={[styles.buttoncontainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <ActivityIndicator size={'small'} color={'#000'} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            onPress={() => this.ratingCompleted()}
                                            style={[styles.buttoncontainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <Text style={styles.tital}>{'Submit'}</Text>
                                        </TouchableOpacity>
                                }

                            </View>

                        </Dialog>

                    </View>
                );
            }
        } else {
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
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(data.amount).toFixed(2)}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.tital}>Payment:  </Text>
                            <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{data.payment_method == 'COD' ? 'He/She has to pay to shop' : 'Already paid'}</Text>
                        </View>
                        {
                            data.hasOwnProperty('shop_id') && data.shop_id !== null ?

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
                                :
                                <View style={{ marginTop: 10 }}>
                                    <Text>{'Shop Details Not Found!'}</Text>
                                </View>
                        }
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