import React, { useEffect, useState, useRef } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, PermissionsAndroid, Alert, Share, ActivityIndicator, StyleSheet, } from "react-native";

import { Component } from "react";
import Swiper from "react-native-swiper";
const { width, height } = Dimensions.get("window");
import AppStyles from '../../AppStyles'
import AsyncStorage from "@react-native-community/async-storage";
import RBSheet from "react-native-raw-bottom-sheet";
import { getallShopList } from "../../services/Products/getsubCategory";
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { EventRegister } from "react-native-event-listeners";
import addToBagProduct from "../AddTobagProduct/addbagproduct";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import { Header } from "react-native-elements";
import Icon from 'react-native-vector-icons/MaterialIcons'
class ProductDetailsPageScreen extends Component {


    // static navigationOptions = ({ navigation, screenProps }) => {
    //     // const currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    //     return {
    //         title:
    //             typeof navigation.state.params === "undefined" ||
    //                 typeof navigation.state.params.title === "undefined"
    //                 ? "Product"
    //                 : (navigation.state.params.title).replace(/_/g, " "),
    //     };
    // };

    constructor(props) {
        super(props);
        this.state = {
            alreadyaddecart: false,
            loggedinuser: false,
            selecteditemSize: '',
            selecteditemcolor: '',
            quentity: 1,
            selectedShopid: '',
            shopList: []

        };
        this.appConfig =
            props.navigation.state.params.appConfig ||
            props.navigation.getParam("appConfig");

    }

    componentDidMount = () => {
        console.log("products in page model ", this.props.navigation.state.params.clickproduct)
        console.log("height * 0.95", height * 0.95)
        this.getloginid()
    }

    /**
     * Check Login or not
     */
    getloginid = async () => {
        let userid = await AsyncStorage.getItem('userId')
        if (userid == null) {
            this.setState({ loggedinuser: false })
            this.checkalreadyaddtocartinLocal()
        } else {
            this.setState({ loggedinuser: true })

            this.checkalreadyaddtocart()
        }
    }

    /**
     * check already added or not (Local storage)
     */
    checkalreadyaddtocartinLocal = async () => {
        let data = this.props.navigation.state.params.clickproduct
        let getproducrsoff = await AsyncStorage.getItem("Ofline_Products")
        let parseddata = JSON.parse(getproducrsoff)
        // console.log("data===============================", data._id)
        let found = parseddata.some(i => i.item._id == data._id)

        console.log("ofline found", found)
        if (found == true) {
            this.setState({ alreadyaddecart: true })
        } else {
            this.setState({ alreadyaddecart: false })
        }
    }

    /**
     * check already added or not (Api)
     */
    checkalreadyaddtocart = async () => {
        let data = this.props.navigation.state.params.clickproduct
        let userid = await AsyncStorage.getItem('userId')
        const getdata = await getbagproduct(userid)
        let found = getdata.data.data.some(i => i.products[0].product_id.productMasterId == data._id)
        // console.log("Found===============================================", found)
        if (found == true) {
            this.setState({ alreadyaddecart: true })
        } else {
            this.setState({ alreadyaddecart: false })
        }
    }
    /**
     * Quentity increment
     */
    incrementItem = async () => {
        this.setState({ quentity: this.state.quentity + 1 })
    }

    /**
     * Quentity Decrement
     */
    decrementItem = async () => {

        if (this.state.quentity !== 1) {
            console.log("this.state.quentity", this.props.quentityset, this.state.quentity)
            this.setState({ quentity: this.state.quentity - 1 })
        }
    }

    /**
 * Get Shop All List by Product Master id
 */
    getShopList = async () => {
        let data = this.props.navigation.state.params.clickproduct
        this.setState({ selectedShopid: data.productDetail ? data.productDetail.shop_id : '' })

        let id = data.productDetail.productMasterId ? data.productDetail.productMasterId : ''
        console.log("===================get shop", id)
        if (id) {
            const response = await getallShopList(id)
            console.log("Response For shop details", response)
            if (response.statusCode == 200) {
                this.setState({ shopList: response.data })
            }

        }
    }

