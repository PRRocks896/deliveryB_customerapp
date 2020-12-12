import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import CarouselView from "../Carousel/CarouselView";
import CarouselProductView from "../Carousel/CarouselProductView";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import getProducts from "../../services/Products/getproducts";
import { checktype } from "../../utils/utilis";

function NewArrivals(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { dataSource, title, appConfig } = props;



  const renderItem = ({ index, item }) => (
    <CarouselProductView
      key={index + ""}
      onCardPress={() => props.onCardPress(item)}
      item={item}
      index={index}
      appConfig={appConfig}
      price={checktype(item.productDetail.price)}
    />
  );

  return (
    <View style={styles.carouselContainer}>
      {
        dataSource.length ?
          <>
            <Text style={styles.carouselTitleText}>{title}</Text>
            <CarouselView dataSource={dataSource.length ? dataSource.slice(0, 5) : dataSource} renderItem={renderItem} />
          </>
          : null
      }
    </View>
  );
}

NewArrivals.propTypes = {
  title: PropTypes.string,
  dataSource: PropTypes.array,
  onIndexChange: PropTypes.func,
  onCardPress: PropTypes.func
};

export default NewArrivals;
