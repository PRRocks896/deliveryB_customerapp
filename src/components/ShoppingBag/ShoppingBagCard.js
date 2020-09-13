import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, Image, Text } from "react-native";
import { connect } from "react-redux";
import CardContent from "./CardContent";
import QuantityControl from "./QuantityControl";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import Icon from 'react-native-vector-icons/MaterialIcons'
function ShoppingBagCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { item } = props;
  const [itemQty, setItemQty] = useState(1);
  const totalPrice = (item.price * itemQty).toFixed(2);

  useEffect(() => {
    const product = props.productPricesByQty.find(product => {
      return product.id === props.item.shoppingBagId;
    });

    if (product) {
      setItemQty(product.qty);
    }
  }, []);

  useEffect(() => {
    setObjForProps();
    itemQty === 0 && onItemEqualsZero();
  }, [itemQty]);

  const increaseQty = () => {
    setItemQty(itemQty + 1);
  };

  const decreaseQty = () => {
    setItemQty(itemQty === 0 ? itemQty : itemQty - 1);
  };

  const setObjForProps = () => {
    console.log("total", props.item.productDetail.price)
    const obj = {
      id: props.item.shoppingBagId,
      qty: itemQty,
      totalPrice: props.item.productDetail.price * itemQty
    };
    props.onQtyChange(obj);
  };

  const onItemEqualsZero = () => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from the cart?",
      [
        {
          text: "Remove",
          onPress: () => props.removeFromShoppingBag(item),
          style: "destructive"
        },
        {
          text: "Cancel",
          onPress: () => increaseQty()
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      onLongPress={() => props.onLongPress(item)}
      activeOpacity={1}
      style={styles.cardContainer}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.productImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      <View style={{ flexDirection: 'column', flex: 4 }}>
        <View style={{ flex: 6 }}>
          <CardContent
            price={props.item.productDetail.price * itemQty}
            item={item}
            onColorSelected={props.onColorSelected}
            onSizeSelected={props.onSizeSelected}
            contentContainer={styles.contentContainer}
          />
        </View>
        <View style={{ flex: 2, marginBottom: 10 }}>
          <QuantityControl
            quantity={itemQty}
            onIncreaseQuantity={() => increaseQty()}
            onDecreaseQuantity={() => decreaseQty()}
            containerStyle={styles.quantityControlContainer}
          />
        </View>
      </View>
      <TouchableOpacity onPress={() => onItemEqualsZero()}>
        <Icon name={'close'} size={20} color={'#a3a3a3'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

ShoppingBagCard.propTypes = {
  onQtyChange: PropTypes.func,
  item: PropTypes.object,
  productPricesByQty: PropTypes.array,
  onSizeSelected: PropTypes.func,
  onColorSelected: PropTypes.func,
  onLongPress: PropTypes.func,
  removeFromShoppingBag: PropTypes.func
};

export default connect()(ShoppingBagCard);
