import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function CategoryCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const { item, imageContainerStyle, onCategoryPress } = props;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onCategoryPress}
      style={[styles.categoryTextContainerView, styles.categoryImageContainer, imageContainerStyle,{paddingLeft:10,paddingRight:10,width:'auto'}]}
    >
      <Text style={styles.categoryText}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>

  );
}

CategoryCard.propTypes = {
  item: PropTypes.object.isRequired,
  onCategoryPress: PropTypes.func,
  imageContainerStyle: PropTypes.object
};

export default CategoryCard;
