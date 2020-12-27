
import React, { Component } from "react";
import { ScrollView, View, BackHandler, Alert, RefreshControl, Text, FlatList, Dimensions, PermissionsAndroid, sTouchableOpacity, ActivityIndicator, Image, Content, SafeAreaView } from "react-native";
import { connect } from "../../utils/socket";
import Geolocation from 'react-native-geolocation-service';
import DrawerDeliveryBoyList from "./drawerdboyhire";
import Appstyle from '../../AppStyles'

class DeliveryboyhireddrawerScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            dboyData: [],
            customerLat: 22.2856,
            customerLong: 70.7561
        };
        this.appConfig =
            props.navigation.state.params.appConfig ||
            props.navigation.getParam("appConfig");

    }


    componentDidMount = () => {
        this.permissionforlocation()
    }
    permissionforlocation = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Tribata shop app',
                    'message': 'Example App access to your location '
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // Get Current Location 
                this.getLocation();

            } else {
                alert("Location permission denied");
            }
        } catch (err) {
            console.warn(err)
        }
    }

    getLocation = async () => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log("Position", position.coords.latitude, position.coords.longitude)
                this.setState({ customerLat: position.coords.latitude, customerLong: position.coords.longitude })
                this.getDeliveryboyList(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                Alert.alert(error.message);
            },
            { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
        );
    }

    getDeliveryboyList = async (lat, long) => {
        console.log("Lat Long for d boy", lat, long)
        this.socket = connect();
        let body = {
            lat: lat,
            long: long
        }
        const result = await new Promise(async (resolve, reject) => {
            await this.socket.emit('getNearByDeliveryBoys', body, function (data) {
                console.log("On customer app socket response", data)
                if (data.status) {
                    resolve(data.deliveryboyDetails);

                } else {
                    reject(data.message);
                }
            });
        })
        // console.log('Result: ', result);
        this.setState({ dboyData: result })

    }
    render() {
        const { customerLat, customerLong, dboyData } = this.state
        return (
            <View style={{flex:1}}>
                {
                    dboyData.length ?
                        <DrawerDeliveryBoyList
                            title={"Hire Delivery Boy"}
                            navigation={this.props.navigation}
                            appConfig={this.appConfig}
                            dboylist={dboyData}
                            customerLat={customerLat}
                            customerLong={customerLong}
                            callFunction={() => this.permissionforlocation()}
                        />
                        :
                        <View style={{ justifyContent:'center', alignItems:'center', flex:1}}>
                           <Image style={{width:300, height:300, marginTop:-100}} resizeMode={'contain'} source={require('../../../assets/images/dboy.png')} />
                           <Text style={{fontFamily:Appstyle.fontFamily.boldFont, fontSize:20, marginTop:-50}}>{'Currently No Delivery Boy Available'}</Text>
                        </View>
                }

            </View>
        );
    }
}



export default DeliveryboyhireddrawerScreen
