
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
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
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
const { width } = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import moment from 'moment'
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Searchbar } from 'react-native-paper';
import allSearchData from "../../services/Search/AllSearch";
import ProductDetailModal from "../Modals/ProductDetailModal/ProductDetailModal";
import ServiceModelComponent from "../Modals/ProductDetailModal/ServiceModel";
import addToBagProduct from "../AddTobagProduct/addbagproduct";
import { checktype } from "../../utils/utilis";


function AllSearchPage(props) {


    
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setpage] = useState(0)
    
    const [productModalData, setproductModalData] = useState({})
    const [serviceModalData, setserviceModalData] = useState({})

    const [servicemodalVisible, setservicemodalVisible] = useState(false)
    const [productmodalVisible, setproductmodalVisible] = useState(false)

    const [AllData, setAllData] = useState([])
    const [alreadyAddecart, setalreadyAddecart] = useState(false)

    useEffect( () => {
        const backAction = () => {
            props.navigation.goBack()
      
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
          return () => backHandler.remove()
    },[])
    const onChangeSearch = async (query) => {

       
        if(query.length > 0){
            let data = `words=${query}&page=${page}&limit=1000`
        
            setSearchQuery(query);
            const response = await allSearchData(data)
            // console.log("response of all search", response)
            if (response.statusCode == 200) {
                setAllData(response.data.products.concat(response.data.services))
            }
        }else{
            setAllData([])
            setSearchQuery('')
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
    const displayProductData = () => {
        return (
            <FlatList
                data={AllData}
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
                                >₹ {checktype(item.item.serviceDetail.price)}</Text>
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
                                >₹ {checktype(item.item.productDetail.price)}</Text>
                                <Text style={styles.productCardDescription} numberOfLines={1}>
                                    {item.item.name}
                                </Text>
                            </TouchableOpacity>
                        )
                    }
                }}
                itemDimension={0.41 * width}
                numColumns={2}

            />
        )
    }
    return (

        <SafeAreaView>
            <View style={{ marginLeft: 10, marginRight: 10, marginTop: 5 }}>
                <Searchbar
                    onPress={() => props.navigation.navigate('AllSearchPage')}
                    placeholder="Search"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    clearIcon={() => searchQuery.length ? <Icon name={'close'} size={20} color={'#808080'} onPress={() => [ setSearchQuery(''),setAllData([])]}/> : null}
                />
            </View>

            <View>
                {
                    AllData.length ?
                        <View style={{ marginTop: 10, marginBottom: 130 }}>
                            {displayProductData()}
                        </View>
                        : null
                }
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
          onAddToBag={(item, selectedSlot, selectedshopID,slotdate) => booknow(item, selectedSlot, selectedshopID,slotdate)}
          onCancelPress={() => setservicemodalVisible(!servicemodalVisible)}
          appConfig={props.navigation.state.params.appConfig}
          navigation={props.navigation}
        />


        </SafeAreaView>
    );

}


export default AllSearchPage;
