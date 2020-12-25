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
import { StyleSheet, FlatList, View, Text, TouchableOpacity, BackHandler, RefreshControl , Alert} from 'react-native'
import Appstyle from '../../AppStyles'
import moment from "moment";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ActivityIndicator } from "react-native-paper";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons'
import cancelOrderData from "../../services/Order/cancelOrder";
import Toast from 'react-native-simple-toast';
import getAddressviaUSer from "../../services/SavedAddress/getAddressviaUser";

class OrdersScreen extends Component {
  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    this.state = {
      orderHistory: [],
      isShowData: true,
      refreshing : false, 
      isLoadingorder: true,
      fetchingStatus: false,
      setOnLoad: false,
      isLoading: true,
    }
    this.page = 0
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.componentDidMount()

      });
  }

  componentDidMount() {
    this.getAddressid()
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
   * Get Address id 
   * For get Orders
   */
   getAddressid = async () => {
    let userid = await AsyncStorage.getItem('userId')
    
    // get address via user
    const data = await getAddressviaUSer(userid);
    
    if (data.data) {
      let dataAddress =  data.data.address.filter(item => item.isDefault == true)
      AsyncStorage.setItem("CustomerAddress", JSON.stringify(dataAddress[0]))
      AsyncStorage.setItem("AddressId", data.data._id)

    }
  }
  getOrders = async () => {
    var that = this;
    that.page = that.page + 1;
    let addressid = await AsyncStorage.getItem('AddressId')
    let body = JSON.stringify({
      "where": {
        "available": "true"
      },
      "pagination": {
        "sortBy": "createdAt",
        "descending": true,
        "rowsPerPage": 500,
        "page": 1
      }
    })
    const data = await getOrder(addressid, body)
    // console.log("addressid", data)
      if (data.success) {
        this.setState({ orderHistory: data.data})
        // that.setState({ orderHistory:  that.page == 1 ? data.data : [...this.state.orderHistory, ...data.data], isLoadingorder: false , isLoading: false, setOnLoad: true})
      }
    if (data.data.length !== 0) this.setState({ isShowData: true })
    else if (data.data.length == 0 || data.data.length == undefined) this.setState({ isShowData: false })
  }
 /**
     * Delete book services
     * @param {any} id 
     */
    deleteOrder = async(id) => {
      console.log("delete service", id)
      Alert.alert(
          "",
         "Are You Sure You Want To Cancel Order",
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
  removeorder = async(id) => {
      const response = await cancelOrderData(id)
      console.log("Cancel Order", response)
      if(response.statusCode == 200){
          Toast.show(response.data.status, Toast.LONG);
          this.getOrders()
      }
  }

  getOrderList = () => {

    const { orderHistory ,refreshing} = this.state
    return (
      <SwipeListView
      data={orderHistory}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
        this.getOrders()
      }} />}
                
                renderItem={(item) => {
                  const orderdate = moment(item.item.createdAt).format('DD/MM/YYYY HH:mm')

                    return (
                      <TouchableOpacity onPress={ () => this.props.navigation.navigate('OrderDetailsScreen', { type:'Order', data: item.item})} style={styles.card}>
                      <View style={styles.row}>
                        <Text style={styles.tital}>Your Order number :  </Text>
                        <Text style={styles.subtitle}>{item.item.order_number}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.tital}>Order Status:  </Text>
                        <Text style={[styles.subtitle, { color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{item.item.status}</Text>
                      </View>
                
                      <View style={styles.row}>
                        <Text style={styles.tital}>Total amount:  </Text>
                        <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{(item.item.amount).toFixed(2)}</Text>
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
                    if(item.item.status == 'ORDER_PLACED'){

                        return(
                        <View style={[styles.rowBack, { marginTop: 4, backgroundColor: '#fff', alignSelf: 'flex-end' }]}>
    
                            <TouchableOpacity
                                onPress={() => this.deleteOrder(item.item._id)}
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
    if (this.state.isShowData == true) {
      if(this.state.isLoadingcategory == true){
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
      }else{
        return (
          <>
            {this.getOrderList()}
          </>
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

OrdersScreen.propTypes = {
  navigation: PropTypes.object,
  orderHistory: PropTypes.array,
  user: PropTypes.object,
  loadOrderHistory: PropTypes.func,
  setSubtotalPrice: PropTypes.func,
  setSelectedShippingMethod: PropTypes.func,
  setSelectedPaymentMethod: PropTypes.func,
  setCurrentOrderId: PropTypes.func
};

const mapStateToProps = ({ products, app }) => {
  return {
    categories: products.categories,
    allProducts: products.allProducts,
    orderHistory: products.orderHistory,
    user: app.user
  };
};

export default connect(
  mapStateToProps,
  {
    loadOrderHistory,
    setSubtotalPrice,
    setSelectedShippingMethod,
    setSelectedPaymentMethod,
    setCurrentOrderId
  }
)(OrdersScreen);


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
  shopmainSkeleton:{
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

})