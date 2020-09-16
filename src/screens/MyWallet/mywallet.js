"use strict";
import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput, Keyboard } from 'react-native';
import AppStyles from '../../AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Dialog } from 'react-native-simple-dialogs';
import getamountWallet from '../../services/Wallet/getamountWallet';
import AsyncStorage from '@react-native-community/async-storage';

let data = [
    {
        id: 1,
        name: 'Jeremiha Curtis',
        rs: '$250.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    {
        id: 2,
        name: 'Jeremiha Curtis',
        rs: '$550.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    {
        id: 3,
        name: 'Jeremiha Curtis',
        rs: '$320.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    {
        id: 4,
        name: 'Jeremiha Curtis',
        rs: '$650.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    {
        id: 5,
        name: 'Jeremiha Curtis',
        rs: '$890.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    {
        id: 6,
        name: 'Jeremiha Curtis',
        rs: '$100.00',
        leval: 'Basic lavel',
        earned: 'Earned',
    },
    
]
export default class MyWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClickbtn: false,
            dialogVisible: false,
            amount:'',
            isLoading: false,
            walleteamount:''
        };
        this.props.navigation.addListener(
            'didFocus',
            payload => {
              this.componentDidMount()
      
            });

    }
    componentDidMount = async () => {
        let mobile = await AsyncStorage.getItem('CurrentUser')
        let mobileParsed= JSON.parse(mobile)
        let phoneno = mobileParsed.data.mobile
        console.log("mobile", phoneno)
        const data = await getamountWallet(phoneno)
        if(data.success){
            console.log("data",data.data.balance)
            this.setState({walleteamount: data.data.balance})
        }

    }
    orderDetails = () => {
        return (
            <FlatList
                data={data}
                renderItem={({ item, index }) => (
                    <View style={{ marginBottom: 10, margin: 3 }}>
                        <View style={[styles.card, styles.detailMainCard]}>
                            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={require('../../../assets/icons/user.png')} style={styles.user} />
                            </View>
                            <View style={{ flex: 8, flexDirection: 'column', justifyContent: 'center' }}>
                                <Text style={styles.customerName}>{item.name}</Text>
                                <Text style={{ color: '#a3a3a3' }}>{item.leval}</Text>
                            </View>
                            <View style={styles.customertotal}>
                                <Text style={styles.customerName}>{item.rs}</Text>
                            </View>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />
        )
    }
    render() {
        const {isLoading, amount ,walleteamount} = this.state
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.rstxt}>{walleteamount}</Text>
                </View>
                <View style={styles.mainView}>
                    <Text style={{ fontSize: 18 }}>Payment History</Text>
                    {this.orderDetails()}
                </View>
                <TouchableOpacity 
                onPress={ () => this.setState({dialogVisible:true})}
                style={styles.fotterbtn}>
                    <Icon name={'add'} size={35} color={'#000'} />
                </TouchableOpacity>

                <Dialog
                  visible={this.state.dialogVisible}
                  title="Add amount to your wallet"
                  onTouchOutside={() => this.setState({dialogVisible:false})}>
                  <View>
                    <TextInput
                      keyboardType='number-pad'
                      underlineColorAndroid="transparent"
                      placeholder='Add amount'
                      style={styles.cvvinput}
                      onChangeText={(text) => this.setState({amount: text})}
                    />
                    <View style={styles.addbtnContainer}>
                      <TouchableOpacity style={styles.addcvvbutton} onPress={ () => this.props.navigation.navigate('AddCards',{amount: amount})}>
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
        backgroundColor: '#a3a3a3',
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
        fontSize: 30
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
    user: {
        width: 35,
        height: 35,
        justifyContent: 'center'
    },
    customerName: {
        fontSize: 18
    },
    fotterbtn:{
        position:'absolute',
        bottom:10,
        right:10,
        width:50,
        height:50,
        borderRadius:50,
        backgroundColor:'#a3a3a3',
        alignItems:'center',
        justifyContent:'center'
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
});