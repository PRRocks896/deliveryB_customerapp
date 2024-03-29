import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StatusBar,
  Dimensions,
  Share,
  TouchableOpacity,
  Image,
  FlatList
} from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";
import Swiper from "react-native-swiper";
import Header from "./Header";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import getbagproduct from "../../../services/AddToBag/getbagProduct";
import RNFetchBlob from "react-native-fetch-blob";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import AppStyles from "../../../AppStyles";
import { getallShopList } from "../../../services/Products/getsubCategory";
import RBSheet from "react-native-raw-bottom-sheet";
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { checktype } from "../../../utils/utilis";
import AsyncStorage from "@react-native-community/async-storage";
import { nullPlaceholder } from "i18n-js";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
function ProductDetailModal(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const [alreadyaddecart, setalreadyaddecart] = useState(false)
  const [selecteditemcolor, setselecteditemcolor] = useState('')
  const [selecteditemSize, setselecteditemSize] = useState('')
  // const [quentity, setquentity] = useState(props.quentityset)
  const [shopList, setshopList] = useState([])
  const refRBSheet = useRef();
  const [selectedshopID, setselectedshopID] = useState('')

  const [loggedinuser, setloggedinuser] = useState(false)



  useEffect(() => {
    
    getloginid()
  })

  const getloginid = async () => {
    let userid = await AsyncStorage.getItem('userId')
    if (userid == null) {
      setloggedinuser(false)
    } else {
      setloggedinuser(true)
      checkalreadyaddtocart()
    }
  }

  /**
   * Get Shop All List by Product Master id
   */
  const getShopList = async () => {
    setselectedshopID(item.productDetail ? item.productDetail.shop_id : '')
    let id = item.productDetail.productMasterId ? item.productDetail.productMasterId : ''
    console.log("===================get shop", id, item)
    if (id) {
      const response = await getallShopList(id)
      console.log("Response For shop details", response)
      if (response.statusCode == 200) {
        setshopList(response.data)
      }

    }
  }

  const checkalreadyaddtocart = async () => {
    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)
    let found = getdata.data.data.some(i => i.products[0].product_id.productMasterId == item._id)
    // console.log("Found===============================================", found)
    if (found == true) {
      setalreadyaddecart(true)
    } else {
      setalreadyaddecart(false)
    }
  }

  const { visible, onCancelPress, item, onAddToBag, appConfig, productDetails, navigation } = props;
  const onShare = async () => {
    const fs = RNFetchBlob.fs;

    let base64img;
    let imagePath = null;
    RNFetchBlob.config({
      fileCache: true
    })
      .fetch("GET", item.productImage)
      .then(resp => {
        imagePath = resp.path();
        return resp.readFile("base64");
      }).then(base64Data => {

        base64img = base64Data

        return fs.unlink(imagePath);
      });
    try {
      await Share.share({
        title: "Shopertino Product",
        dialogTitle: `Shopertino Product: ${item.name}`,
        message: item.name + item.description + item.productDetail ? productDetails.price : item.productDetail.price,
        image: item.productImage

      });
    } catch (error) {
      alert(error.message);
    }
  };

  const incrementItem = async () => {
    props.onSetQuantity(props.quentityset + 1);
    // setquentity(quentity + 1)
  }

  const decrementItem = async () => {
    if (props.quentityset !== 1) {
      props.onSetQuantity(props.quentityset - 1);
    }
    // if (quentity !== 1) setquentity(quentity - 1)
  }


  const displayshopList = () => {
    return (
      <FlatList
        data={shopList}
        renderItem={(item) => {
          return (
            <TouchableOpacity onPress={() => setselectedshopID(item.item._id)}>
              <View style={[styles.bottomsheet, { flexDirection: 'row' }]}>
                <View style={{ flex: 8, flexDirection: 'row' }}>
                  <Text style={styles.shopname}>{item.item.name}  </Text>
                  {
                    item.item.isVerified ?
                      <Icons name='check-decagram' size={18} color={'#36D8FF'} style={{ textAlign: 'center', alignSelf: 'center', marginTop: 3 }} />
                      : null
                  }
                </View>
                <View style={{ flex: 3 }}>
                  {
                    selectedshopID == item.item._id ?
                      <Icon name={'done'} size={20} color={'#000'} />
                      : null
                  }
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        keyExtractor={(item) => (item._id).toString()}

      />
    )
  }

  const oflineStorage = async(item, selecteditemcolor, selecteditemSize, qty, selectedshopID ) => {
    console.log("item", item)
    let getproducrsoff = await AsyncStorage.getItem("Ofline_Products")
    let parseddata = JSON.parse(getproducrsoff)
    console.log("Frist get Products off", parseddata)
    if(parseddata !== null){
      console.log("add to local", )
      found = parseddata.some(i => i.productid == item.productDetail._id)
      if(found == false){
        let products =  parseddata
        products.push({
          item:item,
          selecteditemcolor:selecteditemcolor,
          selecteditemSize:selecteditemSize,
          qty:qty,
          selectedshopID:selectedshopID,
          productid:item.productDetail._id
        })
        AsyncStorage.setItem("Ofline_Products", JSON.stringify(products))
        let cartlengthdata = await AsyncStorage.getItem('Ofline_Products')
        onCancelPress(false)
        EventRegister.emit('cartlength',   JSON.parse(cartlengthdata.length))
      }else{
        Alert.alert("","already added")
        onCancelPress(false)
      }

    }else{
      let products =  []
      products.push({
        item:item,
        selecteditemcolor:selecteditemcolor,
        selecteditemSize:selecteditemSize,
        qty:qty,
        selectedshopID:selectedshopID,
        productid:item.productDetail._id
      })
      AsyncStorage.setItem("Ofline_Products", JSON.stringify(products))
      let cartlengthdata = await AsyncStorage.getItem('Ofline_Products')
      EventRegister.emit('cartlength',   JSON.parse(cartlengthdata.length))
      onCancelPress(false)
    }
    let producrsoff = await AsyncStorage.getItem("Ofline_Products")
    console.log("Ofliine products======================", JSON.parse(producrsoff))
  }

  // console.log("item.productDetail.color.length",item.productDetail&& item.productDetail.color)
  return (
    <>
      <Modal
        isVisible={visible}
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
        onBackButtonPress={() => onCancelPress(false)}
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
                item.productImage && item.productImage.map((item) => {
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
              onCancelPress={onCancelPress}
              headerContainerStyle={styles.headerContainerStyle}
              onSharePress={onShare}
            />

            <ScrollView style={styles.descriptionContainer}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={[styles.title, { paddingTop: 5, fontSize: 15 }]}>{item.description}</Text>
              {
                productDetails ?
                  <Text
                    style={styles.price}
                  >₹ {checktype(productDetails.price)}</Text>
                  :
                  <Text
                    style={styles.price}
                  >₹ {item.productDetail ? checktype(item.productDetail.price) : null}</Text>
              }

              {
                item.productDetail && item.productDetail.hasOwnProperty('color') ? item.productDetail.color !== null && item.productDetail.color.length ?
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.titlecolor}>{'Colors'}</Text>
                    {
                      item.productDetail.color.map((item) => {
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
                item.productDetail && item.productDetail.hasOwnProperty('size') ? item.productDetail.size !== null && item.productDetail.size.length ?
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.titlecolor}>{'Size'}    </Text>
                    {item.productDetail.size.map((item) => {
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
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => incrementItem()}
                  style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
                >
                  <Image
                    source={AppStyles.iconSet.add}
                    style={styles.quantityControlIcon}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View>
                  <Text style={styles.quantityCount}>{props.quentityset}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => decrementItem()}
                  style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}>
                  <Image
                    source={AppStyles.iconSet.minus}
                    style={styles.quantityControlIcon}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>


              <View style={styles.borderLine} />
              {
                alreadyaddecart ?
                  <TouchableOpacity
                    onPressIn={() => navigation.navigate("Bag", { appConfig: appConfig })}
                    onPress={onCancelPress}
                    style={styles.addToBagContainerStyle}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>{"GO TO CART"}</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity
                    onPress={() => [refRBSheet.current.open(), getShopList()]}
                    style={styles.addToBagContainerStyle}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>{"ADD TO BAG"}</Text>
                  </TouchableOpacity>
              }

            </ScrollView>
          </View>
        </View>

      </Modal>

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
        <View>
          {
            shopList.length ?
              <>
                {displayshopList()}
                {
                  loggedinuser ?
                    <TouchableOpacity
                      onPress={() => [onAddToBag(item, selecteditemcolor, selecteditemSize, props.quentityset, selectedshopID), refRBSheet.current.close()]}
                      style={styles.applybutton}>
                      <Text style={{ color: '#fff', fontSize: 15 }}>{"Proceed"}</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                      onPress={() => [oflineStorage(item, selecteditemcolor, selecteditemSize, props.quentityset, selectedshopID), refRBSheet.current.close()]}
                      style={styles.applybutton}>
                      <Text style={{ color: '#fff', fontSize: 15 }}>{"Proceed"}</Text>
                    </TouchableOpacity>
                }

              </>
              :
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text>{'No Shop List Found'}</Text>
              </View>
          }
        </View>
      </RBSheet>
    </>
  );
}

ProductDetailModal.propTypes = {
  onPress: PropTypes.func,
  item: PropTypes.object,
  visible: PropTypes.bool,
  onCancelPress: PropTypes.func,
  onFavouritePress: PropTypes.func,
  onAddToBag: PropTypes.func,
  shippingMethods: PropTypes.array
};

export default ProductDetailModal;
