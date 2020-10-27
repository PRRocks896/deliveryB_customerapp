import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert , Share} from "react-native";
import dynamicStyles from "./styles";
import Swiper from "react-native-swiper";
import Header from "../../components/Modals/ProductDetailModal/Header";
import { Picker } from '@react-native-community/picker'
import { useColorScheme } from "react-native-appearance";
import AsyncStorage from "@react-native-community/async-storage";
const deviceWidth = Dimensions.get("window").width;
import RNFetchBlob from "react-native-fetch-blob";
const deviceHeight = Dimensions.get("window").height;
import moment from 'moment'
const timedata = [
    { id: 1, item: '01 : 00 Am' },
    { id: 2, item: '02 : 00 Am' },
    { id: 3, item: '03 : 00 Am' },
    { id: 4, item: '04 : 00 Am' },
    { id: 5, item: '05 : 00 Am' },
    { id: 6, item: '06 : 00 Am' },
    { id: 7, item: '07 : 00 Am' },
    { id: 8, item: '08 : 00 Am' },
    { id: 9, item: '09 : 00 Am' },
    { id: 10, item: '10 : 00 Am' },
    { id: 11, item: '11 : 00 Am' },
    { id: 12, item: '12 : 00 Am' },
    { id: 13, item: '13 : 00 Pm' },
    { id: 14, item: '14 : 00 Pm' },
    { id: 15, item: '15 : 00 Pm' },
    { id: 16, item: '16 : 00 Pm' },
    { id: 17, item: '17 : 00 Pm' },
    { id: 18, item: '18 : 00 Pm' },
    { id: 19, item: '19 : 00 Pm' },
    { id: 20, item: '20 : 00 Pm' },
    { id: 21, item: '21 : 00 Pm' },
    { id: 22, item: '22 : 00 Pm' },
    { id: 23, item: '23 : 00 Pm' },
    { id: 24, item: '24 : 00 Pm' },
]
function ServicesScreen(props) {
    const { title, servicedata, appConfig } = props;
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [modalVisible, setmodalVisible] = useState(false)
    const [product, setproduct] = useState({})
    const [selectedSlot, setselectedSlot] = useState('')

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
                                <Image style={styles.productCardImage} source={{ uri: item.item.serviceImage }} />
                            </View>
                            <Text style={styles.productCardPrice}
                            >₹ {item.item.serviceDetail.price}</Text>
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
            message: product.name + ',' +  product.description + ',' + product.serviceDetail.price,
           
    
          });
      
     }

    const booknow = async (item) => {
        console.log("item>>>>>>>>>>>>>>", item.serviceDetail.shop_id)
        let userid = await AsyncStorage.getItem('userId')
            setmodalVisible(false)
            if(selectedSlot !== ''){
                props.navigation.navigate('ServicePaymentOptions',
                    {
                        appConfig: appConfig,
                        customerID: userid,
                        totalammount: product.serviceDetail.price,
                        slot: selectedSlot,
                        shopid: item.serviceDetail.shop_id,
                        service_id:product.serviceDetail._id,
                        slot_date:moment().format('DD/MM/YYYY'),
                        booking_number: Math.floor(100000000000 + Math.random() * 900000000000)
                    })

            }else{
                Alert.alert("","Please Select Slot")
            }

    }
    return (
        <>
            <ScrollView style={styles.container} >
                <View style={styles.unitContainer}>
                    <Text style={styles.unitTitle}>{title}</Text>
                </View>
                <View>
                    {displayserviceData()}
                </View>
            </ScrollView>
            {
                modalVisible ?


                    <Modal
                        animationType="slide"
                        transparent={true}
                        hideModalContentWhileAnimating={true}
                        visible={modalVisible}
                        animationInTiming={600}
                        animationOutTiming={600}
                        backdropTransitionInTiming={600}
                        backdropTransitionOutTiming={600}
                        style={styles.modalStyle}
                        animationIn="zoomInDown"
                        animationOut="zoomOutUp"
                        backdropOpacity={0.5}
                        deviceWidth={deviceWidth}
                        deviceHeight={deviceHeight}
                        onRequestClose={() => {
                            setmodalVisible(!modalVisible)
                        }}
                    >
                        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
                        <View style={styles.transparentContainer}>
                            <View style={styles.viewContainer}>
                                <ScrollView style={styles.descriptionContainer}>
                                    <Header
                                        onCancelPress={() => setmodalVisible(false)}
                                        headerContainerStyle={styles.headerContainerStyle}
                                        onSharePress={onShare} />
                                    <Image
                                        style={{ width: '100%', height: 200, marginTop: 60 }}
                                        resizeMode={'contain'}
                                        source={{ uri: product.serviceImage }}
                                    />
                                    <Text style={styles.title}>{product.name}</Text>
                                    <Text style={styles.title}>Available Slot : {product.serviceDetail.serviceSlot[0].start} to {product.serviceDetail.serviceSlot[0].end}</Text>
                                    <Text style={[styles.title, { paddingTop: 5, fontSize: 15, marginTop: 10 }]}>{product.description}</Text>
                                    <View style={styles.inputContainer}>
                                        <Picker
                                            selectedValue={selectedSlot}
                                            style={{ width: '100%', height: 40 }}
                                            onValueChange={(itemValue, itemIndex) => {
                                                if (product.serviceDetail.serviceSlot[0].start <= itemIndex && product.serviceDetail.serviceSlot[0].end >= itemIndex) {
                                                    setselectedSlot(itemValue)
                                                } else {
                                                    Alert.alert("", `Plaease Select time Between ${product.serviceDetail.serviceSlot[0].start} to ${product.serviceDetail.serviceSlot[0].end}`)
                                                }
                                            }
                                            }>
                                            <Picker.Item label="Select Slot" value="" />
                                            {
                                                timedata.map((item) => {
                                                    return (
                                                        <Picker.Item label={item.item} value={item.id} key={item.id} />
                                                    )

                                                })
                                            }
                                        </Picker>
                                    </View>
                                    <Text style={styles.price}>₹ {product.serviceDetail ? product.serviceDetail.price : null}</Text>
                                    <View style={styles.borderLine} />
                                    <TouchableOpacity
                                        onPress={() => booknow(product)}
                                        style={[styles.addToBagContainerStyle, { marginBottom: 20 }]}>
                                        <Text style={{ color: '#fff', fontSize: 20 }}>{"Book Now"}</Text>
                                    </TouchableOpacity>
                                </ScrollView>

                            </View>
                        </View>
                    </Modal>
                    : null
            }
        </>
    );

}



export default ServicesScreen;