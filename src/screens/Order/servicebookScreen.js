import React, { Component } from "react";
import getOrder from "../../services/Order";
import AsyncStorage from "@react-native-community/async-storage";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, BackHandler, RefreshControl, Alert, Linking } from 'react-native'
import Appstyle from '../../AppStyles'
import moment from "moment";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ActivityIndicator } from "react-native-paper";
import getservicebookbyid from "../../services/ShopServices/servicebycustomerid";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons'
import cancelServiceData from '../../services/ShopServices/cancelservice'
import Toast from 'react-native-simple-toast';
import { ScrollView } from "react-native-gesture-handler";

class ServicebookDetails extends Component {
    constructor(props) {
        super(props);
        // this.appConfig =
        //     props.navigation.state.params.appConfig ||
        //     props.navigation.getParam("appConfig");
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        this.state = {
            orderHistory: [],
            isShowData: true,
            refreshing: false,
            isLoadingorder: true,
            fetchingStatus: false,
            setOnLoad: false,
            isLoading: true,
            isLoadingcategory: true
        }
        this.page = 0
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()
                this.getOrders()

            });
    }

    componentDidMount() {
        this.getOrders()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

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
     * get service book orders
     */
    getOrders = async () => {
        var that = this;
        that.page = that.page + 1;
        let userid = await AsyncStorage.getItem('userId')
        let body = JSON.stringify({
            "where": {

            },
            "pagination": {
                "sortBy": "ace",
                "descending": true,
                "rowsPerPage": 500,
                "page": 1
            }
        })

        const data = await getservicebookbyid(userid, body)
        if (data.success) {
            this.setState({ orderHistory: data.data , isLoadingcategory: false})
            // that.setState({ orderHistory:  that.page == 1 ? data.data : [...this.state.orderHistory, ...data.data], isLoadingorder: false , isLoading: false, setOnLoad: true})
        }
        if (data.data.length !== 0) this.setState({ isShowData: true })
        else if (data.data.length == 0 || data.data.length == undefined) this.setState({ isShowData: false })
    }

/**
 * display booked orders
 */
    getOrderList = () => {

        const { orderHistory, refreshing } = this.state
        return (
            <SwipeListView
                data={orderHistory}
                
                renderItem={(item) => {
                    const orderdate = moment(item.item.createdAt).format('DD/MM/YYYY HH:mm')

                    return (
                        <TouchableOpacity style={styles.card} onPress={() =>  this.props.navigation.navigate('OrderDetailsScreen', { type:'Service', data: item.item})} style={styles.card }>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Your Service number :  </Text>
                                <Text style={styles.subtitle}>{item.item.booking_number}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Service Status:  </Text>
                                <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{item.item.status}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Slot Date:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{item.item.slot_date}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(item.item.amount).toFixed(2)}</Text>
                            </View>

                            <View style={[styles.row, { position: 'absolute', right: 10, bottom: 10, marginTop: 10 }]}>
                                <Text style={styles.timedate}>{orderdate}</Text>
                            </View>

                        </TouchableOpacity>
                    )
                }}
                renderHiddenItem={(item, rowMap) => {
                    if(item.item.status !== 'BOOKING_CANCELLED'){

                        return(
                        <View style={[styles.rowBack, { marginTop: 4, backgroundColor: '#fff', alignSelf: 'flex-end' }]}>
    
                            <TouchableOpacity
                                onPress={() => this.deleteservice(item.item._id)}
                                style={{ marginRight: 10 }}>
                                <Icon name={'delete'} size={25} color={'red'} />
                            </TouchableOpacity>
                        </View>
                    )
                    }}}
                rightOpenValue={-75}
               
            />

        )
    }
    /**
     * Delete book services
     * @param {any} id 
     */
    deleteservice = async(id) => {
        console.log("delete service", id)
        Alert.alert(
            "",
           "Are You Sure You Want To Cancel Service",
           [{
            text: 'YES',
            onPress: () => this.removeservice(id)
          }, { text: 'NO' }],
            { cancelable: true }
          );

       
    }
    /**
     * Remove service api call
     * @param {any} id 
     */
    removeservice = async(id) => {
        const response = await cancelServiceData(id)
        console.log("Cancel service", response)
        if(response.statusCode == 200){
            Toast.show(response.data.status, Toast.LONG);
            this.getOrders()
        }
    }
   
    render() {
        if (this.state.isShowData == true) {
            if (this.state.isLoadingcategory == true) {
                return (
                    <SkeletonPlaceholder>
                        <View style={styles.shopmainSkeleton}>
                            <View style={styles.shopCategorySkeleton} />
                        </View>
                        <View style={styles.shopmainSkeleton}>
                            <View style={styles.shopCategorySkeleton} />
                        </View>
                        <View style={styles.shopmainSkeleton}>
                            <View style={styles.shopCategorySkeleton} />
                        </View>
                        <View style={styles.shopmainSkeleton}>
                            <View style={styles.shopCategorySkeleton} />
                        </View>
                    </SkeletonPlaceholder>
                )
            } else {
                return (
                    <ScrollView   refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                        this.getOrders()
                    }} />}
                         contentContainerStyle={{flexGrow:1}} >
                        {this.getOrderList()}
                    </ScrollView>
                );
            }
        } else {
            return (
                <View style={styles.emptyView}>
                    <Text style={[styles.text, { fontSize: 20 }]}>No Orders or transactions found.</Text>
                    <TouchableOpacity style={[styles.footerContainer, { borderRadius: 5 }]} onPress={() => this.props.navigation.navigate("Home")}>
                        <Text style={styles.footerbtn}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
}



export default ServicebookDetails


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
    timedate: {
        color: '#a3a3a3',
        fontSize: 12,
        fontFamily: Appstyle.fontFamily.semiBoldFont
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 15
    },
    footerContainer: {
        width: '60%',
        height: 50,
        backgroundColor: '#333333',
        borderTopColor: '#FFf',
        borderTopWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10

    },
    footerbtn: {
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 20,
        color: '#fff',
        textAlignVertical: 'center'
    },
    shopCategorySkeleton: {
        width: 350,
        height: 80,
        margin: 20,
        borderRadius: 10
    },
    shopmainSkeleton: {
        flexDirection: "row", alignItems: "center"
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#a3a3a3',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        marginTop: 10
    },

})