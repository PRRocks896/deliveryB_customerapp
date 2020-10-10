import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native-appearance";
import DrawerItem from "../DrawerItem/DrawerItem";
import { firebaseDataManager } from "../../apis";
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

    const onLogout = async () => {
      await deviceStorage.removeUserData();
      await firebaseDataManager.logout();
      await AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(async () => {
          const keys = await AsyncStorage.getAllKeys()
          if (keys.length == 0) {
            navigation.navigate("LoginStack");
          }
        });
    };

    useEffect(() => {
      getimg()
    }, [])
    const getimg = async () => {

      let loginData = await AsyncStorage.getItem('LoginData')
      let details = JSON.parse(loginData)
      let body = JSON.stringify({
        id: details.userId,
        reqToken: details.reqToken,
      })
      const data = await getProfileDetails(body);
      console.log("Profile",data.data.profilePicture)
      setProfilepic(data.data.profilePicture)
      EventRegister.addEventListener('profileImage', (data) => { setProfilepic(data) })
     
    }

    const imagePicker = () => {
      ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {
          // console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          setProfilepic(response.path)
          profilepicfun()
          console.log("image", response.uri, response.path)
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
        console.log("Resp", data.data.profilePhoto)
        setIsloading(false)
        EventRegister.emit('profileImage', data.data.profilePhoto)
        AsyncStorage.setItem("Profilepic", data.data.profilePhoto)
        setProfilepic(data.data.profilePhoto)
        profilepicfun()

      }).catch((err) => {
        console.log("Error", err)
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
      <ScrollView contentContainerStyle={{flexGrow:1}} >
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
          <DrawerItem
            title="SEARCH"
            source={AppStyles.iconSet.searchDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("Search", { appConfig });
            }}
          />
          <DrawerItem
            title="ORDERS"
            source={AppStyles.iconSet.orderDrawer}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("Order", { appConfig });
            }}
          />
           <DrawerItem
            title="ADD CARDS"
            source={AppStyles.imageSet.creditCard}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate("AddCards", { appConfig });
            }}
          />
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
        </View>
      </ScrollView>
    );
  };
}

export default DrawerContainer;
