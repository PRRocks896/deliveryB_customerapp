import PropTypes from "prop-types";
import React, { Component } from "react";
import { FlatList, View } from "react-native";
import OrderCard from "../OrderCard/OrderCard";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function Order(props) {
  const { extraData, orderHistory, appConfig } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  // console.log("orderHistory", orderHistory.data)

  const renderItem = ({ item, index }) => (
    <OrderCard
      key={index}
      onReOrder={props.onReOrder}
      appConfig={appConfig}
      order={item}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={orderHistory.data}
        renderItem={renderItem}
        itemContainerStyle={{ alignItems: "center" }}
        style={{ alignSelf: "center" }}
      />
    </View>
  );
}

Order.propTypes = {
  orderHistory: PropTypes.array,
  extraData: PropTypes.object,
  navigation: PropTypes.object,
  onReOrder: PropTypes.func
};

export default Order;
