import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Order } from "../../components";
import { firebaseDataManager } from "../../apis";
import {
  loadOrderHistory,
  setSubtotalPrice,
  setSelectedShippingMethod,
  setSelectedPaymentMethod,
  setCurrentOrderId
} from "../../redux/";
import getOrder from "../../services/Order";
import AsyncStorage from "@react-native-community/async-storage";
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native'
import Appstyle from '../../AppStyles'
import moment from "moment";
class OrdersScreen extends Component {
  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.state = {
      orderHistory: [],
      isShowData: true
    }
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getOrders()

      });

  }

  componentDidMount() {
    this.getOrders()
  }

  getOrders = async () => {
    let userid = await AsyncStorage.getItem('userId')
    let body = JSON.stringify({
      "where": {
        "available": "true"
      },
      "pagination": {
        "sortBy": "createdAt",
        "descending": true,
        "rowsPerPage": 30,
        "page": 1
      }
    })
    const data = await getOrder(userid, body)
    console.log("length", data.data)
    if (data.data.length !== 0) this.setState({ isShowData: true })
    else if (data.data.length == 0 || data.data.length == undefined) this.setState({ isShowData: false })
    if (data.success) {
      this.setState({ orderHistory: data.data.list })
    }
  }


  getOrderList = () => {

    const { orderHistory } = this.state
    return (
      <FlatList
        data={orderHistory}
        renderItem={(item, index) => {
          const date = moment(item.item.updatedAt.split('T')[0]).format('DD/MM/YYYY')
          const time = moment(item.item.updatedAt.split('T')[1], "HH:mm").format("LT")
          return (
            <View style={styles.card}>
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
                <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}>{item.item.amount}</Text>
              </View>

              <View style={[styles.row, { position: 'absolute', right: 10, bottom: 10, marginTop: 10 }]}>
                <Text style={styles.timedate}>{date} - {time}</Text>
              </View>

              <View>

              </View>
            </View>
          )
        }}

      />
    )
  }

  render() {
    if (this.state.isShowData == true) {
      return (
        <>
          {this.getOrderList()}
        </>
      );
    } else {
      console.log("call else")
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
    color: '#FF0000',
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
  }
})