import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Shop } from "../../components";
import { BackHandler } from 'react-native'
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import getCategory from "../../services/Products/getCategory";
import {View, Text} from 'react-native'
import styles from './styles'
class ShopScreen extends Component {
  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      isLoadingcategory: true,
      category: []
    }

  }
  componentDidMount = async () => {
    this.getCategoryProducts()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  getCategoryProducts = async () => {
    const data = await getCategory();
    if (data.success) {
      this.setState({ category: data.data, isLoadingcategory: false })
    }
  }
  /**
   * for back to prev screen
   */
  handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
  }
  render() {
    if (this.state.isLoadingcategory == true) {
      return (
        <SkeletonPlaceholder>
           <View style={styles.shopmainSkeleton}>
            <View style={styles.shopCategorySkeleton} />
          </View>
          <View style={styles.shopmainSkeleton}>
            <View style={styles.shopCategorySkeleton} />
          </View>
          <View style={styles.shopmainSkeleton}>
            <View style={styles.shopCategorySkeleton} />
          </View>
          <View style={styles.shopmainSkeleton}>
            <View style={styles.shopCategorySkeleton} />
          </View>
        </SkeletonPlaceholder>
      )
    } else {
      return (
        
        <Shop
          categories={this.state.category}
          navigation={this.props.navigation}
          appConfig={this.appConfig}
        />
       
      );
    }
  }
}

ShopScreen.propTypes = {
  navigation: PropTypes.object,
  categories: PropTypes.array
};

const mapStateToProps = ({ products }) => {
  return {
    categories: products.categories
  };
};

export default connect(mapStateToProps)(ShopScreen);
