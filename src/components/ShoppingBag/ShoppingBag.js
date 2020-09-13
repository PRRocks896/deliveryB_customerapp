import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, FlatList, Text } from "react-native";
import ShoppingBagCard from "./ShoppingBagCard";
import FooterButton from "../FooterButton/FooterButton";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import AppStyles from "../../AppStyles";
function ShoppingBag(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const renderItem = ({ item }) => (
    <ShoppingBagCard
      item={item}
      onColorSelected={index => props.onColorSelected({ item, index })}
      onSizeSelected={index => props.onSizeSelected({ item, index })}
      productPricesByQty={props.productPricesByQty}
      onQtyChange={totalPriceObj => props.onQtyChange(totalPriceObj, item)}
      onLongPress={product => props.onLongPress(product)}
      removeFromShoppingBag={product => props.removeFromShoppingBag(product)}
      appConfig={props.appConfig}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={props.shoppingBag}
        keyExtractor={item => item.shoppingBagId.toString()}
        extraData={props.shoppingBag}
        renderItem={renderItem}
        style={{ flex: 1 }}
      />
      {
        props.shoppingBag.length != 0 ?
          <>
            <View style={{ position: 'relative', bottom: 0, padding: 10, borderRadius: 5, borderTopColor: '#A9A9A9', borderTopWidth: 1 }}>
              <View style={{ height: 'auto' }}>
                <View style={{ paddingBottom: 10 }}>

                  <Text style={[styles.text, { fontSize: 20 }]}>Bill Details</Text>
                  <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                    <Text style={styles.text}>Item Total</Text>
                    <Text style={[styles.text, { position: 'absolute', right: 20 }]}>{`${props.appConfig.currency} ${
                      props.totalShoppinBagPrice
                      }`}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                    <Text style={styles.text}>Delivery partner fee</Text>
                    <Text style={[styles.text, { position: 'absolute', right: 20 }]}>$ 0</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
                  <Text style={styles.text}>Texes and Charges</Text>
                  <Text style={[styles.text, { position: 'absolute', right: 20 }]}>$ 0</Text>
                </View>
                <View style={styles.dashboarder} />
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.text, { fontSize: 18 }]}>To Pay</Text>
                  <Text style={[styles.text, { position: 'absolute', right: 20, fontSize: 18 }]}>{`${props.appConfig.currency} ${
                    props.totalShoppinBagPrice
                    }`}</Text>
                </View>

              </View>
            </View>
            <View style={styles.footerContainer}>
              <View style={styles.totalContainer}>
              </View>
              <FooterButton
                title={"CONTINUE"}
                onPress={props.onContinuePress}
                footerTitleStyle={styles.footerTitle}
                footerContainerStyle={styles.footerButtonContainer}
              />
            </View>
          </>
          : null
      }
    </View>
  );
}

ShoppingBag.propTypes = {
  shoppingBag: PropTypes.array,
  productPricesByQty: PropTypes.array,
  totalShoppinBagPrice: PropTypes.string,
  removeFromShoppingBag: PropTypes.func,
  onContinuePress: PropTypes.func,
  onColorSelected: PropTypes.func,
  onSizeSelected: PropTypes.func,
  onQtyChange: PropTypes.func,
  onLongPress: PropTypes.func
};

export default ShoppingBag;