    /**
     * Display shop list
     */
    displayshopList = () => {

        const { shopList } = this.state
        return (
            <FlatList
                data={shopList}
                renderItem={(item) => {
                    console.log("id==============", item.item._id)
                    return (
                        <TouchableOpacity onPress={() =>  { console.log(" item.item._id",  item.item._id) , this.setState({ selectedShopid: item.item._id })} }>
                            <View style={[styless.bottomsheet, { flexDirection: 'row' }]}>
                                <View style={{ flex: 8, flexDirection: 'row' }}>
                                    <Text style={styless.shopname}>{item.item.name}  </Text>
                                    {
                                        item.item.isVerified ?
                                            <Icons name='check-decagram' size={18} color={'#36D8FF'} style={{ textAlign: 'center', alignSelf: 'center', marginTop: 3 }} />
                                            : null
                                    }
                                </View>
                                <View style={{ flex: 3 }}>
                                    {
                                        this.state.selectedShopid == item.item._id ?
                                            <Icon name={'done'} size={20} color={'#000'} />
                                            : null
                                    }
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            // keyExtractor={(item) => (item._id).toString()}

            />
        )
    }

    /**
     * add to ofline Storage
     * @param {any} item 
     * @param {any} selecteditemcolor 
     * @param {any} selecteditemSize 
     * @param {any} qty 
     * @param {any} selectedshopID 
     */
    oflineStorage = async (item, selecteditemcolor, selecteditemSize, qty, selectedShopid) => {
        console.log("item", item, this.state.selectedShopid, selectedShopid, selecteditemcolor,selecteditemSize, qty )
        let getproducrsoff = await AsyncStorage.getItem("Ofline_Products")
        let parseddata = JSON.parse(getproducrsoff)
        console.log("Frist get Products off", parseddata)
        if (parseddata !== null) {
            console.log("add to local",)
            let found = parseddata.some(i => i.productid == item.productDetail._id)
            if (found == false) {
                let products = parseddata
                products.push({
                    item: item,
                    selecteditemcolor: selecteditemcolor,
                    selecteditemSize: selecteditemSize,
                    qty: qty,
                    selectedshopID: this.state.selectedShopid,
                    productid: item.productDetail._id
                })
                AsyncStorage.setItem("Ofline_Products", JSON.stringify(products))
                let cartlengthdata = await AsyncStorage.getItem('Ofline_Products')
                this.props.navigation.goBack()
                EventRegister.emit('cartlength', JSON.parse(cartlengthdata.length))
            } else {
                Alert.alert("", "already added")
                this.props.navigation.goBack()
            }

        } else {
            let products = []
            products.push({
                item: item,
                selecteditemcolor: selecteditemcolor,
                selecteditemSize: selecteditemSize,
                qty: qty,
                selectedshopID: this.state.selectedShopid,
                productid: item.productDetail._id
            })
            AsyncStorage.setItem("Ofline_Products", JSON.stringify(products))
            let cartlengthdata = await AsyncStorage.getItem('Ofline_Products')
            EventRegister.emit('cartlength', JSON.parse(cartlengthdata.length))
            this.props.navigation.goBack()
        }
        let producrsoff = await AsyncStorage.getItem("Ofline_Products")
        console.log("Ofliine products======================", JSON.parse(producrsoff))
    }

    /**
* 
* @param {any} item product data 
* add to bag product
*/
    onAddToBag = async (item, color, size, qty, selectedShopid) => {
        if(this.state.selectedShopid !== undefined || this.state.selectedShopid !== '' ) {
            console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::",this.state.selectedShopid, selectedShopid)
            addToBagProduct(item, this.state.alreadyAddecart, color, size, qty, this.state.selectedShopid)
            this.setState({ quentity: 1 })
            this.props.navigation.goBack()

        }else {
            Alert.alert("", "Please Select Shop")
        }
        //add to bag product call from component
    };

    render() {
        const { alreadyaddecart, selecteditemcolor, quentity, shopList, loggedinuser, selecteditemSize, selectedShopid } = this.state
        let data = this.props.navigation.state.params.clickproduct
        // console.log("alreadyaddecart=============", data,)
        return (
            <View style={styless.container}>
                 <Header
                leftComponent={
                    <Icon
                        name={'keyboard-backspace'}
                        size={30}
                        color={'#000'}
                        style={{ padding: 5, position: 'absolute', left: 3, top: -15 }}
                        onPress={() => this.props.navigation.goBack()} />
                }
                centerComponent={{ text:  this.props.navigation.state.params.title, style: { color: '#000' , fontSize:20} }}
                containerStyle={{
                    backgroundColor: '#fff',
                    justifyContent: 'space-around',
                  }}
            />

                <View style={{ flex: 5 }}>

                    <Swiper
                        loop={false}
                        activeDot={<View style={styless.activeDot} />}
                        containerStyle={styless.swiperContainer}
                    >
                        {
                            data.productImage && data.productImage.map((item) => {
                                return (
                                    <View style={styless.imageBackgroundContainer}>
                                        <Image
                                            style={styless.imageBackground}
                                            source={{ uri: item }}
                                        />
                                    </View>
                                )
                            })}

                    </Swiper>
                </View>
                <View style={{ flex: 7 }}>
                    <ScrollView>
                        <View style={styless.descriptionContainer}>
                            <Text style={styless.title}>{data.name}</Text>
                            <Text style={[styless.title, { paddingTop: 5, fontSize: 15 }]}>{data.description}</Text>
                            <View style={{ flexDirection: 'row', marginLeft: 7 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styless.title, { paddingTop: 5, fontSize: 20 }]}>₹ {data.productDetail.discount_price}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styless.discountPrice, { paddingTop: 5, fontSize: 20 }]}> ₹ {data.productDetail.price}</Text>
                                </View>
                                <View style={{flex:3}} />
                            </View>
                            {
                                data.productDetails ?
                                    <Text
                                        style={styless.price}
                                    >₹ {data.productDetail ? checktype(data.productDetail.price) : null}</Text>
                                    : null
                            }

                            {
                                data.productDetail && data.productDetail.hasOwnProperty('color') ? data.productDetail.color !== null && data.productDetail.color.length ?
                                    <View style={{ flexDirection: 'row', marginLeft: 7 }}>
                                        <Text style={styless.titlecolor}>{'Colors'}</Text>
                                        {
                                            data.productDetail.color.map((item) => {
                                                return (
                                                    <TouchableOpacity onPress={() => this.setState({ selecteditemcolor: item })} style={[styless.colorview, { backgroundColor: selecteditemcolor == item ? '#a3a3a3' : '#fff' }]}>
                                                        <Text style={styless.colorText}>{item} </Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                    : null
                                    : null
                            }
                            {
                                data.productDetail && data.productDetail.hasOwnProperty('size') ? data.productDetail.size !== null && data.productDetail.size.length ?
                                    <View style={{ flexDirection: 'row', marginLeft: 7 }}>
                                        <Text style={styless.titlecolor}>{'Size'}    </Text>
                                        {data.productDetail.size.map((item) => {
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => this.setState({ selecteditemSize: item })}
                                                    style={[styless.colorview, { backgroundColor: selecteditemSize == item ? '#a3a3a3' : '#fff' }]}>
                                                    <Text style={styless.colorText}>{item} </Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                    : null
                                    : null
                            }
                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 7 }}>
                                <TouchableOpacity
                                    onPress={() => this.incrementItem()}
                                    style={[styless.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
                                >
                                    <Image
                                        source={AppStyles.iconSet.add}
                                        style={styless.quantityControlIcon}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                                <View>
                                    <Text style={styless.quantityCount}>{quentity}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.decrementItem()}
                                    style={[styless.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}>
                                    <Image
                                        source={AppStyles.iconSet.minus}
                                        style={styless.quantityControlIcon}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {
                        alreadyaddecart ?
                            <TouchableOpacity
                                onPressIn={() => this.props.navigation.navigate("Bag", { appConfig: this.props.navigation.state.params.appConfig })}
                                onPress={() => this.props.navigation.goBack()}
                                style={styless.addToBagContainerStyle}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>{"GO TO CART"}</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                onPress={() => [this.RBSheet.open(), this.getShopList()]}
                                style={styless.addToBagContainerStyle}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>{"ADD TO BAG"}</Text>
                            </TouchableOpacity>
                    }
                </View>
                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
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
                        {
                            shopList.length ?
                                <>
                                    {this.displayshopList()}
                                    {
                                        loggedinuser ?
                                            <TouchableOpacity
                                                onPress={() => [this.onAddToBag(data, selecteditemcolor, selecteditemSize, quentity, selectedShopid), this.RBSheet.close()]}
                                                style={styless.applybutton}>
                                                <Text style={{ color: '#fff', fontSize: 15 }}>{"Proceed"}</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity
                                                onPress={() => [this.oflineStorage(data, selecteditemcolor, selecteditemSize, quentity, selectedShopid), this.RBSheet.close()]}
                                                style={styless.applybutton}>
                                                <Text style={{ color: '#fff', fontSize: 15 }}>{"Proceed"}</Text>
                                            </TouchableOpacity>
                                    }

                                </>
                                :
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>{'No Shop List Found'}</Text>
                                </View>
                        }
                    </View>
                </RBSheet>
            </View>
        )

    }
}


export default ProductDetailsPageScreen;



const styless = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    viewContainer: {
        // flex: 1
    },
    activeDot: {
        backgroundColor: "#000",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3
    },
    imageBackgroundContainer: {
        flex: 1.9,
        backgroundColor: "#fff",
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'contain'
    },

    descriptionContainer: {
        height: 'auto'
    },
    title: {
        fontFamily: AppStyles.fontFamily.regularFont,
        color: '#000',
        paddingTop: 20,
        paddingLeft: 15,
        fontSize: 17
    },
    price: {
        fontFamily: AppStyles.fontFamily.regularFont,
        color: '#000',
        paddingTop: 7,
        paddingLeft: 15,
        fontSize: 15
    },
    titlecolor: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 18,
        marginLeft: 8,
        fontFamily: AppStyles.fontFamily.regularFont,

    },
    colorText: {
        color: '#000',
        fontSize: 15
    },
    colorview: {
        borderColor: '#a3a3a3',
        borderWidth: 1,
        backgroundColor: '#fff',
        width: 'auto',
        padding: 5,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 50,
        marginLeft: 10,
        marginTop: 5
    },
    borderLine: {
        width: "97%",
        height: 0.5,
        alignSelf: "center",
        marginTop: 10,
        backgroundColor: "#d9d9d9"
    },
    addToBagContainerStyle: {
        backgroundColor: '#222222',
        // flex: 2.5,
        height: 50,
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5,
        width: '90%'
        // alignSelf: "flex-end",

    },
    swiperContainer: {
        // alignItems: "center",
        justifyContent: "center",
        flex: 5
    },
    quantityControlIconContainer: {
        height: 25,
        width: 25,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#a3a3a3',
        alignItems: "center",
        justifyContent: "center"
    },
    quantityControlIcon: {
        height: 10,
        width: 10,
        tintColor: "#bdbdc2"
    },
    applybutton: {
        backgroundColor: '#222222',
        height: 40,
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        width: '40%',
        alignSelf: 'center'


    },
    bottomsheet: {
        padding: 10,
        paddingLeft: 15,
        paddingTop: 20
    },
    shopname: {
        fontSize: 15,
        fontFamily: AppStyles.fontFamily.regularFont,
    },
    discountPrice: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
        fontSize: 15,
        color: '#a3a3a3',
        fontFamily: AppStyles.fontFamily.regularFont,
    }
})


