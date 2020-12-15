import React from "react";
import PropTypes from "prop-types";
import { View, FlatList, Text } from "react-native";
import ProductCard from "../ProductCard/ProductCard";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import { checktype } from "../../utils/utilis";


function Featured(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);


  const renderItem = ({ item, index }) => {

    // console.log("item===================>>>>>>>>>>>>>", item)
    if (index < 10) {
      return (
        <ProductCard
          onPress={() => props.onCardPress(item)}
          key={index + ""}
          item={item}
          appConfig={props.appConfig}
          price={checktype(item.productDetail.price)}

        />
      );
    }
  }
  const { featuredProducts, title } = props;
  return (
    <View style={styles.unitContainer}>
      {
        featuredProducts.length ?
          <>
            <Text style={styles.unitTitle}>{title}</Text>
            <FlatList
              showsHorizontalScrollIndicator={false}
              data={featuredProducts}
              // keyExtractor={(item, index) => index.toString()}
              horizontal={true}
              extraData={featuredProducts}
              renderItem={renderItem}
            />
          </>
          : null
      }
    </View>
  );
}

Featured.propTypes = {
  title: PropTypes.string,
  featuredProducts: PropTypes.array,
  navigation: PropTypes.func,
  onCardPress: PropTypes.func
};

export default Featured;
