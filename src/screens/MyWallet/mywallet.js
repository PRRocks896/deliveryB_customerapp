"use strict";
import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput, Keyboard } from 'react-native';
import AppStyles from '../../AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Dialog } from 'react-native-simple-dialogs';
import getamountWallet from '../../services/Wallet/getamountWallet';
import AsyncStorage from '@react-native-community/async-storage';
import getwallettransactions from '../../services/Wallet/getwalletTransaction';
import Appstyle from '../../AppStyles'
import moment from "moment";

export default class MyWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClickbtn: false,
            dialogVisible: false,
            amount: '',
            isLoading: false,
            walleteamount: '',
            transctionslist: []
        };
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.componentDidMount()

            });

    }
    componentDidMount = async () => {
        let mobile = await AsyncStorage.getItem('CurrentUser')
        let mobileParsed = JSON.parse(mobile)
        let phoneno = mobileParsed.data.mobile
        console.log("mobile", phoneno)
        const data = await getamountWallet(phoneno)
        if (data.success) {
            console.log("data", data.data.balance)
            this.setState({ walleteamount: data.data.balance })
        }
        let body = JSON.stringify({
            "where": {

            },
            "pagination": {
                "sortBy": "createdAt",
                "descending": true,
                "rowsPerPage": 50,
                "page": 1
            }
        })
        const transctions = await getwallettransactions(phoneno, body)
        this.setState({ transctionslist: transctions.data.list })

    }
    orderDetails = () => {
        const { transctionslist } = this.state
        return (
            <FlatList
                data={transctionslist}
                renderItem={({ item, index }) => {
                    const date = moment(item.createdAt).format('DD/MM/YYYY HH:mm')
                    
                    return(
                    <View style={{ marginBottom: 10, margin: 3 }}>
                        <View style={[styles.card, styles.detailMainCard]}>
                            <View style={{ flex: 8, flexDirection: 'column', justifyContent: 'center' }}>
                                <View style={styles.row}>
                                    <Text style={styles.tital}>Details: </Text>
                                    <Text style={styles.subtitle}> {item.transaction_details}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.tital}>Type: </Text>
                                    <Text style={[styles.subtitle,{ color: '#008000', fontFamily: Appstyle.fontFamily.semiBoldFont }]}> {item.transaction_type}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.tital}>Amount: </Text>
                                    <Text style={[styles.subtitle, { fontFamily: Appstyle.fontFamily.semiBoldFont }]}> {item.amount}</Text>
                                </View>
                            </View>
                            <View style={[styles.row, { position: 'absolute', right: 10, bottom: 10, marginTop: 10 }]}>
                               <Text style={styles.timedate}>{date}</Text>
                            </View>


                        </View>
                    </View>
                    )
                }}
                keyExtractor={(item) => item.id}
            />
        )
    }
    render() {
        const { isLoading, amount, walleteamount } = this.state
        return (
            <View style={[styles.container,{backgroundColor:'#fff'}]}>
                <View style={[styles.card,styles.row]}>
                    <Image style={styles.imgrs} source={AppStyles.iconSet.rupee}/>
                    <Text style={styles.rstxt}>{walleteamount}</Text>
                </View>
                <View style={styles.mainView}>
                    <Text style={{ fontSize: 18 }}>Payment History</Text>
                    {this.orderDetails()}
                </View>
                <TouchableOpacity
                    onPress={() => this.setState({ dialogVisible: true })}
                    style={styles.fotterbtn}>
                    <Icon name={'add'} size={35} color={'#fff'} />
                </TouchableOpacity>

                <Dialog
                    visible={this.state.dialogVisible}
                    title="Add amount to your wallet"
                    onTouchOutside={() => this.setState({ dialogVisible: false })}>
                    <View>
                        <TextInput
                            keyboardType='number-pad'
                            underlineColorAndroid="transparent"
                            placeholder='Add amount'
                            style={styles.cvvinput}
                            onChangeText={(text) => this.setState({ amount: text })}
                        />
                        <View style={styles.addbtnContainer}>
                            <TouchableOpacity style={styles.addcvvbutton} onPress={() => this.props.navigation.navigate('AddCards', { amount: amount })}>
                                {
                                    isLoading ?
                                        <ActivityIndicator color={'#000'} size="small" />
                                        :
                                        <Text style={styles.addtext}>Add</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>

                </Dialog>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    card: {
        marginTop: 5,
        backgroundColor: '#555555',
        padding: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        elevation: 5,
        height: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rstxt: {
        fontFamily: AppStyles.fontFamily.boldFont,
        fontSize: 30,
        color:'#fff'
    },
    mainView: {
        flex: 1,
        marginTop: 10
    },
    detailMainCard: {
        backgroundColor: '#fff',
        height: 'auto',
        flexDirection: 'row',
        padding: 10
    },
    fotterbtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: '#555555',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addbtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    addcvvbutton: {
        borderColor: '#a3a3a3',
        borderRadius: 5,
        width: '40%',
        height: 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addtext: {
        fontSize: 20
    },
    cvvinput: {
        borderBottomWidth: 1,
        borderBottomColor: '#a3a3a3'
    },
    tital: {
        fontFamily: Appstyle.fontFamily.regularFont,
        fontSize: 15
    },
    subtitle: {
        fontFamily: Appstyle.fontFamily.lightFont
    },
    row: {
        flexDirection: 'row'
    },
    timedate: {
        color: '#a3a3a3',
        fontFamily: Appstyle.fontFamily.semiBoldFont,
        fontSize:12
      },
      imgrs:{
          width:25,
          height:25,
          marginTop:3
      }
});