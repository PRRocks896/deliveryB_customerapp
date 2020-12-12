import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ScrollView, View, BackHandler, Alert, RefreshControl, Text, FlatList, Dimensions, PermissionsAndroid, sTouchableOpacity, ActivityIndicator, Image, Content, SafeAreaView } from "react-native";
import { useColorScheme } from "react-native-appearance";
import Categories from "./Categories";
import NewArrivals from "./NewArrivals";
import Featured from "./Featured";
import BestSellers from "./BestSellers";
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import dynamicStyles from "./styles";
import getCategory from "../../services/Products/getCategory";
import getProducts from "../../services/Products/getproducts";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import NetInfo from '@react-native-community/netinfo';
import ServicesScreen from './services'
import getServiceData from "../../services/ShopServices/getservices";
import getbestSellerService from '../../services/Products/bestSellerProducts'
import { Searchbar } from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialIcons";
import ShowDeliveryBoyList from "./Deliveryboy";
import ShopList from "./ShopDataShow/shopList";
import Geolocation from 'react-native-geolocation-service';
import { connect, disconnect } from '../../utils/socket'
const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
function Home(props) {
  const colorScheme = useColorScheme();
  const [category, setCategory] = useState([])
  const [products, setProducts] = useState([])
  const [isLoadingcategory, setisLoadingcategory] = useState(true)
  const [isLoadingProduct, setisLoadingProduct] = useState(true)
  const [refreshing, setrefreshing] = useState(false)
  const [netInfo, setNetInfo] = useState(false);
  const [serviceData, setserviceData] = useState([])

  const [page, setpage] = useState(0)

  const [bestseelerpage, setbestseelerpage] = useState(0)
  const [bestSellerProducts, setbestSellerProducts] = useState([])

  const [servicepage, setservicepage] = useState(0)

  const { width } = Dimensions.get("window");
  const styles = dynamicStyles(colorScheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerLat, setcustomerLat] = useState(22.2856)
  const [customerLong, setcustomerLong] = useState(70.7561)
  const [dboyArray, setdboyArray] = useState([])

  const [region, setregion] = useState({
    latitude: 22.2856,
    longitude: 70.7561,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  })
  const {
    navigation,
    shippingMethods,
    onModalCancelPress,
    onAddToBag,
    onFavouritePress,
    isProductDetailVisible,
    product,
    appConfig,
    productDetails,
    alreadyAddecart,

    categoryproducts,
    featuredproduct
  } = props;


  useEffect(() => {

    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetInfo(state.isConnected);
    });

    setCategory(categoryproducts)
    setProducts(featuredproduct)
    getCategoryProducts() // For get categories
    getFeaturedProducts() // For get products
    getServices() // For get Service of shop
    // setInterval ( () =>  permissionforlocation(), 30000)
   
    permissionforlocation()
    const unsubscribenavigation = props.navigation.addListener('focus', () => {
      permissionforlocation()
  });

  
    return () => [backHandler.remove(), unsubscribe(),unsubscribenavigation]
  }, []);

  const permissionforlocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Tribata shop app',
          'message': 'Example App access to your location '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Get Current Location 
        getLocation();

      } else {
        alert("Location permission denied");
      }
    } catch (err) {
      console.warn(err)
    }
  }
  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Position", position.coords.latitude, position.coords.longitude)
        setcustomerLat(position.coords.latitude)
        setcustomerLong(position.coords.longitude)
        getDeliveryboyList(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        Alert.alert(error.message);
      },
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
    );
  }

  const getDeliveryboyList = async (lat, long) => {
    console.log("Lat Long for d boy", lat, long)
    this.socket = connect();
    let body = {
      lat: lat,
      long: long
    }
    const result = await new Promise(async (resolve, reject) => {
      await this.socket.emit('getNearByDeliveryBoys', body, function (data) {
        console.log("On customer app socket response", data)
        if (data.status) {
          resolve(data.deliveryboyDetails);

      } else {
          reject(data.message);
      }
      });
    })
    // console.log('Result: ', result);
    setdboyArray(result)
  }

  const getServices = async () => {
    const response = await getServiceData(0)
    // console.log("getServices response", response)

    if (response.statusCode == 200) {
      setserviceData(response.data)
    }
  }

  const getCategoryProducts = async () => {
    const data = await getCategory();
    if (data.success) {
      // console.log("category response", data)
      setisLoadingcategory(false)
      setCategory(data.data)
    } else {
      setisLoadingcategory(false)
    }
  }

  const getFeaturedProducts = async () => {
    const data = await getProducts(0);
    if (data.success) {
      // console.log("getProducts response", data)
      setisLoadingProduct(false)
      setProducts(data.data)
    } else {
      setisLoadingProduct(false)
    }
  }

  const onChangeSearch = query => setSearchQuery(query);
  if (netInfo == false) {
    return (<View style={styles.container}>
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>{'No Internet Connection'}</Text>
      </View>
    </View>)
  } else {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          getCategoryProducts() // For get categories
          getFeaturedProducts() //
          permissionforlocation()
        }} />}
        style={styles.container} >
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 5 }}>
          <Searchbar
            onPress={() => props.navigation.navigate('AllSearchPage', { appConfig: props.appConfig })}
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
            clearIcon={() => <Icon name={'close'} size={20} color={'#808080'} />}
          />
        </View>
        {
          isLoadingcategory == true ?
            <SkeletonPlaceholder>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <View style={styles.incategorymainViewskeleton}>
                  <View style={[styles.categoryskeleton, { marginLeft: 10 }]} />
                </View>
                <View style={styles.incategorymainViewskeleton}>
                  <View style={styles.categoryskeleton} />
                </View>
                <View style={styles.incategorymainViewskeleton}>
                  <View style={styles.categoryskeleton} />
                </View>
              </View>
            </SkeletonPlaceholder>
            :
            <Categories
              navigation={navigation}
              categories={category}
              onCategoryPress={props.onCategoryPress}
            />
        }
        {
          isLoadingProduct == true ?
            <SkeletonPlaceholder>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View style={styles.newArraivalMainViewsSkeleton} />
                  <View style={styles.newArraivalSkeletonValue} />
                  <View style={[styles.newArraivalSkeletonValue, { width: 50 }]} />
                </View>
              </View>
            </SkeletonPlaceholder>
            :
            <NewArrivals
              title={"New Arrivals"}
              dataSource={products}
              onCardPress={props.onCardPress}
              navigation={navigation}
              appConfig={appConfig}
            />
        }
        {
          isLoadingProduct == true ?
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: 'row', marginTop: 20 }}>
              <SkeletonPlaceholder>
                <View>
                  <View style={styles.featuresmainSkeleton} />
                  <View style={styles.featuredvalueSkeleton} />
                  <View style={styles.featuredsmallValueSkeleton} />
                </View>
                <View>
                  <View style={styles.featuresmainSkeleton} />
                  <View style={styles.featuredvalueSkeleton} />
                  <View style={styles.featuredsmallValueSkeleton} />
                </View>
                <View>
                  <View style={styles.featuresmainSkeleton} />
                  <View style={styles.featuredvalueSkeleton} />
                  <View style={styles.featuredsmallValueSkeleton} />
                </View>
                <View>
                  <View style={styles.featuresmainSkeleton} />
                  <View style={styles.featuredvalueSkeleton} />
                  <View style={styles.featuredsmallValueSkeleton} />
                </View>
              </SkeletonPlaceholder>
            </ScrollView>
            :
            <Featured
              onCardPress={props.onCardPress}
              featuredProducts={products}
              title={"Featured"}
              appConfig={appConfig}
            />
        }
        <ServicesScreen
          navigation={navigation}
          appConfig={appConfig}
          title={"Services"}
          servicedata={serviceData} />
        {
          isLoadingProduct == true ?
            <SkeletonPlaceholder>
              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                <View style={{ flex: 6, flexDirection: 'row' }}>
                  <View>
                    <View style={styles.bestsellerMainSkeleton} />
                    <View style={styles.featuredvalueSkeleton} />
                    <View style={styles.featuredsmallValueSkeleton} />
                  </View>
                  <View>
                    <View style={styles.bestsellerMainSkeleton} />
                    <View style={styles.featuredvalueSkeleton} />
                    <View style={styles.featuredsmallValueSkeleton} />
                  </View>
                </View>
                <View style={{ flex: 6, flexDirection: 'row', marginTop: 10 }}>
                  <View>
                    <View style={styles.bestsellerMainSkeleton} />
                    <View style={styles.featuredvalueSkeleton} />
                    <View style={styles.featuredsmallValueSkeleton} />
                  </View>
                  <View>
                    <View style={styles.bestsellerMainSkeleton} />
                    <View style={styles.featuredvalueSkeleton} />
                    <View style={styles.featuredsmallValueSkeleton} />
                  </View>
                </View>
              </View>
            </SkeletonPlaceholder>

            :
            <BestSellers
              onCardPress={props.onCardPress}
              // bestSellerProducts={products}
              title={"Best Sellers"}
              navigation={navigation}
              shouldLimit={false}
              limit={50}
              appConfig={appConfig}
              shippingMethods={shippingMethods}
            />
        }

        <ShopList
          title={"Shop List"}
          navigation={navigation}
          appConfig={appConfig}
        />
        {
          dboyArray.length ?
          <ShowDeliveryBoyList
            title={"Hire Delivery Boy"}
            navigation={navigation}
            appConfig={appConfig}
            dboylist={dboyArray}
            customerLat={customerLat}
            customerLong={customerLong}
            callFunction={() =>  permissionforlocation()}
          />
          : null
        }

        <ProductDetailModal
          item={product}
          shippingMethods={shippingMethods}
          visible={isProductDetailVisible}
          onFavouritePress={onFavouritePress}
          onAddToBag={onAddToBag}
          onCancelPress={onModalCancelPress}
          productDetails={productDetails}
          appConfig={appConfig}
          alreadyAddecart={alreadyAddecart}
          navigation={navigation}
        />
      </ScrollView>
    );
  }
}

Home.propTypes = {
  navigation: PropTypes.object,
  productPricesByQty: PropTypes.array,
  categories: PropTypes.array,
  newArrivals: PropTypes.array,
  bestSellers: PropTypes.array,
  featured: PropTypes.array,
  user: PropTypes.object,
  wishlist: PropTypes.array,
  shippingMethods: PropTypes.array,
  stripeCustomer: PropTypes.string,
  onCardPress: PropTypes.func,
  onFavouritePress: PropTypes.func,
  onCategoryPress: PropTypes.func,
  onAddToBag: PropTypes.func,
  product: PropTypes.object,
  onModalCancelPress: PropTypes.func,
  isProductDetailVisible: PropTypes.bool
};

export default Home;
