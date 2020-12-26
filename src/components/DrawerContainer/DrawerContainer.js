import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native-appearance";
import DrawerItem from "../DrawerItem/DrawerItem";
import deviceStorage from "../../utils/deviceStorage";
import AppStyles from "../../AppStyles";
import dynamicStyles from "./styles";
import ProfileImageCard from "../Profile/ProfileImageCard";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'react-native-fetch-blob'
import api from '../../services/url.service'
import { EventRegister } from 'react-native-event-listeners'
import { ScrollView } from "react-native-gesture-handler";
import getProfileDetails from "../../services/Profile/getProfile";
import { Alert } from "react-native";


const options = {
  title: 'Select Profile',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};
function DrawerContainer(appConfig) {
  return props => {
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme);
    const { navigation } = props;
    const [profilepic, setProfilepic] = useState(null)
    const [isLoading, setIsloading] = useState(false)

    

    const [loggedinuser, setloggedinuser] = useState(false)

    const onLogout = async () => {
      navigation.closeDrawer()
      Alert.alert(
        "Sign out",
        "Are You sure you want to sign out?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => logoutUser() }
        ],
        { cancelable: false }
      );


     
    };

    const logoutUser = async () => {
      
     
     await AsyncStorage.removeItem('userId')
      await deviceStorage.removeUserData();
      await AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(async () => {
          const keys = await AsyncStorage.getAllKeys()
          if (keys.length == 0) {
            navigation.navigate("MainStack");
            getloginid()
          }
        });
    }

    useEffect(() => {
      getimg()
      getloginid()
      
    })

    

    const getloginid = async () => {
      let userid;
      userid = await AsyncStorage.getItem('userId')
       EventRegister.addEventListener('USerLoginId', (data) => userid = data)
      console.log("UserLogin id>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", userid)
      if (userid == null) {
        setloggedinuser(false)
      } else {
        setloggedinuser(true)
      }
    }


    const getimg = async () => {

      let loginData = await AsyncStorage.getItem('LoginData')
      let details = JSON.parse(loginData)
      let body = JSON.stringify({
        id: details.userId,
        reqToken: details.reqToken,
      })
      const data = await getProfileDetails(body);

      setProfilepic(data.data.profilePicture)
      EventRegister.addEventListener('profileImage', (data) => { setProfilepic(data) })

    }

    const imagePicker = () => {
      ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {

        } else if (response.error) {

        } else if (response.customButton) {

        } else {
          setProfilepic(response.path)
          profilepicfun()
          uploadProfileImage(response.path, response.type, response.fileName)
        }
      })
    }

    /**
   * Update Profile
   */
    const uploadProfileImage = async (Imagepath, Imagetype, fileName) => {
      setIsloading(true)
      let loginData = await AsyncStorage.getItem('LoginData')
      let details = JSON.parse(loginData)
      RNFetchBlob.fetch('POST', api.changeProfileImage.changeProfileImage, {
        Authorization: details.token,
        'Content-Type': 'multipart/form-data',
      }, [
        { name: 'id', data: details.userId },
        { name: 'profile', filename: fileName, type: Imagetype, data: RNFetchBlob.wrap(Imagepath) },
      ]).then((resp) => {
        let data = resp.json()

        setIsloading(false)
        EventRegister.emit('profileImage', data.data.profilePhoto)
        AsyncStorage.setItem("Profilepic", data.data.profilePhoto)
        setProfilepic(data.data.profilePhoto)
        profilepicfun()

      }).catch((err) => {

      })
    }
    const profilepicfun = () => {
      return (
        <TouchableOpacity style={styles.editpic} onPress={() => imagePicker()}>
          <Icon name={'pencil-square-o'} size={25} color={'#000'} />
        </TouchableOpacity>
      )
    }
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} >
        {
          loggedinuser ?
            <View style={{ flex: 3 }}>
              {

                isLoading == false ?
                  <>
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={profilepic == null ? require('../../../assets/icons/user.png') : { uri: profilepic }}
                        style={styles.cardImage} />
                      {profilepicfun()}
                    </View>
                  </>
                  :
                  <ActivityIndicator size="large" color="#000" />
              }
            </View>
            :
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, flex: 2 }}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.cardImage} />
            </View>
        }
        <View style={styles.container}>
          <DrawerItem
            title="HOME"
            source={AppStyles.iconSet.homeDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("Home", { appConfig })
            }}
          />
          <DrawerItem
            title="SHOP"
            source={AppStyles.iconSet.shopDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("Shop", { appConfig });
            }}
          />
          <DrawerItem
            title="BAG"
            source={AppStyles.iconSet.shoppingBagDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("ShoppingBag", { appConfig });
            }}
          />
          {/* <DrawerItem
            title="SEARCH PRODUCTS"
            source={AppStyles.iconSet.searchDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("Search", { appConfig });
            }}
          />
          <DrawerItem
            title="SEARCH SERVICE"
            source={AppStyles.iconSet.searchDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("SearchService", { appConfig });
            }}
          /> */}
          {
            loggedinuser ?
              <>
                <DrawerItem
                  title="ORDERS"
                  source={AppStyles.iconSet.orderDrawer}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("Order", { appConfig });
                  }}
                />
                <DrawerItem
                  title="BOOKED SERVICE"
                  source={AppStyles.iconSet.orderDrawer}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("ServicebookDetails", { appConfig });
                  }}
                />

                <DrawerItem
                  title="DELIVERY BOY HIRE"
                  source={AppStyles.iconSet.orderDrawer}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("DeliveryboyhireddrawerScreen", { appConfig });
                  }}
                />
                <DrawerItem
                  title="DELIVERY BOY BOOKING"
                  source={AppStyles.iconSet.orderDrawer}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("DBoyOrdersScreen", { appConfig });
                  }}
                />
                {/* <DrawerItem
                  title="ADD CARDS"
                  source={AppStyles.imageSet.creditCard}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("AddCards", { appConfig });
                  }}
                /> */}
                <DrawerItem
                  title="MY WALLET"
                  source={AppStyles.imageSet.payment}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("MyWallet", { appConfig });
                  }}
                />
                <DrawerItem
                  title="PROFILE"
                  source={AppStyles.iconSet.profileDrawer}
                  onPress={() => {
                    navigation.closeDrawer()
                    navigation.navigate("Profile", { appConfig });
                  }}
                />
                <DrawerItem
                  title="LOGOUT"
                  source={AppStyles.iconSet.logoutDrawer}
                  onPress={onLogout}
                />

              </>
              : 
              <DrawerItem
              title="SIGNIN"
              source={AppStyles.iconSet.login}
              onPress={() => {
                navigation.closeDrawer()
                navigation.navigate("WelcomePage", { appConfig })
              }}
            />
          }
        </View>
      </ScrollView>
    );
  };
}

export default DrawerContainer;
