import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image
} from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function OrderCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const { cardConainerStyle, order } = props;
  // console.log("========props========", order)
  const renderProductItem = item => (
    <View style={styles.productContainer}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: 'https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productDescriptionContainer}>
        <Text style={styles.productDescription}>{item.name}</Text>
      </View>
    </View>
  );

  const renderCardFooter = order => (
    <View style={styles.footerContainer}>
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPrice}>{`${props.appConfig.currency}${Number(
          order.amount.toFixed(2)
        )}`}</Text>
      </View>
      {/* <TouchableOpacity
        onPress={() => props.onReOrder(order)}
        style={styles.actionContainer}
      >
        <Text style={styles.action}>REORDER</Text>
      </TouchableOpacity> */}
      {/* <View style={styles.blankContainer} /> */}
    </View>
  );

  const options = { month: "short", day: "numeric" };
  const orderedDate = new Date(order.createdAt.seconds * 1000);
  const formattedDate = orderedDate.toLocaleDateString("en-US", options);
  const date = order.createdAt.seconds
    ? formattedDate
    : new Date(order.createdAt).toLocaleDateString("en-US", options);

  return (
    <View style={[styles.OrderCardConainer, cardConainerStyle]}>
      <ImageBackground
        source={{
          uri: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg'
          // order.shopertino_products.length > 0 &&
          // order.shopertino_products[0].photo
        }}
        style={styles.imageBackgroundContainer}
        imageStyle={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.orderStatusContainer}>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>{"Order Placed"}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{`Ordered on ${date}`}</Text>
          </View>
        </View>
      </ImageBackground>
      {order.products.map((item, index) => (
        <View key={item.id}>
          {renderProductItem(item)}
          {order.products.length - 1 == index &&
            renderCardFooter(order)}
        </View>
      ))}
    </View>
  );
}

OrderCard.propTypes = {
  onReOrder: PropTypes.func,
  cardConainerStyle: PropTypes.object,
  order: PropTypes.object
};

export default OrderCard;
