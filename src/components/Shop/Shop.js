import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";
import CategoryCard from "../CategoryCard/CategoryCard";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import getCategory from "../../services/Products/getCategory";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

function Shop(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const [category, setCategory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const { extraData, categories, appConfig } = props;

  const onCategoryPress = item => {
    props.navigation.navigate("CategoryProductGrid", {
      title: item.name,
      categoryId: item._id,
      products: item.products ? item.products : item,
      appConfig
    });
  };

  useEffect(() => {
    getCategoryProducts()
  }, [])

  const getCategoryProducts = async () => {
    setIsLoading(true)
    const data = await getCategory();
    setCategory(data.data)
    setIsLoading(false)
  }

  const renderItem = ({ item, index }) => {
    if (isLoading) {
      console.log("call if")
      return (
        <SkeletonPlaceholder>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 350, height: 60, margin: 20, borderRadius: 10 }} />
          </View>
        </SkeletonPlaceholder>
      )
    } else {
      return (
        <CategoryCard
          onCategoryPress={() => onCategoryPress(item)}
          imageContainerStyle={styles.categoryImageContainerStyle}
          key={index}
          item={item}
        />
      )
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={category}
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
