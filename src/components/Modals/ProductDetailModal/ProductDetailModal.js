import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Dimensions,
  Share,
  Platform,
  Image,
  AsyncStorage
} from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";
import Swiper from "react-native-swiper";
import stripe from "tipsi-stripe";
import Header from "./Header";
import ProductOptions from "./ProductOptions";
import Favourite from "./Favourite";
import FooterButton from "../../FooterButton/FooterButton";
import AppStyles from "../../../AppStyles";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import getbagproduct from "../../../services/AddToBag/getbagProduct";
import RNFetchBlob from "react-native-fetch-blob";
import RNFS from "react-native-fs";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

function ProductDetailModal(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const [alreadyaddecart, setalreadyaddecart] = useState(false)

  useEffect(() => {
    checkalreadyaddtocart()
  })
  const checkalreadyaddtocart = async () => {
    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)
    let found = getdata.data.some(i => i.products[0].product_id.productMasterId == item._id)
    // console.log("Found", found)
    if (found == true) {
      setalreadyaddecart(true)
    }
  }

  const { visible, onCancelPress, item, onAddToBag, appConfig, productDetails, alreadyAddecart,navigation } = props;
  const onSizeSelected = index => {
    props.item.selectedSizeIndex = index;
  };

  const onColorSelected = index => {
    props.item.selectedColorIndex = index;
  };

  const onShare = async () => {
    const fs = RNFetchBlob.fs;
    console.log("item.name", item.name, item.productImage, productDetails.price)
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
        // console.log("base64 img>>>>>>>>>>>>>>>>>>>>>>>>>>>",base64Data);
      base64img = base64Data
        // remove the file from storage
        return fs.unlink(imagePath);
      });
    try {
      await Share.share({
        title: "Shopertino Product",
        dialogTitle: `Shopertino Product: ${item.name}`,
        message: item.name +  item.description   + productDetails.price,
        image:item.productImage

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

      <View style={styles.transparentContainer}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />

        <View style={styles.viewContainer}>
          <Swiper
            loop={false}
            activeDot={<View style={styles.activeDot} />}
            containerStyle={styles.swiperContainer}
          >
            <View style={styles.imageBackgroundContainer}>
              <Image
                style={styles.imageBackground}
                source={{ uri: item.productImage }}
              />
            </View>
          </Swiper>
          <Header
            onCancelPress={onCancelPress}
            headerContainerStyle={styles.headerContainerStyle}
            onSharePress={onShare}
          />
          <ProductOptions
            item={item}
            onSizeSelected={onSizeSelected}
            onColorSelected={onColorSelected}
            optionContainerStyle={styles.optionContainerStyle}
          />
          {/* <Favourite
            onPress={() => props.onFavouritePress(item)}
            isFavourite={item.isFavourite}
            favouriteContainerStyle={styles.favouriteContainerStyle}
          /> */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={[styles.title, { paddingTop: 5, fontSize: 15 }]}>{item.description}</Text>
            {
              productDetails ?
                <Text
                  style={styles.price}
                >{`${appConfig.currency}${productDetails.price}`}</Text>
                :
                <Text
                  style={styles.price}
                >{`${appConfig.currency}${item.productDetail ? item.productDetail.price : null}`}</Text>
            }
            <View style={styles.borderLine} />
          </View>
          <View style={styles.footerContainer}>
            <FooterButton
              onPress={() => onAddToBag(item)}
              footerContainerStyle={styles.addToBagContainerStyle}
              footerTitleStyle={{
                color: "white",
                fontFamily: AppStyles.fontFamily.regularFont
              }}
              title={alreadyAddecart == true || alreadyaddecart == true ? "Added in Bag" : "ADD TO BAG"}
            />
          </View>
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
