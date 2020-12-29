import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    loadOrderHistory,
    setSubtotalPrice,
    setSelectedShippingMethod,
    setSelectedPaymentMethod,
    setCurrentOrderId
} from "../../redux/";
import getOrder from "../../services/Order";
import AsyncStorage from "@react-native-community/async-storage";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, BackHandler, RefreshControl, Alert, Image } from 'react-native'
import Appstyle from '../../AppStyles'
import moment from "moment";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ActivityIndicator } from "react-native-paper";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons'
import cancelOrderData from "../../services/Order/cancelOrder";
import Toast from 'react-native-simple-toast';
import getAddressviaUSer from "../../services/SavedAddress/getAddressviaUser";
import BookDboy from "../../services/Order/dboyCustomerBooking";
import cancelbookdboyService from "../../services/Order/canceldboyBooking";
import { SafeAreaView } from "react-navigation";
import RBSheet from "react-native-raw-bottom-sheet";

class DBoyOrdersScreen extends Component {
    constructor(props) {
        super(props);
        this.appConfig =
            props.navigation.state.params.appConfig ||
            props.navigation.getParam("appConfig");
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        this.state = {
            orderHistory: [],
            isShowData: true,
            refreshing: false,
            isLoadingorder: true,
            fetchingStatus: false,
            setOnLoad: false,
            isLoading: true,
            filter: 'COMPLETED',
            isLoadingcategory: true
        }
        this.page = 0
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()

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


    getOrders = async () => {
        var that = this;
        that.page = that.page + 1;
        let userid = await AsyncStorage.getItem('userId')
        let body = JSON.stringify({
            "where": {
                "status": this.state.filter
            },
            "pagination": {
                "sortBy": "delivery_charge",
                "descending": true,
                "rowsPerPage": 500,
                "page": 1
            }
        })

        const data = await BookDboy(body, userid)
        console.log("orders==============================BookDboy", data)

        if (data.success) {
            this.setState({ orderHistory: data.data, isLoadingcategory: false })
            // that.setState({ orderHistory:  that.page == 1 ? data.data : [...this.state.orderHistory, ...data.data], isLoadingorder: false , isLoading: false, setOnLoad: true})
        }
        if (data.data.length !== 0) this.setState({ isShowData: true })
        else if (data.data.length == 0 || data.data.length == undefined) this.setState({ isShowData: false })
    }
    /**
        * Delete book services
        * @param {any} id 
        */
    deleteOrder = async (id) => {
        console.log("delete service", id)
        Alert.alert(
            "",
            "Are You Sure You Want To Cancel Booking",
            [{
                text: 'YES',
                onPress: () => this.removeorder(id)
            }, { text: 'NO' }],
            { cancelable: true }
        );


    }
    /**
     * Remove service api call
     * @param {any} id 
     */
    removeorder = async (id) => {
        const response = await cancelbookdboyService(id)
        console.log("Cancel boking==================", response)
        if (response.statusCode == 200) {
            Toast.show(response.data.status, Toast.LONG);
            this.getOrders()
        }
    }

    getOrderList = () => {

        const { orderHistory, refreshing } = this.state
        return (
            <SwipeListView
                data={orderHistory}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    this.getOrders()
                }} />}

