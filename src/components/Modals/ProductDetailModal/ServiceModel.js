import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StatusBar,
    Dimensions,
    Share,
    TouchableOpacity,
    Image,
    AsyncStorage,
    FlatList,
    Alert
} from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";
import Swiper from "react-native-swiper";
import Header from "./Header";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import moment from 'moment'

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import DatePicker from 'react-native-datepicker'
import { Picker } from '@react-native-community/picker'
import { getallShopList } from "../../../services/Products/getsubCategory";
import RBSheet from "react-native-raw-bottom-sheet";
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
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
function ServiceModelComponent(props) {
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [alreadyaddecart, setalreadyaddecart] = useState(false)
    const [selecteditemcolor, setselecteditemcolor] = useState('')
    const [selecteditemSize, setselecteditemSize] = useState('')
    const [quentity, setquentity] = useState(1)
    const [shopList, setshopList] = useState([])
    const refRBSheet = useRef();
    const [selectedshopID, setselectedshopID] = useState('')
    const { visible, onCancelPress, item, onAddToBag, appConfig, productDetails, alreadyAddecart, navigation, bookNow } = props;
    const [selectedSlot, setselectedSlot] = useState('')
    const [slotdate, setslotdate] = useState(moment().format('DD/MM/YYYY'))
    const [serviceData, setserviceData] = useState([])

    /**
     * Get Shop All List by Product Master id
     */
    const getShopList = async () => {
        setselectedshopID(item.serviceDetail ? item.serviceDetail.shop_id : '')
        let id = item.serviceDetail.serviceMasterId ? item.serviceDetail.serviceMasterId : ''
        console.log("===================get shop", id, item)
        if (id) {
            const response = await getallShopList(id)
            console.log("Response For shop details", response)
            if (response.statusCode == 200) {
                setshopList(response.data)
            }

        }
    }




    const onShare = async () => {

        await Share.share({
            title: "Shopertino Product",
            dialogTitle: `Shopertino Product: ${item.name}`,
            message: item.name + item.description + item.serviceDetail.price,
            image: item.serviceImage[0]

        });

    };




    const displayshopList = () => {
        return (
            <FlatList
                data={shopList}
                renderItem={(item) => {
                    return (
                        <TouchableOpacity onPress={() => setselectedshopID(item.item._id)}>
                            <View style={[styles.bottomsheet, { flexDirection: 'row' }]}>
                                <View style={{ flex: 8, flexDirection: 'row' }}>
                                    <Text style={styles.shopname}>{item.item.name}  </Text>
                                    {
                                        item.item.isVerified ?
                                            <Icons name='check-decagram' size={18} color={'#36D8FF'} style={{ textAlign: 'center', alignSelf: 'center', marginTop:5 }} />
                                            : null
                                    }
                                </View>
                                <View style={{ flex: 3 }}>
                                    {
                                        selectedshopID == item.item._id ?
                                            <Icon name={'done'} size={20} color={'#000'} />
                                            : null
                                    }
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => (item._id).toString()}

            />
        )
    }

    if (item) {
        return (
            <>
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
                                    item.serviceImage && item.serviceImage.map((item) => {
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
                                <Text style={styles.title}>Available Slot : {item.serviceDetail && item.serviceDetail.serviceSlot[0].start} to {item.serviceDetail && item.serviceDetail.serviceSlot[0].end}</Text>
                                <Text style={[styles.title, { paddingTop: 5, fontSize: 15, marginTop: 10 }]}>{item.description}</Text>
                                <View style={styles.inputContainer}>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        date={slotdate}
                                        mode="date"
                                        placeholder="select date"
                                        format="DD-MM-YYYY"
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        minDate={new Date()}
                                        maxDate={moment().day(17)}
                                        customStyles={{
                                            dateIcon: {
                                                position: 'absolute',
                                                left: 0,
                                                top: 4,
                                                marginLeft: 10
                                            },
                                            dateInput: {
                                                marginLeft: -180,
                                                borderWidth: 0,

                                            }
                                            // ... You can check the source to find the other keys.
                                        }}
                                        onDateChange={(date) => setslotdate(date)}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Picker
                                        selectedValue={selectedSlot}
                                        style={{ width: '100%', height: 40 }}
                                        onValueChange={(itemValue, itemIndex) => {
                                            if (item.serviceDetail.serviceSlot[0].start <= itemIndex && item.serviceDetail.serviceSlot[0].end >= itemIndex) {
                                                setselectedSlot(itemValue)
                                            } else {
                                                Alert.alert("", `Plaease Select time Between ${item.serviceDetail.serviceSlot[0].start} to ${item.serviceDetail.serviceSlot[0].end}`)
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
                                <Text style={styles.price}>₹ {item.serviceDetail ? item.serviceDetail.price : null}</Text>
                                <View style={styles.borderLine} />
                                <TouchableOpacity
                                    onPress={() => [refRBSheet.current.open(), getShopList()]}
                                    style={[styles.addToBagContainerStyle, { marginBottom: 20 }]}>
                                    <Text style={{ color: '#fff', fontSize: 20 }}>{"Book Now"}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>

                </Modal>

                <RBSheet
                    ref={refRBSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={false}
                    height={210}
                    openDuration={250}
                    onRequestClose={() => refRBSheet.current.close()}
                    customStyles={{
                        draggableIcon: {
                            backgroundColor: "#a3a3a3",
                            width: '20%'
                        },
                        container: {
                            borderTopRightRadius: 50,
                            borderTopLeftRadius: 50,
                            padding: 10
                        }
                    }}
                >
                    <View>
                        {displayshopList()}

                        <TouchableOpacity
                            onPress={ () => [onAddToBag(item, selectedSlot, selectedshopID,slotdate ),refRBSheet.current.close() ]}
                            style={styles.applybutton}>
                            <Text style={{ color: '#fff', fontSize: 15 }}>{"Proceed"}</Text>
                        </TouchableOpacity>
                    </View>
                </RBSheet>
            </>
        );
    }
}



export default ServiceModelComponent;
