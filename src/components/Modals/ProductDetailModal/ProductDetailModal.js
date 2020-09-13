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

  const { visible, onCancelPress, item, onAddToBag, appConfig, productDetails, alreadyAddecart } = props;
  const onSizeSelected = index => {
    props.item.selectedSizeIndex = index;
  };

  const onColorSelected = index => {
    props.item.selectedColorIndex = index;
  };

  const onShare = async () => {
    console.log("item.name", item.name, item.productImage)
    try {
      await Share.share({
        title: "Shopertino Product",
        dialogTitle: `Shopertino Product: ${item.name}`,
        message: item.description,
        url: item.productImage
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const onPay = async () => {
    const items = [
      {
        label: "Shopertino, Inc",
        amount: `${props.item.price}`
      }
    ];
    const options = {
      requiredBillingAddressFields: ["all"],
      billing_address_required: true,
      total_price: `${props.item.price}`,
      currency_code: "USD",
      shipping_countries: ["US", "CA"], //android
      line_items: [
        {
          currency_code: "USD",
          description: "Pay Shopertino, Inc",
          unit_price: `${props.item.price}`,
          total_price: `${props.item.price}`,
          quantity: "1"
        }
      ],
      shippingMethods: [...props.shippingMethods]
    };

    try {
      const token = await stripe.paymentRequestWithNativePay(options, items);

      // api.sendTokenToBackend(token)
      // You should complete the operation by calling
      // stripe.completeApplePayRequest()
    } catch (error) {
      stripe.cancelNativePayRequest();

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
