import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import getbestSellerService from '../../services/Products/bestSellerProducts'
import Header from "../../components/Modals/ProductDetailModal/Header";
import Swiper from "react-native-swiper";

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
import addToBagProduct from "../AddTobagProduct/addbagproduct";
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import { checktype } from "../../utils/utilis";
const { width } = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
function BestSellers(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { title } = props
  useEffect(() => {
    getBestSellerProducts()
  }, [])

  const [bestseelerpage, setbestseelerpage] = useState(0)
  const [bestSellerProducts, setbestSellerProducts] = useState([])
  const [modalVisible, setmodalVisible] = useState(false)
  const [clickproduct, setclickproduct] = useState({})
  const [alreadyAddecart, setalreadyAddecart] = useState(false)
  const [quentity, setquentity] = useState(1)

  const getBestSellerProducts = async () => {

    const data = await getbestSellerService(0);
    if (data.success) {
      if (data.data.length > 0) {
        setbestSellerProducts(data.data)
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
              
                <Image style={styles.productCardImage} source={ item.item.productImage.length == 0 ? require('../../../assets/images/logo.png') :{ uri: item.item.productImage[0] }} />
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
  /**
   * 
   * @param {any} item product data 
   * add to bag product
   */
  const onAddToBag = async (item, color, size, qty, selectedshopID) => {
    setmodalVisible(!modalVisible)
    setquentity(1);


    //add to bag product call from component
    addToBagProduct(item, alreadyAddecart, color, size, qty, selectedshopID)
  };

  return (
    <SafeAreaView>
      <View style={styles.unitContainer}>
        {
          bestSellerProducts.length ?
            <>
              <View style={[styles.unitContainer, { flexDirection: 'row' }]}>
                <View style={{ flex: 8 }}>
                  <Text style={styles.unitTitle}>{title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate('ViewAllProductsPage', { key: 'BestSeller', appConfig: props.appConfig, shippingMethods: props.shippingMethods })}
                  style={{ flex: 3 }}>
                  <Text style={styles.unitTitle}>{'View All'}</Text>
                </TouchableOpacity>
              </View>
              <View>
                {displaybestproducts()}
              </View>
            </>
            : null
        }
      </View>
      <ProductDetailModal
        item={clickproduct}
        shippingMethods={props.shippingMethods}
        visible={modalVisible}
        onAddToBag={onAddToBag}
        onCancelPress={(modalVisible) => {
          setmodalVisible(!modalVisible);
          setquentity(1)
        }}
        appConfig={props.appConfig}
        navigation={props.navigation}
        quentityset={quentity}
        onSetQuantity={(value) => setquentity(value)}
      />
    </SafeAreaView>
  );
}



export default BestSellers;
