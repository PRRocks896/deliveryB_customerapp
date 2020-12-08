import React, { useEffect, useState, useRef } from "react";
import { useColorScheme } from "react-native-appearance";

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
    Share,
} from "react-native";
import { getproductshopWise } from "../../../services/Shop";
import dynamicStyles from "../styles";
import ProductDetailModal from "../../Modals/ProductDetailModal/ProductDetailModal";
import ServiceModelComponent from "../../Modals/ProductDetailModal/ServiceModel";
import addToBagProduct from "../../AddTobagProduct/addbagproduct";
import AsyncStorage from "@react-native-community/async-storage";
import { Header } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
const { width } = Dimensions.get("window");
function ShopWiseProduct(props) {

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [allProducts, setallProducts] = useState([])
    const [page, setpage] = useState(0)

    const [servicemodalVisible, setservicemodalVisible] = useState(false)
    const [productmodalVisible, setproductmodalVisible] = useState(false)

    const [productModalData, setproductModalData] = useState({})
    const [serviceModalData, setserviceModalData] = useState({})

    useEffect(() => {
        getProducts()
    }, [])
    console.log("shopid===============================", props.navigation.state.params.shopid)
    const getProducts = async () => {
        let shopid = props.navigation.state.params.shopid
        let body = `page=${page}&limit=10&order=desc&shop=${shopid}`
        const response = await getproductshopWise(body)
        console.log("Response of All Products", response)
        if (response.statusCode == 200) {
            if (response.data.products.length > 0 || response.data.services.length) {
                setpage(page + 1)
                let products = response.data.products
                let service = response.data.services
                setallProducts(page == 1 ? products.concat(service) : [...allProducts, ...products.concat(service)])
            }
        }
    }

    const booknow = async (item, selectedSlot, selectedshopID, slotdate) => {
        let userid = await AsyncStorage.getItem('userId')
        setservicemodalVisible(false)
        setproductmodalVisible(false)
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
   * 
   * @param {any} item product data 
   * add to bag product
   */
    const onAddToBag = async (item, color, size, quentity, selectedshopID) => {
        setproductmodalVisible(!productmodalVisible)


        //add to bag product call from component
        addToBagProduct(item, alreadyAddecart, color, size, quentity, selectedshopID)
    };
    const displayAllProducts = () => {

        return (
            <FlatList
                data={allProducts}
                renderItem={(item) => {
                    if (item.item.serviceDetail) {
                        return (
                            <TouchableOpacity
                                style={[styles.productCardConainer, { width: 0.41 * width }]}
                                onPress={() => [setserviceModalData(item.item), setservicemodalVisible(true)]}
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
                    } else {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => [setproductModalData(item.item), setproductmodalVisible(true)]}
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
                    }
                }}
                numColumns={2}
                itemDimension={0.41 * width}
                onEndReachedThreshold={0.8}
                onEndReached={getProducts}

            />
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <Header
                leftComponent={
                    <Icon
                        name={'keyboard-backspace'}
                        size={30}
                        color={'#000'}
                        style={{ padding: 5, position: 'absolute', left: 3, top: -15 }}
                        onPress={() => props.navigation.goBack()} />
                }
                centerComponent={{ text:  props.navigation.state.params.shopname, style: { color: '#000' , fontSize:20} }}
                containerStyle={{
                    backgroundColor: '#fff',
                    justifyContent: 'space-around',
                  }}
            />

            <View style={styles.container}>
                {displayAllProducts()}
            </View>
            <ProductDetailModal
                item={productModalData}
                shippingMethods={props.shippingMethods}
                visible={productmodalVisible}
                onAddToBag={onAddToBag}
                onCancelPress={() => setproductmodalVisible(!productmodalVisible)}
                appConfig={props.navigation.state.params.appConfig}
                navigation={props.navigation}
            />

            <ServiceModelComponent
                item={serviceModalData}
                shippingMethods={props.shippingMethods}
                visible={servicemodalVisible}
                onAddToBag={(item, selectedSlot, selectedshopID, slotdate) => booknow(item, selectedSlot, selectedshopID, slotdate)}
                onCancelPress={() => setservicemodalVisible(!servicemodalVisible)}
                appConfig={props.navigation.state.params.appConfig}
                navigation={props.navigation}
            />
        </SafeAreaView>
    );

}


export default ShopWiseProduct;
