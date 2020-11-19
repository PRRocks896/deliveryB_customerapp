import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, TouchableOpacity, Text, Image, ImageBackground, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function ProductCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const { cardConainerStyle, onPress, item, price, appConfig, productDetails } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.productCardConainer, cardConainerStyle]}
    >

      <View style={styles.productCardImageConainer}>
        <ActivityIndicator size={'small'} color={'#000'}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }} />
        <Image style={styles.productCardImage} source={{ uri: item.productImage }} />
      </View>


      {
        productDetails ?
          <Text
            style={styles.productCardPrice}
          >₹ {productDetails.price}</Text>
          : <Text
            style={styles.productCardPrice}
          > ₹ {price}</Text>
      }
      <Text style={styles.productCardDescription} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

ProductCard.propTypes = {
  cardConainerStyle: PropTypes.object,
  item: PropTypes.object,
  onPress: PropTypes.func
};

export default ProductCard;
