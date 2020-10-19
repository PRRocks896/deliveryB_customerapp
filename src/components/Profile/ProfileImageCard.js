import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { View, Image, Text, TouchableOpacity, AsyncStorage, } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'react-native-fetch-blob'
import api from '../../../src/services/url.service'
import { set } from "react-native-reanimated";
import { EventRegister } from 'react-native-event-listeners'

const options = {
  title: 'Select Profile',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};
function ProfileImageCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const [imagepath, setImagePath] = useState(null)
  const [profile, setprofile] = useState(null)

  const { user } = props;
  const lastName = user.lastName ? user.lastName : "";
  const fullName = `${user.firstName} ${lastName}`;
  // const profile = user.profilePicture ? user.profilePicture : null

  useEffect(() => {
    EventRegister.addEventListener('profileImage', (data) => { setprofile(data) })
    setImagePath(user.profilePicture)

  })
  const imagePicker = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
      
      } else if (response.error) {
       
      } else if (response.customButton) {
       
      } else {
        setprofile(response.uri)
      
        uploadProfileImage(response.path, response.type, response.fileName)
   

      }
    })
  }
  /**
   * Update Profile
   */
  const uploadProfileImage = async (Imagepath, Imagetype, fileName) => {
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
      
      EventRegister.emit('profileImage', data.data.profilePhoto)
      AsyncStorage.setItem("Profilepic", data.data.profilePhoto)
      setprofile(data.data.profilePhoto)
     

    }).catch((err) => {
      
    })
  }
  
 
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.cardImageContainer} onPress={() => imagePicker()}>
        {
          profile == null ? 
          <Image
            source={imagepath == null  ? require('../../../assets/icons/user.png') :  { uri: imagepath }}
            style={styles.cardImage} />
            :
            <Image
            source={{ uri: profile }}
            style={styles.cardImage} />
        }
      </TouchableOpacity>
      <View style={styles.cardNameContainer}>
        <Text style={styles.cardName}>{user.name}</Text>
      </View>
    </View>
  );
}

ProfileImageCard.propTypes = {
  title: PropTypes.string,
  navigation: PropTypes.func,
  extraData: PropTypes.object,
  user: PropTypes.object
};

export default ProfileImageCard;
