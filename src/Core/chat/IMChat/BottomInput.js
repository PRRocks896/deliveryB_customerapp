import React from 'react';
import { View, TouchableOpacity, Image, TextInput } from 'react-native';
import dynamicStyles from './styles';
import { useColorScheme } from 'react-native-appearance';
import { IMLocalized } from '../../localization/IMLocalization';

const assets = {
  cameraFilled: require('../assets/camera-filled.png'),
  send: require('../assets/send.png'),
};

function BottomInput(props) {
  const {
    item,
    value,
    onChangeText,
    onSend,
    onAddMediaPress,
    uploadProgress,
    appStyles,
  } = props;

  const colorScheme = useColorScheme();
  const styles = dynamicStyles(appStyles, colorScheme);

  const isDisabled = !value;

  return (
    <View>
      <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
      <View style={styles.inputBar}>
        <TouchableOpacity
          onPress={onAddMediaPress}
          style={styles.inputIconContainer}>
          <Image style={styles.inputIcon} source={assets.cameraFilled} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={value}
          multiline={true}
          placeholder={IMLocalized('Start typing...')}
          underlineColorAndroid="transparent"
          onChangeText={text => onChangeText(text)}
        />
        <TouchableOpacity
          disabled={isDisabled}
          onPress={onSend}
          style={[
            styles.inputIconContainer,
            isDisabled ? { opacity: 0.2 } : { opacity: 1 },
          ]}>
          <Image style={styles.inputIcon} source={assets.send} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

BottomInput.propTypes = {};

export default BottomInput;
