
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import getbestSellerService from '../../services/Products/bestSellerProducts'
import Header from "../../components/Modals/ProductDetailModal/Header";
import Swiper from "react-native-swiper";
import getServiceData from "../../services/ShopServices/getservices";
import DatePicker from 'react-native-datepicker'
import { Picker } from '@react-native-community/picker'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  ScrollView, View,
  BackHandler,
  Alert,
  StatusBar,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Content,
  SafeAreaView,
  Modal,
  Share
} from "react-native";
const { width } = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import moment from 'moment'
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons'
import RBSheet from "react-native-raw-bottom-sheet";
import { sortingProducts } from '../../services/Products/getsubCategory'
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import addToBagProduct from "../AddTobagProduct/addbagproduct";
import ServiceModelComponent from "../Modals/ProductDetailModal/ServiceModel";
import { checktype } from "../../utils/utilis";


function ViewAllProductsPage(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { title } = props

  const [bestseelerpage, setbestseelerpage] = useState(0)
  const [bestSellerProducts, setbestSellerProducts] = useState([])
  const [modalVisible, setmodalVisible] = useState(false)
  const [clickproduct, setclickproduct] = useState({})

  const [selecteditemcolor, setselecteditemcolor] = useState('')
  const [selecteditemSize, setselecteditemSize] = useState('')
  const key = props.navigation.state.params.key

  const [servicemodalVisible, setservicemodalVisible] = useState(false)
  const [service, setservice] = useState({})
  const [selectedSlot, setselectedSlot] = useState('')
  const [slotdate, setslotdate] = useState(moment().format('DD/MM/YYYY'))
  const [serviceData, setserviceData] = useState([])
  const [servicePage, setservicePage] = useState(0)
  const refRBSheet = useRef();

  const [isSelectSort, setisSelectSort] = useState('lowTohigh')

  const [alreadyAddecart, setalreadyAddecart] = useState(false)



  useEffect(() => {
    getBestSellerProducts()
    getServices()

    const backAction = () => {
      props.navigation.goBack()

      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove()
  }, [])

  /**
   * Service All Get
   */
  const getServices = async () => {
    const response = await getServiceData(servicePage)
    if (response.statusCode == 200) {
      if (response.data.length > 0) {
        setservicePage(servicePage + 1)
        setserviceData(servicePage == 0 ? response.data : [...serviceData, ...response.data])

      }
    }
  }

  /**
   * Get Sellers products
   */
  const getBestSellerProducts = async () => {
    const data = await getbestSellerService(bestseelerpage);
    if (data.success) {
      if (data.data.length > 0) {
        setbestseelerpage(bestseelerpage + 1)
        setbestSellerProducts(bestseelerpage == 0 ? data.data : [...bestSellerProducts, ...data.data])
      }
    } else {
    }
  }

  const displaybestproducts = () => {
    return (
      <FlatList
        data={bestSellerProducts}
        nestedScrollEnabled
        renderItem={(item) => {
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => [setclickproduct(item.item), setmodalVisible(true)]}
              style={[styles.productCardConainer, { width: 0.41 * width }]}
            >
              <View style={styles.productCardImageConainer}>
                <ActivityIndicator size={'small'} color={'#000'}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }} />
                

                <Image style={styles.productCardImage} source={ item.item.productImage.length == 0 ? require('../../../assets/images/logo.png') : { uri: item.item.productImage[0] }} />
              </View>
              <Text
                style={styles.productCardPrice}
              >₹ {checktype(item.item.productDetail.price)}</Text>
              <Text style={styles.productCardDescription} numberOfLines={1}>
                {item.item.name}
              </Text>
            </TouchableOpacity>
          )
        }}
        itemDimension={0.41 * width}
        numColumns={2}
        onEndReachedThreshold={0.8}
        onEndReached={getBestSellerProducts}
      />

    )
  }



  const displayserviceData = () => {
    return (
      <FlatList
        data={serviceData}
        renderItem={(item) => {
          return (
            <TouchableOpacity
              style={[styles.productCardConainer, { width: 0.41 * width }]}
              onPress={() => [setservice(item.item), setservicemodalVisible(true)]}
            >

              <View style={styles.productCardImageConainer}>
                <ActivityIndicator size={'small'} color={'#000'}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }} />
                  
                <Image style={styles.productCardImage} source={ item.item.serviceImage.lenth == 0  ? require('../../../assets/images/logo.png') : { uri: item.item.serviceImage[0] }} />
              </View>

              <Text style={styles.productCardPrice}
              >₹ {checktype(item.item.serviceDetail.price)}</Text>
              <Text style={styles.productCardDescription} numberOfLines={1}>
                {item.item.name}
              </Text>
            </TouchableOpacity>
          )
        }}
        // keyExtractor={item => (item._id).toString()}
        numColumns={2}
        itemDimension={0.41 * width}
        onEndReachedThreshold={0.8}
        onEndReached={getServices}
      />
    )
  }
  const onShareservice = async () => {

    await Share.share({
      title: "Shopertino Product",
      dialogTitle: `Shopertino Product: ${service.name}`,
      message: service.name + ',' + service.description + ',' + service.serviceDetail.price,
    });

  }

  const booknow = async (item, selectedSlot, selectedshopID, slotdate) => {
    let userid = await AsyncStorage.getItem('userId')
    setmodalVisible(false)
    setservicemodalVisible(false)
    if (selectedSlot !== '') {

      props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: props.navigation.state.params.appConfig,
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


  /**
   * Sorting Products
   */
  const applysorting = async () => {
    setbestseelerpage(0)
    setbestSellerProducts([])

    setservicePage(0)
    setserviceData([])
    if (bestseelerpage == 0) {
      let order = isSelectSort == 'lowTohigh' ? 'asc' : 'desc'
      let data = `page=${bestseelerpage}&limit=10&sort=productDetail.price&priceLow=10&priceHigh=100000&order=${order}`
      refRBSheet.current.close()
      const response = await sortingProducts(data)
      if (response.statusCode == 200) {
        if (response.data.products.length > 0) {
          setbestseelerpage(bestseelerpage + 1)
          setbestSellerProducts(bestseelerpage == 0 ? response.data.products : [...bestSellerProducts, ...response.data.products])
        }
      }
    }


    console.log("service page", servicePage, serviceData.length)
    if (servicePage == 0) {
      let order = isSelectSort == 'lowTohigh' ? 'asc' : 'desc'
      let data = `page=${servicePage}&limit=10&sort=serviceDetail.price&priceLow=10&priceHigh=100000&order=${order}`
      refRBSheet.current.close()
      const response = await sortingProducts(data)
      if (response.statusCode == 200) {
        if (response.data.services.length > 0) {
          setservicePage(servicePage + 1)
          setserviceData(servicePage == 0 ? response.data.services : [...serviceData, ...response.data.services])
        }
      }
    }
  }
  /**
   * 
   * @param {any} item product data 
   * add to bag product
   */
  const onAddToBag = async (item, color, size, quentity, selectedshopID) => {
    setmodalVisible(!modalVisible)


    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart, color, size, quentity, selectedshopID)
  };


  if (key == 'service') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container} >
          {
            serviceData.length ?
              <View>
                <View>
                  {displayserviceData()}
                </View>


              </View>
              :
              <View style={{ marginBottom: 10 }}>
                <Text>{'No Data Found...'}</Text>
              </View>
          }
        </View>
        <TouchableOpacity onPress={() => [refRBSheet.current.open(), setservicePage(0)]} style={styles.filtercontainer}>
          <Icon name={'filter-list'} color={'#000'} size={20} />
        </TouchableOpacity>

        <ServiceModelComponent
          item={service}
          shippingMethods={props.shippingMethods}
          visible={servicemodalVisible}
          onAddToBag={(item, selectedSlot, selectedshopID, slotdate) => booknow(item, selectedSlot, selectedshopID, slotdate)}
          onCancelPress={() => setservicemodalVisible(!servicemodalVisible)}
          appConfig={props.appConfig}
          navigation={props.navigation}
        />


        <RBSheet
          ref={refRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={false}
          height={210}
          openDuration={250}
          onRequestClose={() => refRBSheet.current.close()}
          customStyles={{
            draggableIcon: {
              backgroundColor: "#a3a3a3",
              width: '20%'
            },
            container: {
              borderTopRightRadius: 50,
              borderTopLeftRadius: 50,
              padding: 10
            }
          }}
        >
          <View style={styles.bottomsortContainer}>
            <TouchableOpacity
              onPress={() => setisSelectSort('lowTohigh')}
              style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <Text style={styles.sortingbottomtxt}>{'Price Low to High'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                {
                  isSelectSort == 'lowTohigh' ?
                    <Icon name={'done'} size={20} color={'#000'} />
                    : null
                }
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setisSelectSort('highTolow')}
              style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <Text style={styles.sortingbottomtxt}>{'Price High to Low'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                {
                  isSelectSort == 'highTolow' ?
                    <Icon name={'done'} size={20} color={'#000'} />
                    : null
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => [applysorting(), setservicePage(0), setserviceData([])]}
              style={styles.applybutton}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
            </TouchableOpacity>

          </View>
        </RBSheet>

      </SafeAreaView>
    )
  } else if (key == 'BestSeller') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.unitContainer}>
          {
            bestSellerProducts.length ?

              <View style={{ marginBottom: 10 }}>
                {displaybestproducts()}
              </View>

              :
              <View style={{ marginBottom: 10 }}>
                <Text>{'No Data Found...'}</Text>
              </View>

          }
          {/* <TouchableOpacity onPress={() => refRBSheet.current.open()} style={styles.filtercontainer} s>
            <Icon name={'filter-list'} color={'#000'} size={28} />
          </TouchableOpacity> */}

          <ProductDetailModal
            item={clickproduct}
            shippingMethods={props.shippingMethods}
            visible={modalVisible}
            onAddToBag={onAddToBag}
            onCancelPress={() => setmodalVisible(!modalVisible)}
            appConfig={props.appConfig}
            navigation={props.navigation}
          />
        </View>
        <TouchableOpacity onPress={() => [refRBSheet.current.open(), setbestseelerpage(0)]} style={styles.filtercontainer}>
          <Icon name={'filter-list'} color={'#000'} size={28} />
        </TouchableOpacity>

        <RBSheet
          ref={refRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={false}
          height={210}
          openDuration={250}
          onRequestClose={() => refRBSheet.current.close()}
          customStyles={{
            draggableIcon: {
              backgroundColor: "#a3a3a3",
              width: '20%'
            },
            container: {
              borderTopRightRadius: 50,
              borderTopLeftRadius: 50,
              padding: 10
            }
          }}
        >
          <View style={styles.bottomsortContainer}>
            <TouchableOpacity
              onPress={() => setisSelectSort('lowTohigh')}
              style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <Text style={styles.sortingbottomtxt}>{'Price Low to High'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                {
                  isSelectSort == 'lowTohigh' ?
                    <Icon name={'done'} size={20} color={'#000'} />
                    : null
                }
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setisSelectSort('highTolow')}
              style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <Text style={styles.sortingbottomtxt}>{'Price High to Low'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                {
                  isSelectSort == 'highTolow' ?
                    <Icon name={'done'} size={20} color={'#000'} />
                    : null
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => [applysorting(), setbestseelerpage(0), setbestSellerProducts([])]}
              style={styles.applybutton}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
            </TouchableOpacity>

          </View>
        </RBSheet>

      </SafeAreaView>
    );
  }
}


export default ViewAllProductsPage;
