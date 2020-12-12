import React, { Component } from "react";
import { View, Text, FlatList, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image, Modal, Dimensions, StatusBar, ScrollView, Alert, Share, BackHandler } from "react-native";
import { Searchbar } from 'react-native-paper'
import searchServiceData from "../../services/ShopServices/searchservice";
import moment from 'moment'
import styles from './styles'
import AsyncStorage from "@react-native-community/async-storage";
import ServiceModelComponent from "../../components/Modals/ProductDetailModal/ServiceModel";
import { checktype } from "../../utils/utilis";

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
      slotdate: moment().format('DD/MM/YYYY')
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
  booknow = async (item,  selectedSlot, selectedshopID, slotdate) => {
 
    let userid = await AsyncStorage.getItem('userId')
    if (selectedSlot !== '') {
      this.setState({ modalVisible: false })
      this.props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: this.appConfig,
          customerID: userid,
          totalammount: item.serviceDetail.price,
          slot: selectedSlot,
          shopid: selectedshopID,
          service_id: item.serviceDetail._id,
          slot_date: slotdate,
          booking_number: Math.floor(100000000000 + Math.random() * 900000000000)
        })

    } else {
      Alert.alert("", "Please Select Slot")
    }

  }




  onChangeSearch = async (query) => {
    if (query.length > 0) {
      const data = await searchServiceData(query)
      this.setState({ searchResultProducts: data.data })
    } else {
      this.setState({ searchResultProducts: [] })

    }

  }
  render() {
    const { productData, modalVisible, searchResultProducts } = this.state
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
                  console.log("Image", item)
                  return (
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: true, productData: item.item })} style={styles.card}>
                      <Image source={{ uri: item.item.serviceImage[0] }} style={styles.serviceImage} />
                      <View>
                        <Text style={styles.productCardPrice}>₹ {checktype(item.item.serviceDetail.price)}</Text>
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

              <ServiceModelComponent
                item={productData}
                shippingMethods={this.props.shippingMethods}
                visible={modalVisible}
                onAddToBag={(item, selectedSlot, selectedshopID, slotdate) => this.booknow(item, selectedSlot, selectedshopID, slotdate)}
                onCancelPress={() => this.setState({ modalVisible: !this.state.modalVisible})}
                appConfig={this.props.appConfig}
                navigation={this.props.navigation}
              />
             
            </View>
            : null}
      </>
    );
  }
}


export default SearchService
