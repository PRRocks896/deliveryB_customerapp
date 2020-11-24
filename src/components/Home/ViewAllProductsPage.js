
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
                <Image style={styles.productCardImage} source={{ uri: item.item.productImage[0] }} />
              </View>
              <Text
                style={styles.productCardPrice}
              >₹ {item.item.productDetail.price}</Text>
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

  const onShare = async () => {

    await Share.share({
      title: "Shopertino Product",
      dialogTitle: `Shopertino Product: ${clickproduct.name}`,
      message: clickproduct.name + ',' + clickproduct.description + ',' + clickproduct.productDetail.price,
    });

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
                <Image style={styles.productCardImage} source={{ uri: item.item.serviceImage[0] }} />
              </View>

              <Text style={styles.productCardPrice}
              >₹ {item.item.serviceDetail.price}</Text>
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

  const booknow = async (item) => {

    let userid = await AsyncStorage.getItem('userId')
    setmodalVisible(false)
    if (selectedSlot !== '') {
      props.navigation.navigate('ServicePaymentOptions',
        {
          appConfig: props.navigation.state.params.appConfig,
          customerID: userid,
          totalammount: service.serviceDetail.price,
          slot: selectedSlot,
          shopid: item.serviceDetail.shop_id,
          service_id: service.serviceDetail._id,
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
    if (bestseelerpage == 0 && bestSellerProducts.length == 0) {
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



    if (servicePage == 0 && serviceData.length == 0) {
      let order = isSelectSort == 'lowTohigh' ? 'asc' : 'desc'
      let data = `page=${servicePage}&limit=10&sort=productDetail.price&priceLow=10&priceHigh=100000&order=${order}`
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


  if (key == 'service') {
    return (
      <>
        <View style={styles.container} >
          {
            serviceData.length ?
              <View>
                <View style={styles.filtercontainer}>
                  {/* <TouchableOpacity onPress={() => refRBSheet.current.open()} style={styles.sortingView}>
              <Text style={styles.filtertxt}>{'Sort'}  </Text>
              <Icon name={'sort'} color={'#000'} size={20} />
            </TouchableOpacity> */}
                  <TouchableOpacity onPress={() => refRBSheet.current.open()} style={styles.sortingView}>
                    <Text style={styles.filtertxt}>{'Filter'}  </Text>
                    <Icon name={'filter-list'} color={'#000'} size={20} />
                  </TouchableOpacity>
                </View>
                {displayserviceData()}
              </View>
              : null
          }
        </View>

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
              onPress={() => applysorting()}
              style={styles.applybutton}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
            </TouchableOpacity>

          </View>
        </RBSheet>
        {
          servicemodalVisible ?


            <Modal
              animationType="slide"
              transparent={true}
              hideModalContentWhileAnimating={true}
              visible={servicemodalVisible}
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
                setservicemodalVisible(!servicemodalVisible)
              }}
            >
              <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
              <View style={styles.transparentContainer}>
                <View style={styles.viewContainer}>
                  <Swiper
                    loop={false}
                    activeDot={<View style={styles.activeDot} />}
                    containerStyle={styles.swiperContainer}
                  >

                    {
                      service.serviceImage && service.serviceImage.map((item) => {
                        return (
                          <View style={styles.imageBackgroundContainer}>
                            <Image
                              style={styles.imageBackground}
                              source={{ uri: item }}
                            />
                          </View>
                        )
                      })}

                  </Swiper>

                  <Header
                    onCancelPress={() => setmodalVisible(false)}
                    headerContainerStyle={styles.headerContainerStyle}
                    onSharePress={onShareservice} />

                  <ScrollView style={styles.descriptionContainer}>


                    <Text style={styles.title}>{service.name}</Text>
                    <Text style={styles.title}>Available Slot : {service.serviceDetail.serviceSlot[0].start} to {service.serviceDetail.serviceSlot[0].end}</Text>
                    <Text style={[styles.title, { paddingTop: 5, fontSize: 15, marginTop: 10 }]}>{service.description}</Text>
                    <View style={styles.inputContainer}>
                      <DatePicker
                        style={{ width: '100%' }}
                        date={slotdate}
                        mode="date"
                        placeholder="select date"
                        format="DD-MM-YYYY"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        minDate={new Date()}
                        maxDate={moment().day(17)}
                        customStyles={{
                          dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 10
                          },
                          dateInput: {
                            marginLeft: -180,
                            borderWidth: 0,

                          }
                          // ... You can check the source to find the other keys.
                        }}
                        onDateChange={(date) => setslotdate(date)}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Picker
                        selectedValue={selectedSlot}
                        style={{ width: '100%', height: 40 }}
                        onValueChange={(itemValue, itemIndex) => {
                          if (service.serviceDetail.serviceSlot[0].start <= itemIndex && service.serviceDetail.serviceSlot[0].end >= itemIndex) {
                            setselectedSlot(itemValue)
                          } else {
                            Alert.alert("", `Plaease Select time Between ${service.serviceDetail.serviceSlot[0].start} to ${service.serviceDetail.serviceSlot[0].end}`)
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
                    <Text style={styles.price}>₹ {service.serviceDetail ? service.serviceDetail.price : null}</Text>
                    <View style={styles.borderLine} />
                    <TouchableOpacity
                      onPress={() => booknow(service)}
                      style={[styles.addToBagContainerStyle, { marginBottom: 20 }]}>
                      <Text style={{ color: '#fff', fontSize: 20 }}>{"Book Now"}</Text>
                    </TouchableOpacity>
                  </ScrollView>

                </View>
              </View>
            </Modal>
            : null
        }
      </>
    )
  } else if (key == 'BestSeller') {
    return (
      <SafeAreaView>
        <View style={styles.unitContainer}>

          <View style={styles.filtercontainer}>
            {/* <TouchableOpacity onPress={() => refRBSheet.current.open()} style={styles.sortingView}>
              <Text style={styles.filtertxt}>{'Sort'}  </Text>
              <Icon name={'sort'} color={'#000'} size={20} />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => refRBSheet.current.open()} style={styles.sortingView}>
              <Text style={styles.filtertxt}>{'Filter'}  </Text>
              <Icon name={'filter-list'} color={'#000'} size={20} />
            </TouchableOpacity>
          </View>
          {
            bestSellerProducts.length ?

              <View style={{ marginBottom: 120 }}>
                {displaybestproducts()}
              </View>

              : null
          }
        </View>

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
              onPress={() => applysorting()}
              style={styles.applybutton}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{"Apply"}</Text>
            </TouchableOpacity>

          </View>
        </RBSheet>
        {
          modalVisible ?
            <Modal
              isVisible={modalVisible}
              hideModalContentWhileAnimating={true}
              animationIn="zoomInDown"
              animationOut="zoomOutUp"
              animationInTiming={600}
              animationOutTiming={600}
              backdropTransitionInTiming={600}
              backdropTransitionOutTiming={600}
              style={styles.modalStyle}
              backdropOpacity={0.5}
              deviceWidth={deviceWidth}
              deviceHeight={deviceHeight}
              onBackButtonPress={() => setmodalVisible(false)}
              onRequestClose={() => {
                setmodalVisible(!modalVisible)
              }}
            >

              <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
              <View style={styles.transparentContainer}>
                <View style={styles.viewContainer}>
                  <Swiper
                    loop={false}
                    activeDot={<View style={styles.activeDot} />}
                    containerStyle={styles.swiperContainer}
                  >
                    {clickproduct.productImage && clickproduct.productImage.map((item) => {
                      return (
                        <View style={styles.imageBackgroundContainer}>
                          <Image
                            style={styles.imageBackground}
                            source={{ uri: item }}
                          />
                        </View>
                      )
                    })}
                  </Swiper>
                  <Header
                    onCancelPress={() => setmodalVisible(false)}
                    headerContainerStyle={styles.headerContainerStyle}
                    onSharePress={onShare}
                  />

                  <ScrollView style={styles.descriptionContainer}>
                    <Text style={styles.title}>{clickproduct.name}</Text>
                    <Text style={[styles.title, { paddingTop: 5, fontSize: 15 }]}>{clickproduct.description}</Text>
                    <Text
                      style={styles.price}
                    >₹ {clickproduct.productDetail.price}</Text>

                    {
                      clickproduct.productDetail && clickproduct.productDetail.hasOwnProperty('color') ? clickproduct.productDetail.color.length ?
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.titlecolor}>{'Colors'}</Text>
                          {
                            clickproduct.productDetail.color.map((item) => {
                              return (
                                <TouchableOpacity onPress={() => setselecteditemcolor(item)} style={[styles.colorview, { backgroundColor: selecteditemcolor == item ? '#a3a3a3' : '#fff' }]}>
                                  <Text style={styles.colorText}>{item} </Text>
                                </TouchableOpacity>
                              )
                            })
                          }
                        </View>
                        : null
                        : null
                    }
                    {
                      clickproduct.productDetail && clickproduct.productDetail.hasOwnProperty('size') ? clickproduct.productDetail.size.length ?
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.titlecolor}>{'Size'}    </Text>
                          {clickproduct.productDetail.size.map((item) => {
                            return (
                              <TouchableOpacity
                                onPress={() => setselecteditemSize(item)}
                                style={[styles.colorview, { backgroundColor: selecteditemSize == item ? '#a3a3a3' : '#fff' }]}>
                                <Text style={styles.colorText}>{item} </Text>
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                        : null
                        : null
                    }
                    <View style={styles.borderLine} />
                    <TouchableOpacity
                      onPress={() => onAddToBag(item)}
                      style={styles.addToBagContainerStyle}>
                      <Text style={{ color: '#fff', fontSize: 20 }}>{"ADD TO BAG"}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>

            </Modal>
            : null
        }
      </SafeAreaView>
    );
  }
}


export default ViewAllProductsPage;
