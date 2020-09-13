import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Shop } from "../../components";
import { BackHandler } from 'react-native'
class ShopScreen extends Component {
  constructor(props) {
    super(props);
    this.appConfig =
      props.navigation.state.params.appConfig ||
      props.navigation.getParam("appConfig");
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }
  componentDidMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  /**
   * for back to prev screen
   */
  handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
  }
  render() {
    // console.log("In Shop", this.props.categories)
    return (
      <Shop
        categories={this.props.categories}
        navigation={this.props.navigation}
        appConfig={this.appConfig}
      />
    );
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
