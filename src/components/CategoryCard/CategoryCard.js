import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, Text, ImageBackground } from "react-native";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function CategoryCard(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const { item, imageContainerStyle, onCategoryPress } = props;



  return (

    <ImageBackground
      source={item.categoryImage ? { uri: item.categoryImage } : require('../../../assets/images/unnamed.png')}
      style={[styles.categoryImageContainer, imageContainerStyle]}
      imageStyle={styles.categoryImage}
      resizeMode="cover"
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCategoryPress}
        style={styles.categoryTextContainerView}
      >
        <Text style={styles.categoryText}>{(item.name.toUpperCase()).replace(/_/g, " ")}</Text>
      </TouchableOpacity>
    </ImageBackground>

  );
}

CategoryCard.propTypes = {
  item: PropTypes.object.isRequired,
  onCategoryPress: PropTypes.func,
  imageContainerStyle: PropTypes.object
};

export default CategoryCard;
