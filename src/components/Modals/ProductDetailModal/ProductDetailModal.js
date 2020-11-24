import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Dimensions,
  Share,
  TouchableOpacity,
  Image,
  AsyncStorage
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

function ProductDetailModal(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const [alreadyaddecart, setalreadyaddecart] = useState(false)
  const [selecteditemcolor, setselecteditemcolor] = useState('')
  const [selecteditemSize, setselecteditemSize] = useState('')

  useEffect(() => {
    checkalreadyaddtocart()
  })
  const checkalreadyaddtocart = async () => {
    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)
    let found = getdata.data.some(i => i.products[0].product_id.productMasterId == item._id)

    if (found == true) {
      setalreadyaddecart(true)
    }
  }

  const { visible, onCancelPress, item, onAddToBag, appConfig, productDetails, alreadyAddecart, navigation } = props;
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
        message: item.name + item.description + productDetails.price,
        image: item.productImage

      });
    } catch (error) {
      alert(error.message);
    }
  };


  return (

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
      onBackButtonPress={onCancelPress}
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
                >₹ {productDetails.price}</Text>
                :
                <Text
                  style={styles.price}
                >₹ {item.productDetail ? item.productDetail.price : null}</Text>
            }

            {
              item.productDetail && item.productDetail.hasOwnProperty('color') ? item.productDetail.color.length ?
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.titlecolor}>{'Colors'}</Text>
                  {
                    item.productDetail.color.map((item) => {
                      return (
                        <TouchableOpacity onPress={ () => setselecteditemcolor(item)} style={[styles.colorview, { backgroundColor : selecteditemcolor == item ? '#a3a3a3' : '#fff'}]}>
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
              item.productDetail && item.productDetail.hasOwnProperty('size') ? item.productDetail.size.length ?
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.titlecolor}>{'Size'}    </Text>
                  {item.productDetail.size.map((item) => {
                    return (
                      <TouchableOpacity
                      onPress = { () => setselecteditemSize(item)}
                      style={[styles.colorview , {backgroundColor: selecteditemSize == item ? '#a3a3a3' : '#fff'}]}>
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
              <Text style={{ color: '#fff', fontSize: 20 }}>{alreadyAddecart == true || alreadyaddecart == true ? "Added in Bag" : "ADD TO BAG"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

    </Modal>

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
