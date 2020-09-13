import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FlatList } from "react-native";
import CategoryCard from "../CategoryCard/CategoryCard";
import { BackHandler } from 'react-native'

function Categories(props) {
  const { categories } = props;
  const renderItem = ({ item }) => (
    <CategoryCard
      onCategoryPress={() => props.onCategoryPress(item)}
      item={item}
    />
  );

  useEffect(() => {
    const backAction = () => {
      console.log("props.navigation", props.navigation)
      props.navigation.pop("Home");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [])


  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item, index) => index.toString()}
      horizontal={true}
      extraData={categories}
      renderItem={renderItem}
    />
  );
}

Categories.propTypes = {
  categories: PropTypes.array.isRequired,
  onCategoryPress: PropTypes.func,
  navigation: PropTypes.object
};

export default Categories;
