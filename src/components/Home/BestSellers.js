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
                onPress={ () => props.navigation.navigate('ViewAllProductsPage', {key: 'BestSeller',  appConfig: props.appConfig})}
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



export default BestSellers;
