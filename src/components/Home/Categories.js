import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FlatList, View, Text, Image, TouchableOpacity } from "react-native";
import CategoryCard from "../CategoryCard/CategoryCard";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";

function Categories(props) {
  const { categories, onCategoryPress } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const getCategoryData = () => {
    return (
      <FlatList
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={(item) => {
          return (
            <TouchableOpacity
             onPress={() => props.onCategoryPress(item.item)} 
             style={styles.categorybox}>
              <View style={{ flex: 3 }}>
                {
                  item.item.hasOwnProperty('categoryImage') ?
                    <Image style={styles.categoryimg} source={{ uri: item.item.categoryImage }} />
                    :
                    <Image style={styles.categoryimg} source={require('../../../assets/images/logo.png')} />
                }
              </View>
              <View style={{ flex: 5 }}>
                <Text style={styles.categoryText}>{(item.item.name).replace(/_/g, " ")}</Text>
              </View>
            </TouchableOpacity>
          )
        }}
        keyExtractor={item => item.id}
      />
    )
  }

  return (
    <View style={{ marginTop: 10 }}>
      {getCategoryData()}
    </View>
  );
}



export default Categories;
