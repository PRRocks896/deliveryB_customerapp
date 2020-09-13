import { StyleSheet } from 'react-native';
import { size } from '../../helpers/devices';

const dynamicStyles = (appStyles, colorScheme) => {
  const chatBackgroundColor =
    appStyles.colorSet[colorScheme].mainThemeBackgroundColor;

  return StyleSheet.create({
    personalChatContainer: {
      backgroundColor: chatBackgroundColor,
      flex: 1,
    },
    //Bottom Input
    inputBar: {
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: appStyles.colorSet[colorScheme].hairlineColor,
      flexDirection: 'row',
    },
    progressBar: {
      backgroundColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
      height: 3,
      shadowColor: '#000',
      width: 0,
    },
    inputIconContainer: {
      margin: 10,
    },
    inputIcon: {
      tintColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
      width: 25,
      height: 25,
    },
    input: {
      margin: 5,
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 20,
      paddingRight: 20,
      flex: 1,
      backgroundColor: appStyles.colorSet[colorScheme].whiteSmoke,
      fontSize: 16,
      borderRadius: 20,
      color: appStyles.colorSet[colorScheme].mainTextColor,
    },
    // Message Thread
    messageThreadContainer: {
      margin: 6,
    },
    // Thread Item
    sendItemContainer: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      flexDirection: 'row',
      marginBottom: 10,
    },
    itemContent: {
      padding: 10,
      backgroundColor: appStyles.colorSet[colorScheme].hairlineColor,
      borderRadius: 10,
      maxWidth: '80%',
    },
    sendItemContent: {
      marginRight: 9,
      backgroundColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
    },
    mediaMessage: {
      width: size(300),
      height: size(250),
      borderRadius: 10,
    },
    boederImgSend: {
      position: 'absolute',
      width: size(300),
      height: size(250),
      resizeMode: 'stretch',
      tintColor: chatBackgroundColor,
    },
    textBoederImgSend: {
      position: 'absolute',
      right: -5,
      bottom: 0,
      width: 20,
      height: 8,
      resizeMode: 'stretch',
      tintColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
    },
    sendTextMessage: {
      fontSize: 16,
      color: appStyles.colorSet[colorScheme].mainThemeBackgroundColor,
    },
    userIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    receiveItemContainer: {
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      flexDirection: 'row',
      marginBottom: 10,
    },
    receiveItemContent: {
      marginLeft: 9,
    },
    boederImgReceive: {
      position: 'absolute',
      width: size(300),
      height: size(250),
      resizeMode: 'stretch',
      tintColor: chatBackgroundColor,
    },
    receiveTextMessage: {
      color: appStyles.colorSet[colorScheme].mainTextColor,
      fontSize: 16,
    },
    textBoederImgReceive: {
      position: 'absolute',
      left: -5,
      bottom: 0,
      width: 20,
      height: 8,
      resizeMode: 'stretch',
      tintColor: appStyles.colorSet[colorScheme].hairlineColor,
    },
    mediaVideoLoader: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    centerItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      position: 'absolute',
      top: '40%',
      alignSelf: 'center',
      width: 38,
      height: 38,
      backgroundColor: 'transparent',
    },
  });
};

export default dynamicStyles;
