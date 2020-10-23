import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ScrollView, View, BackHandler, Alert, RefreshControl, Text } from "react-native";
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

function Home(props) {
  const colorScheme = useColorScheme();
  const [category, setCategory] = useState([])
  const [products, setProducts] = useState([])
  const [isLoadingcategory, setisLoadingcategory] = useState(true)
  const [isLoadingProduct, setisLoadingProduct] = useState(true)
  const [refreshing, setrefreshing] = useState(false)
  const [netInfo, setNetInfo] = useState(false);

  const styles = dynamicStyles(colorScheme);
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
      console.log("state.isConnected", state.isConnected)
      setNetInfo(state.isConnected);
    });

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>main page", featuredproduct.length)
    setCategory(categoryproducts)
    setProducts(featuredproduct)
    getCategoryProducts() // For get categories
    getFeaturedProducts() // For get products
    return () => [backHandler.remove(),  unsubscribe()]
  }, []);

  const getCategoryProducts = async () => {
    const data = await getCategory();
    if (data.success) {
      setisLoadingcategory(false)
      setCategory(data.data)
    }
  }
  const getFeaturedProducts = async () => {
    const data = await getProducts();
    if (data.success) {
      setisLoadingProduct(false)
      setProducts(data.data)
    }
  }
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
  }} />}
    style={styles.container} > 
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
            bestSellerProducts={products}
            title={"Best Sellers"}
            navigation={navigation}
            shouldLimit={true}
            limit={10}
            appConfig={appConfig}
          />
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
