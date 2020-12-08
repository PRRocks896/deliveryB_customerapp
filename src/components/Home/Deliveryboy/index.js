import React, { useEffect, useState } from "react";
import { ScrollView, View, Dimensions, FlatList, TouchableOpacity, Image, Text, Modal, StatusBar, Alert, Share, ActivityIndicator } from "react-native";
import dynamicStyles from "../styles";
import { useColorScheme } from "react-native-appearance";


function ShowDeliveryBoyList(props) {

    const { title, dboylist } = props

    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);

    const displaydboylist = () => {
        return (
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={dboylist}
                renderItem={(item) => {
                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.dboyView}
                            onPress={ () => props.navigation.navigate('DBoyDetails', {details: item.item.})}
                        >
                            <View style={[styles.dboyContainer, { marginLeft: 5}]}>
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
                                <Image style={styles.delievryboyimg} source={item.item.deliveryboy.hasOwnProperty('profilePicture')  ? {uri:item.item.deliveryboy.profilePicture }  : require('../../../../assets/icons/user.png')} />
                            </View>
                            <View >

                                <Text style={[styles.productCardPrice, { marginLeft: 5,}]}
                                >{item.item.deliveryboy.user_id.name}</Text>
                                <Text style={styles.productCardDescription}> {(item.item.distance).toFixed(2)} </Text>
                            </View>
                            <View style={[styles.applybutton, {width:'90%'}]}>
                                <Text style={{color:'#fff'}}>{'Hire'}</Text>
                               
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
            {
                dboylist.length && displaydboylist()
            }
        </View>
    );

}



export default ShowDeliveryBoyList;
