import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, Text, View, AsyncStorage } from "react-native";
import IconBadge from "react-native-icon-badge";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AppStyles from "../../AppStyles";
import { useColorScheme } from "react-native-appearance";
import dynamicStyles from "./styles";
import getbagproduct from "../../services/AddToBag/getbagProduct";
import { EventRegister } from 'react-native-event-listeners'

function ShoppingBagButton(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const { bagItems } = props;
  const [bagItemsdata, setbagItemsdata] = useState('')

  useEffect(() => {
    checklogedinuser()

  })

  const checklogedinuser = async () => {
    let userid = await AsyncStorage.getItem('userId')

    if (userid == null) {
      getLocalproductitem()
    } else {
      getcartProductlength()
    }
  }

  const getLocalproductitem = async () => {
    let getproducrsoff = await AsyncStorage.getItem("Ofline_Products")
    if( getproducrsoff !== null){
      let parseddata = JSON.parse(getproducrsoff)
      setbagItemsdata(parseddata.length)
      EventRegister.addEventListener('cartlength', (data) => {
        console.log("data=========", data)
        setbagItemsdata(data)
      })
    }
  }

  const getcartProductlength = async () => {
    let userid = await AsyncStorage.getItem('userId')
    const getdata = await getbagproduct(userid)
    if (getdata.data.data !== null) {
      setbagItemsdata(getdata.data.data.length)
      EventRegister.addEventListener('cartlength', (data) => {
        setbagItemsdata(data)
      })
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={props.onPress} style={{ justifyContent: 'center', marginRight: 15 }}>
        <View>
          <Image
            source={AppStyles.iconSet.shoppingBagFilled}
            style={styles.headerButtonImage}
          />
          {
            bagItemsdata !== 0 ?
              <View style={{ position: 'absolute', top: 5, right: 2, width: 15, height: 15, borderRadius: 10, backgroundColor: 'red', justifyContent: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 10, color: '#fff' }}>{bagItemsdata}</Text>
              </View>
              : null
          }
        </View>
      </TouchableOpacity>
    </View>
  );
}

const mapStateToProps = ({ products }) => ({
  bagItems: products.shoppingBag
});

ShoppingBagButton.propTypes = {
  onPress: PropTypes.func,
  bagItems: PropTypes.array
};

export default connect(mapStateToProps)(ShoppingBagButton);
