import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "./styles";
import Swiper from "react-native-swiper";
import Header from "../../components/Modals/ProductDetailModal/Header";
import { Picker } from '@react-native-community/picker'
import { useColorScheme } from "react-native-appearance";
import AsyncStorage from "@react-native-community/async-storage";
const deviceWidth = Dimensions.get("window").width;
import RNFetchBlob from "react-native-fetch-blob";
const deviceHeight = Dimensions.get("window").height;
import DatePicker from 'react-native-datepicker'
import moment from 'moment'
import ServiceModelComponent from "../Modals/ProductDetailModal/ServiceModel";
import { checktype } from "../../utils/utilis";

function ServicesScreen(props) {
    const { title, servicedata, appConfig } = props;
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [modalVisible, setmodalVisible] = useState(false)
    const [product, setproduct] = useState({})
    const [selectedSlot, setselectedSlot] = useState('')
    const [slotdate, setslotdate] = useState(moment().format('DD/MM/YYYY'))


    const displayserviceData = () => {
        return (
            <FlatList
                horizontal={true}
                data={servicedata}
                renderItem={(item) => {
                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.productCardConainer}
                            onPress={() => [setproduct(item.item), setmodalVisible(true)]}
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

                            <Text style={[styles.productCardPrice, {textAlign:'center'}]}
                            >₹ {checktype(item.item.serviceDetail.price)}</Text>
                            <Text style={styles.productCardDescription} numberOfLines={1}>
                                {item.item.name}
                            </Text>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={item => (item._id).toString()}
            />
        )
    }
    const onShare = async () => {

        await Share.share({
            title: "Shopertino Product",
            dialogTitle: `Shopertino Product: ${product.name}`,
            message: product.name + ',' + product.description + ',' + product.serviceDetail.price,
        });

    }

    const booknow = async (item, selectedSlot, selectedshopID, slotdate) => {
        let userid = await AsyncStorage.getItem('userId')
        setmodalVisible(false)
        if (selectedSlot !== '') {
            props.navigation.navigate('ServicePaymentOptions',
                {
                    appConfig: appConfig,
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
    return (
        <>
            <ScrollView style={styles.container} >
                {
                    servicedata.length ?
                        <>
                            <View style={[styles.unitContainer, { flexDirection: 'row' }]}>
                                <View style={{ flex: 8 }}>
                                    <Text style={styles.unitTitle}>{title}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('ViewAllProductsPage', { key: 'service' })}
                                    style={{ flex: 3 }}>
                                    <Text style={styles.unitTitle}>{'View All'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                {displayserviceData()}
                            </View>
                        </>
                        : null
                }
            </ScrollView>

            <ServiceModelComponent
                item={product}
                shippingMethods={props.shippingMethods}
                visible={modalVisible}
                onAddToBag={(item, selectedSlot, selectedshopID, slotdate) => booknow(item, selectedSlot, selectedshopID, slotdate)}
                onCancelPress={() => setmodalVisible(!modalVisible)}
                appConfig={props.appConfig}
                navigation={props.navigation}
            />



        </>
    );

}



export default ServicesScreen;
