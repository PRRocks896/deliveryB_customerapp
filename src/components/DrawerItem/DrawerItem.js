import React from "react";
import { Image, TouchableHighlight, View, Text } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function DrawerItem(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  return (
    <TouchableHighlight
      onPress={props.onPress}
      style={styles.btnClickContain}
      underlayColor="rgba(128, 128, 128, 0.1)"
    >
      <View style={styles.btnContainer}>
        <Image source={props.source} style={styles.btnIcon} />
        <Text style={styles.btnText}>{props.title}</Text>
      </View>
    </TouchableHighlight>
  );
}

export default DrawerItem;