                renderItem={(item) => {
                    const orderdate = moment(item.item.updatedAt).format('DD/MM/YYYY HH:mm')

                    return (
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('DBoyOrderDetailsScreen', { data: item.item })} style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Your Booking number :  </Text>
                                <Text style={styles.subtitle}>{item.item.booking_number}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.tital}>Booking Status:  </Text>
                                <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{item.item.status}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.tital}>Total amount:  </Text>
                                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(item.item.delivery_charge).toFixed(2)}</Text>
                            </View>

                            <View style={[styles.row, { position: 'absolute', right: 10, bottom: 10, marginTop: 10 }]}>
                                <Text style={styles.timedate}>{orderdate}</Text>
                            </View>

                            <View>

                            </View>
                        </TouchableOpacity>
                    )
                }}
                renderHiddenItem={(item, rowMap) => {
                    if (item.item.status == 'BOOKING_PLACED') {

                        return (
                            <View style={[styles.rowBack, { marginTop: 4, backgroundColor: '#fff', alignSelf: 'flex-end' }]}>

                                <TouchableOpacity
                                    onPress={() => this.deleteOrder(item.item._id)}
                                    style={{ marginRight: 10 }}>
                                    <Icon name={'delete'} size={25} color={'red'} />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                }}
                rightOpenValue={-75}

            />

        )
    }
    BottomView = () => {
        return (
            <View>
                {
                    (this.state.fetchingStatus)
                        ?
                        <ActivityIndicator size="large" color="#000" style={{ marginLeft: 6 }} />
                        :
                        null
                }
            </View>
        )
    }
    render() {
        const { filter, orderHistory } = this.state

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
                <SafeAreaView style={{ flex: 1 }}>
                    { orderHistory.length ?
                        this.getOrderList()
                        :
                        <View style={styles.emptyView}>
                              <Image style={{width:300, height:300, marginTop:-100}} resizeMode={'contain'} source={require('../../../assets/images/dboy.png')} />
                            <Text style={[styles.text, { fontSize: 20, marginTop:-50 }]}>You haven't book any Delivery boy yet!</Text>
                        </View>
                    }
                    <TouchableOpacity onPress={() => this.RBSheet.open()} style={styles.filtercontainer}>
                        <Icon name={'filter-list'} color={'#000'} size={28} />
                    </TouchableOpacity>
                    <RBSheet
                        ref={ref => {
                            this.RBSheet = ref;
                        }}
                        height={300}
                        openDuration={250}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            container: {
                                borderTopLeftRadius: 50,
                                borderTopRightRadius: 50
                            },
                            draggableIcon: {
                                backgroundColor: "#000"
                            }
                        }}
                    >
                        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                            <TouchableOpacity style={styles.row} onPress={() => this.setState({ filter: 'BOOKING_PLACED' })}>
                                <View style={{ flex: 10 }}>
                                    <Text style={styles.filtertxt}>{'BOOKING PLACED'}</Text>
                                </View>
                                {
                                    filter == 'BOOKING_PLACED' ?
                                        <View style={{ flex: 2 }}>
                                            <Icon name={'done'} color={'#000'} size={30} style={{ marginTop: 5 }} />
                                        </View>
                                        : null
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.row} onPress={() => this.setState({ filter: 'BOOKING_ACCEPTED' })}>
                                <View style={{ flex: 10 }}>
                                    <Text style={styles.filtertxt}>{'BOOKING ACCEPTED'}</Text>
                                </View>
                                {
                                    filter == 'BOOKING_ACCEPTED' ?
                                        <View style={{ flex: 2 }}>
                                            <Icon name={'done'} color={'#000'} size={30} style={{ marginTop: 5 }} />
                                        </View>
                                        : null
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.row} onPress={() => this.setState({ filter: 'BOOKING_REJECTED' })}>
                                <View style={{ flex: 10 }}>
                                    <Text style={styles.filtertxt}>{'BOOKING REJECTED'}</Text>
                                </View>
                                {
                                    filter == 'BOOKING_REJECTED' ?
                                        <View style={{ flex: 2 }}>
                                            <Icon name={'done'} color={'#000'} size={30} style={{ marginTop: 5 }} />
                                        </View>
                                        : null
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.row} onPress={() => this.setState({ filter: 'COMPLETED' })}>
                                <View style={{ flex: 10 }}>
                                    <Text style={styles.filtertxt}>{'COMPLETED'}</Text>
                                </View>
                                {
                                    filter == 'COMPLETED' ?
                                        <View style={{ flex: 2 }}>
                                            <Icon name={'done'} color={'#000'} size={30} style={{ marginTop: 5 }} />
                                        </View>
                                        : null
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.row} onPress={() => this.setState({ filter: 'BOOKING_CANCELLED' })}>
                                <View style={{ flex: 10 }}>
                                    <Text style={styles.filtertxt}>{'BOOKING CANCELLED'}</Text>
                                </View>
                                {
                                    filter == 'BOOKING_CANCELLED' ?
                                        <View style={{ flex: 2 }}>
                                            <Icon name={'done'} color={'#000'} size={30} style={{ marginTop: 5 }} />
                                        </View>
                                        : null
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => [this.getOrders(), this.RBSheet.close()]}
                                style={styles.applybutton}>
                                <Text style={{ color: '#a3a3a3', fontSize: 15 }}>{"Proceed"}</Text>
                            </TouchableOpacity>
                        </View>
                    </RBSheet>
                </SafeAreaView>
            );
        }



    }
}



export default DBoyOrdersScreen


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
    }, rowBack: {
        alignItems: 'center',
        backgroundColor: '#a3a3a3',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        marginTop: 10
    },
    filtercontainer: {
        width: 50,
        height: 50,
        position: 'absolute',
        borderRadius: 360,
        backgroundColor: '#e7e7e7',
        bottom: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    filtertxt: {
        padding: 5,
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 16,
        paddingLeft: 15

    },
    applybutton: {
        height: 40,
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        width: '40%',
        alignSelf: 'center',
        borderColor: '#000',
        borderWidth: 1

    }
})