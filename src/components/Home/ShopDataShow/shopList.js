import React, { useEffect, useState, useRef } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator, } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";
import { getshopeListbyType, getshopTypeList } from "../../../services/Shop";
import RBSheet from "react-native-raw-bottom-sheet";
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'

function ShopList(props) {

    const { title } = props

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const [shoplistArray, setshoplistArray] = useState([])
    const [shopsArray, setshopsArray] = useState([])
    const [shoptypeid, setshoptypeid] = useState('')
    const refRBSheet = useRef();

    useEffect(() => {
        getlistofShop()
    }, [])

    const getlistofShop = async () => {
        let body = JSON.stringify({
            "where": "",
            "pagination": {
                "sortBy": "type",
                "descending": 0,
                "rowsPerPage": 20,
                "page": 1
            }
        })
        const response = await getshopTypeList(body)

        console.log("all shop type", response.data.list)
        if (response.statusCode == 200) {
            setshoplistArray(response.data.list)
        }
    }

    const getshopbyType = async (typeid) => {
        setshoptypeid(typeid)
        refRBSheet.current.open()
        let body = JSON.stringify({
            "where": {},
            "pagination": {
                "sortBy": "name",
                "descending": 0,
                "rowsPerPage": 10,
                "page": 1
            }
        })
        const response = await getshopeListbyType(body, typeid)
        // console.log("All shop List ", response)
        if (response.statusCode == 200) {
            setshopsArray(response.data.list, typeid)
        }
    }
    const displayshopTypeList = () => {
        return (
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={shoplistArray}
                renderItem={(item) => {
                    return (
                        <TouchableOpacity
                        // onPress={() => getshopbyType(item.item._id)}
                        onPress= { () => props.navigation.navigate('AllShopListScreen', {id:item.item._id, title:item.item.type})}
                        style={styles.categorybox}>
                         <View style={{ flex: 3 }}>
                           {
                             item.item.shopTypeImage ?
                               <Image style={styles.categoryimg} source={{ uri: item.item.shopTypeImage }} />
                               :
                               <Image style={styles.categoryimg} source={require('../../../../assets/images/logo.png')} />
                           }
                         </View>
                         <View style={{ flex: 5 , marginTop:3}}>
                           <Text style={styles.categoryText}>{(item.item.type).replace(/_/g, " ")}</Text>
                         </View>
                       </TouchableOpacity>
                    )
                }}

            />
        )
    }

    const showShopList = () => {
        return (
            <FlatList
                data={shopsArray}
                renderItem={(item) => {
                   
                    return (
                        <TouchableOpacity onPress={() => [refRBSheet.current.close(), props.navigation.navigate('ShopWiseProduct', { shopid: item.item._id, shopname: item.item.name })]}>
                            <View style={[styles.bottomsheet, { flexDirection: 'row' }]}>
                                <View style={{ flexDirection: 'row', flex: 9 }}>
                                    <View style={{ flex: 5 }}>
                                        {
                                            item.item.shopImage ?

                                                <Image style={{ width: 150, height: 100 }} source={{ uri: item.item.shopImage }} />
                                                :
                                                <Image style={{ width: 100, height: 100 }} source={require('../../../../assets/images/logo.png')} />

                                        }
                                    </View>
                                    <View style={{ flex: 6 }}>
                                        <View style={{ flexDirection: 'row' }}>

                                            <Text style={[styles.shopname, { fontSize: 18 }]}> {item.item.name}  </Text>
                                            {
                                                item.item.isVerified ?
                                                    <Icons name='check-decagram' size={20} color={'#36D8FF'} style={{ marginTop: 10, marginLeft: 10 }} />
                                                    : null
                                            }
                                        </View>
                                        <Text style={styles.shopname}> {item.item.shopAddress}  </Text>
                                    </View>
                                </View>
                            </View>

                        </TouchableOpacity>
                    )
                }}

            />
        )
    }

    return (

        <View style={styles.container} >
            <View style={[styles.unitContainer, { flexDirection: 'row' }]}>
                <Text style={styles.unitTitle}>{title}</Text>
            </View>
            { shoplistArray.length ? displayshopTypeList() : null

            }
            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={false}
                height={500}
                openDuration={250}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 50,
                        borderTopRightRadius: 50
                    },
                    draggableIcon: {
                        backgroundColor: "#000"
                    }
                }}
            >
                <View style={{ marginLeft: 10, marginRight: 10 }}>
                    {shopsArray.length !== 0 ? showShopList() :
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                            <Text>No Data Found</Text>
                        </View>}
                </View>
            </RBSheet>
        </View>
    );

}



export default ShopList;
