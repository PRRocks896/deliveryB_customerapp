import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import { useColorScheme } from "react-native-appearance";
import SettingsItem from "./SettingsItem";
import { firebaseDataManager } from "../../apis";
import deviceStorage from "../../utils/deviceStorage";
import dynamicStyles from "./styles";

function Settings(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const [isFaceID, setIsFaceID] = useState(false);
  const [shouldOrderUpdate, setShouldOrderUpdate] = useState(false);
  const [isNewArrivals, setIsNewArrivals] = useState(false);
  const [isPromotions, setIsPromotions] = useState(false);
  const [isSalesAlerts, setIsSalesAlerts] = useState(false);

  const onLogout = async () => {
    console.log("log out")
    await deviceStorage.removeUserData();
    await firebaseDataManager.logout();
    navigation.navigate("LoginStack");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.body}>
        <View style={styles.labelView}>
          <Text style={styles.label}>SECURITY</Text>
        </View>
        <View style={styles.contentView}>
          <SettingsItem
            title={"Enable Face ID / Touch ID Login"}
            value={isFaceID}
            onValueChange={() => setIsFaceID(!isFaceID)}
          />
        </View>
        <View style={styles.captionView}>
          <Text style={styles.caption}>
            While turned off, you will not be able to login with your password.
          </Text>
        </View>
        <View style={styles.labelView}>
          <Text style={styles.label}>PUSH NOTIFICATIONS</Text>
        </View>
        <View style={styles.contentView}>
          <SettingsItem
            title={"Order updates"}
            value={shouldOrderUpdate}
            onValueChange={() => setShouldOrderUpdate(!shouldOrderUpdate)}
          />
          <View style={styles.lineView} />
          <SettingsItem
            title={"New arrivals"}
            value={isNewArrivals}
            onValueChange={() => setIsNewArrivals(!isNewArrivals)}
          />
          <View style={styles.lineView} />
          <SettingsItem
            title={"Promotions"}
            value={isPromotions}
            onValueChange={() => setIsPromotions(!isPromotions)}
          />
          <View style={styles.lineView} />
          <SettingsItem
            title={"Sales alerts"}
            value={isSalesAlerts}
            onValueChange={() => setIsSalesAlerts(!isSalesAlerts)}
          />
        </View>
        <View style={styles.labelView}>
          <Text style={styles.label}>ACCOUNT</Text>
        </View>
        <View style={styles.contentView}>
          <View style={styles.itemButton}>
            <Text style={[styles.text, { color: "#384c8d" }]}>Support</Text>
          </View>
          <View style={styles.lineView} />
          {/* <TouchableOpacity onPress={() => onLogout} style={styles.itemButton}>
            <Text style={[styles.text, { color: "#384c8d" }]}>Log out</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.labelView} />
      </ScrollView>
    </View>
  );
}

Settings.propTypes = {
  title: PropTypes.string,
  SettingsScreen: PropTypes.array,
  navigation: PropTypes.func,
  extraData: PropTypes.object
};

export default Settings;
