import React, { useEffect, useState, useRef } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, PermissionsAndroid, Alert, Share, ActivityIndicator, StyleSheet, } from "react-native";
import styles from "../styles";
import { useColorScheme } from "react-native-appearance";
import { getshopeListbyType, getshopTypeList } from "../../../services/Shop";
import RBSheet from "react-native-raw-bottom-sheet";
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Component } from "react";
import Geolocation from 'react-native-geolocation-service';
import getkmgoogleapi from "../../../services/Googleapi/googleapi";
import api from "../../../services/url.service";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import AppStyles from '../../../AppStyles'
let time = '';
class AllShopListScreen extends Component {


    static navigationOptions = ({ navigation, screenProps }) => {
        console.log("navigation.state.params", navigation.state.params)
        // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
        return {
            title:
                typeof navigation.state.params === "undefined" ||
                    typeof navigation.state.params.title === "undefined"
                    ? "Shop"
                    : (navigation.state.params.title).replace(/_/g, " "),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            shopArray: [],
            customerLat: '',
            customerLong: '',
            isLoading: true

        };
        this.appConfig =
            props.navigation.state.params.appConfig ||
            props.navigation.getParam("appConfig");

    }

    componentDidMount = () => {
        this.permissionforlocation()

    }

    /**
  * Permission for locations
  */
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

    /**
    * Get Current Locations
    */
    getLocation = async () => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log("Position", position.coords.latitude, position.coords.longitude)
                this.setState({ customerLat: position.coords.latitude, customerLong: position.coords.longitude })
                this.getshopListData(position.coords.latitude, position.coords.longitude)
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


    getshopListData = async (clat, clong) => {
        let typeid = this.props.navigation.state.params.id
        let body = JSON.stringify({
            "where": {},
            "pagination": {
                "sortBy": "name",
                "descending": 0,
                "rowsPerPage": 10,
                "page": 1
            }
        })
        const response = await getshopeListbyType(body, typeid)
        if (response.statusCode == 200) {

            let datares = response.data.list
            datares.map(async (item) => {
                let data = `origins=${clat},${clong}&destinations=${item.shopLatitude},${item.shopLongitude}&key=AIzaSyAAyBoIK3-3psCrVDMpZCKj5zaMmDAPp0I`
                let responseofgoogle = await getkmgoogleapi(data)
                if (responseofgoogle.status == 'OK') {
                    let responsedata = responseofgoogle.rows[0].elements
                    if (responsedata !== 'ZERO_RESULTS') {
                        time = responsedata[0].duration.text
                        if(time.split(' ')[1] == 'min' || time.split(' ')[1] == 'mins'){
                            let mintime = time.split(' ')[0]
                            let timemin = parseFloat(mintime) + 10 
                            time = timemin + ' mins'
                            console.log("added time in mins", time)
                        } else if(time.split(' ')[1] == 'hour' || time.split(' ')[1] == 'hours'){
                            let datatime = time.split(' ')[2]
                            let hourtime =  parseFloat(datatime) + 10 
                            time =  time.split(' ')[0] + ' ' + time.split(' ')[1] + ' ' +hourtime + ' ' + 'mins'  
                            console.log("added time in hours",time)
                        }
                        var result = datares.map(function (el) {
                            var o = Object.assign({}, el);
                            o.time = time;
                            return o;
                        })
                        this.setState({ shopArray: result, isLoading: false })
                    }
                }
            })
        } else {
            this.setState({ isLoading: false })
        }
    }

    getshopkm(lat1, lon1, lat2, lon2, unit = 'K') {

        console.log(lat1, lon1, lat2, lon2)
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }

            console.log("distance ", dist)

            let distance = (dist).toFixed(2)
            return distance;
        }

    }


    displayShopNames = () => {
        const { shopArray, customerLat, customerLong } = this.state
        return (
            <FlatList
                data={shopArray}
                renderItem={(item) => {
                    return (
                        <View style={[styless.card, { flexDirection: 'row', marginTop: 10 }]}>
                            <View style={{ flex: 3.5, justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    item.item.shopImage ?
                                        <Image resizeMode={'contain'} style={{ width: 150, height: 100 }} source={{ uri: item.item.shopImage }} />
                                        :
                                        <Image resizeMode={'contain'} style={{ width: 80, height: 80 }} source={require('../../../../assets/images/logo.png')} />
                                }
                            </View>
                            <View style={{ flex: 7, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row' }}>

                                    <Text style={[styless.shopTitle, { fontSize: 18 }]}> {item.item.name}  </Text>
                                    {
                                        item.item.isVerified ?
                                            <Icons name='check-decagram' size={20} color={'#36D8FF'} style={{ marginTop: 10, marginLeft: 10 }} />
                                            : null
                                    }
                                </View>
                                <Text style={styless.shopAddress}> {item.item.shopAddress}  </Text>
                                <Text style={[styless.shopkm,  {marginBottom:5}]}> Open:  {item.item.openingTime ? item.item.openingTime : '00'} : 00 - {item.item.closingTime ? item.item.closingTime : '00'} : 00</Text>
                                <View style={styless.border} />
                                <Text style={[styless.shopkm, { marginTop: 5 }]}> {this.getshopkm(customerLat, customerLong, item.item.shopLatitude, item.item.shopLongitude, 'K')} kms - {item.item.time} delivery  </Text>
                            </View>
                        </View>
                    )
                }}
            />
        )
    }

    render() {

        const { shopArray, isLoading } = this.state
        console.log("isloding", isLoading)
        if (isLoading) {
            return (
                <SkeletonPlaceholder>
                <View style={styless.shopmainSkeleton}>
                 <View style={styless.shopCategorySkeleton} />
               </View>
               <View style={styless.shopmainSkeleton}>
                 <View style={styless.shopCategorySkeleton} />
               </View>
               <View style={styless.shopmainSkeleton}>
                 <View style={styless.shopCategorySkeleton} />
               </View>
               <View style={styless.shopmainSkeleton}>
                 <View style={styless.shopCategorySkeleton} />
               </View>
             </SkeletonPlaceholder>

            )
        } else {
            return (

                <View style={ {marginLeft:5, marginRight:5, flex: 1}} >
                    {
                        shopArray !== null && shopArray.length !== 0 ? this.displayShopNames()
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text>{'No Shop Found'}</Text>
                            </View>
                    }
                </View>
            );

        }
    }
}



export default AllShopListScreen;


const styless = StyleSheet.create({
    shopmainSkeleton:{
        flexDirection: "row", alignItems: "center"
      },
      shopCategorySkeleton: {
        width: 350,
        height: 80,
        margin: 20,
        borderRadius: 10
      },
      
      shopTitle:{
        fontSize: 15,
        fontFamily: AppStyles.fontFamily.boldFont,
      },
      shopAddress:{
        fontSize: 15,
        fontFamily: AppStyles.fontFamily.regularFont,
      },
      shopkm:{
        fontSize: 14,
        fontFamily: AppStyles.fontFamily.regularFont,  
      },
      card: {
        marginTop: 5,
        backgroundColor: '#fff',
        padding: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5,
      },
      border:{
        borderWidth: 0.5,
        borderRadius: 1,
        flex: 1,
        height: 1,
        flexDirection: 'row',
        borderColor: '#e7e7e7',
        
      }
})