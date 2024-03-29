import PropTypes from "prop-types";
import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import AppStyles from "../../AppStyles";

function QuantityControl(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const {
    containerStyle,
    onIncreaseQuantity,
    onDecreaseQuantity,
    quantity
  } = props;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
      <TouchableOpacity
        onPress={onIncreaseQuantity}
        style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
      >
        <Image
          source={AppStyles.iconSet.add}
          style={styles.quantityControlIcon}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View >
        <Text style={styles.quantityCount}>{quantity}</Text>
      </View>
      <TouchableOpacity
        onPress={onDecreaseQuantity}
        style={[styles.quantityControlIconContainer, { marginLeft: 10, marginRight: 10 }]}
      >
        <Image
          source={AppStyles.iconSet.minus}
          style={styles.quantityControlIcon}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}

QuantityControl.propTypes = {
  containerStyle: PropTypes.object,
  shopCategories: PropTypes.array,
  extraData: PropTypes.object,
  onIncreaseQuantity: PropTypes.func,
  onDecreaseQuantity: PropTypes.func,
  quantity: PropTypes.number
};

export default QuantityControl;
