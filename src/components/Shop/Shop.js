import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { FlatList, View, Text,RefreshControl } from "react-native";
import CategoryCard from "../CategoryCard/CategoryCard";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";



function Shop(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { extraData, categories, appConfig } = props;
 

  const onCategoryPress = item => {
    props.navigation.navigate("CategoryProductGrid", {
      title: item.name,
      categoryId: item._id,
      products: item.products ? item.products : item,
      appConfig
    });
  };

 
  const renderItem = ({ item, index }) => (
        <CategoryCard
          onCategoryPress={() => onCategoryPress(item)}
          imageContainerStyle={styles.categoryImageContainerStyle}
          key={index}
          item={item}
        /> 
  )

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        extraData={extraData}
        renderItem={renderItem}
        itemContainerStyle={{ alignItems: "center" }}
        style={{ alignSelf: "center" }}
      />
    </View>
  );
}

Shop.propTypes = {
  navigation: PropTypes.object,
  extraData: PropTypes.object,
  categories: PropTypes.array
};

export default Shop;
