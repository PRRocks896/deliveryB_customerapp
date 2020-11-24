import React, { Component } from "react";
import { View, Text, FlatList, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image, Modal, Dimensions, StatusBar, ScrollView, Alert, Share, BackHandler } from "react-native";

import { Searchbar } from 'react-native-paper'
import searchproducts from '../../services/Search/index'
import addToBagProduct from "../../components/AddTobagProduct/addbagproduct";
import searchServiceData from "../../services/ShopServices/searchservice";
import Header from "../../components/Modals/ProductDetailModal/Header";
import { Picker } from '@react-native-community/picker'
import moment from 'moment'
import styles from './styles'
import AsyncStorage from "@react-native-community/async-storage";
import DatePicker from 'react-native-datepicker'

const timedata = [
  { id: 1, item: '01 : 00 Am' },
  { id: 2, item: '02 : 00 Am' },
  { id: 3, item: '03 : 00 Am' },
  { id: 4, item: '04 : 00 Am' },
  { id: 5, item: '05 : 00 Am' },
  { id: 6, item: '06 : 00 Am' },
  { id: 7, item: '07 : 00 Am' },
  { id: 8, item: '08 : 00 Am' },
  { id: 9, item: '09 : 00 Am' },
  { id: 10, item: '10 : 00 Am' },
  { id: 11, item: '11 : 00 Am' },
  { id: 12, item: '12 : 00 Am' },
  { id: 13, item: '13 : 00 Pm' },
  { id: 14, item: '14 : 00 Pm' },
  { id: 15, item: '15 : 00 Pm' },
  { id: 16, item: '16 : 00 Pm' },
  { id: 17, item: '17 : 00 Pm' },
  { id: 18, item: '18 : 00 Pm' },
  { id: 19, item: '19 : 00 Pm' },
  { id: 20, item: '20 : 00 Pm' },
  { id: 21, item: '21 : 00 Pm' },
  { id: 22, item: '22 : 00 Pm' },
  { id: 23, item: '23 : 00 Pm' },
  { id: 24, item: '24 : 00 Pm' },
]
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
class SearchService extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProductDetailVisible: false,
      product: {},
      searchQuery: '',
      searchResultProducts: [],
      alreadyAddecart: false,
      modalVisible: false,
      productData: {},
      selectedSlot: '',
      slotdate :moment().format('DD/MM/YYYY')
    };
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }

 

  onShare = async () => {
    const { productData } = this.state
    await Share.share({
      title: "Shopertino Product",
      dialogTitle: `Shopertino Product: ${productData.name}`,
      message: productData.name + ',' + productData.description + ',' + productData.serviceDetail.price,


    });
  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
  }
  booknow = async (item) => {
    const { productData, selectedSlot } = this.state
    let userid = await AsyncStorage.getItem('userId')
    if (selectedSlot !== '') {
      this.setState({ modalVisible: false })
      this.props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: this.appConfig,
          customerID: userid,
          totalammount: productData.serviceDetail.price,
          slot: selectedSlot,
          shopid: item.serviceDetail.shop_id,
          service_id: productData.serviceDetail._id,
          slot_date: this.state.slotdate,
          booking_number: Math.floor(100000000000 + Math.random() * 900000000000)
        })

    } else {
      Alert.alert("", "Please Select Slot")
    }

  }




  onChangeSearch = async (query) => {
    if (query.length > 0) {
      const data = await searchServiceData(query)
      console.log("data", data.data.length)
      this.setState({ searchResultProducts: data.data })
    } else {
      this.setState({ searchResultProducts: [] })

    }

  }
  render() {
    const { selectedSlot, slotdate,productData, modalVisible, searchResultProducts } = this.state
    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>

          <Searchbar
            placeholder="Search"
            onChangeText={(query) => this.onChangeSearch(query)}
          />
        </TouchableWithoutFeedback >
        {
          searchResultProducts.length ?

            <View style={styles.container}>
              <FlatList
                data={searchResultProducts}
                renderItem={(item) => {
                  return (
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: true, productData: item.item })} style={styles.card}>
                      <Image source={{ uri: item.item.serviceImage }} style={styles.serviceImage} />
                      <View>
                        <Text style={styles.productCardPrice}>₹ {item.item.serviceDetail.price}</Text>
                        <Text style={styles.productCardDescription} numberOfLines={1}>
                          {item.item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                }}
                numColumns={2}
                keyExtractor={(item) => (item._id).toString()}
              />
              {
                modalVisible ?
                  <Modal
                    animationType="slide"
                    transparent={true}
                    hideModalContentWhileAnimating={true}
                    visible={modalVisible}
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    style={styles.modalStyle}
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    backdropOpacity={0.5}
                    deviceWidth={deviceWidth}
                    deviceHeight={deviceHeight}
                    onRequestClose={() => {
                      this.setState({ modalVisible: false })
                    }}
                  >
                    <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
                    <View style={styles.transparentContainer}>
                      <View style={styles.viewContainer}>
                        <ScrollView style={styles.descriptionContainer}>
                          <Header
                            onCancelPress={() => this.setState({ modalVisible: false })}
                            headerContainerStyle={styles.headerContainerStyle}
                            onSharePress={this.onShare} />
                          <Image
                            style={{ width: '100%', height: 200, marginTop: 60 }}
                            resizeMode={'contain'}
                            source={{ uri: productData.serviceImage }}
                          />
                          <Text style={styles.title}>{productData.name}</Text>
                          <Text style={styles.title}>Available Slot : {productData.serviceDetail.serviceSlot[0].start} to {productData.serviceDetail.serviceSlot[0].end}</Text>
                          <Text style={[styles.title, { paddingTop: 5, fontSize: 15, marginTop: 10 }]}>{productData.description}</Text>
                          <View style={styles.inputContainer}>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            date={slotdate}
                                            mode="date"
                                            placeholder="select date"
                                            format="DD-MM-YYYY"
                                            minDate={new Date()}
                                            maxDate={moment().day(17)}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 4,
                                                    marginLeft: 10
                                                },
                                                dateInput: {
                                                    marginLeft: -180,
                                                    borderWidth:0,
                                                    flex:9,
                                                    // backgroundColor:'pink'
                                                }
                                                // ... You can check the source to find the other keys.
                                            }}
                                            onDateChange={(date) =>  this.setState({slotdate: date}) }
                                        />
                                    </View>
                          <View style={styles.inputContainer}>
                            <Picker
                              selectedValue={selectedSlot}
                              style={{ width: '100%', height: 40 }}
                              onValueChange={(itemValue, itemIndex) => {
                                if (productData.serviceDetail.serviceSlot[0].start <= itemIndex && productData.serviceDetail.serviceSlot[0].end >= itemIndex) {
                                  this.setState({ selectedSlot: itemValue })
                                } else {
                                  Alert.alert("", `Plaease Select time Between ${productData.serviceDetail.serviceSlot[0].start} to ${productData.serviceDetail.serviceSlot[0].end}`)
                                }
                              }
                              }>
                              <Picker.Item label="Select Slot" value="" />
                              {
                                timedata.map((item) => {
                                  return (
                                    <Picker.Item label={item.item} value={item.id} key={item.id} />
                                  )

                                })
                              }
                            </Picker>
                          </View>
                          <Text style={styles.price}>₹ {productData.serviceDetail ? productData.serviceDetail.price : null}</Text>
                          <View style={styles.borderLine} />
                          <TouchableOpacity
                            onPress={() => this.booknow(productData)}
                            style={[styles.addToBagContainerStyle, { marginBottom: 20 }]}>
                            <Text style={{ color: '#fff', fontSize: 20 }}>{"Book Now"}</Text>
                          </TouchableOpacity>
                        </ScrollView>

                      </View>
                    </View>
                  </Modal>
                  : null
              }
            </View>
            : null}
      </>
    );
  }
}


export default SearchService
