import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, Text } from "react-native";
import ColorCheckBox from "../ColorCheckBox/ColorCheckBox";
import SizeCheckBox from "../SizeCheckBox/SizeCheckBox";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function CardContent(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const { contentContainer, item, price } = props;

  const [selectedColorIndex, setSelectedColorIndex] = useState(
    props.item.selectedColorIndex ? props.item.selectedColorIndex : 0
  );
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(
    props.item.selectedSizeIndex ? props.item.selectedSizeIndex : 0
  );

  const onColorSelected = index => {
    setSelectedColorIndex(index);
    props.onColorSelected(index);
  };

  const onSizeSelected = index => {
    setSelectedSizeIndex(index);
    props.onSizeSelected(index);
  };

  return (
    <View style={{ flexDirection: 'column', justifyContent: 'center', marginTop: 20 }}>
      <Text style={[styles.title, { fontSize: 20 }]}>{item.name}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

CardContent.propTypes = {
  contentContainer: PropTypes.object,
  item: PropTypes.object,
  price: PropTypes.string,
  onColorSelected: PropTypes.func,
  onSizeSelected: PropTypes.func
};

export default CardContent;
