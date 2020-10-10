import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking
} from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function ContactUs(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  return (
    <View style={[styles.container,{backgroundColor:'#fff'}]}>
      <ScrollView style={styles.body}>
        <View style={styles.labelView}>
          <Text style={styles.label}>CONTACT</Text>
        </View>
        <View style={styles.contentView}>

        <TouchableOpacity style={styles.addressView}>
            <Text style={styles.text}>Address</Text>
            <Text style={[styles.textcaption,{fontSize:16}]}>
            {"Tribata Holidays PVT LTD, city center, BM Road, Kushalnager Coorg, Karnataka 571234, India"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={() => Linking.openURL('mailto:tribataholidays@gmail.com')} style={styles.addressView}>
            <Text style={styles.text}>E-mail us</Text>
            <Text style={[styles.textcaption,{fontSize:16}]}>
            {"tribataholidays@gmail.com"}
            </Text>
          </TouchableOpacity>
          <View style={styles.itemView}>
            <Text style={styles.text}>Mobile</Text>
            <TouchableOpacity>
              <Text style={styles.placeholderText}>
                {"+91 9035865441"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.captionView}>
          <Text style={styles.caption}>
            {"Our business hours are Mon - Fri, 10am - 5pm, PST.\n"}
          </Text>
        </View>
        <View style={styles.contentView}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${+919035865441}`)}
            style={styles.itemButton}
          >
            <Text style={[styles.text, { color: "#384c8d" }]}>Call Us</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.labelView} />
      </ScrollView>
    </View>
  );
}

export default ContactUs;
