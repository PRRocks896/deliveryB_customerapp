import AsyncStorage from "@react-native-community/async-storage";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import addtobag from "../../services/AddToBag";
import getbagproduct from "../../services/AddToBag/getbagProduct"



const addToBagProduct = async(item, alreadyAddecart) => {
    let userid = await AsyncStorage.getItem('userId')
    let products = []
    let found;
    const getdata = await getbagproduct(userid)
    if (getdata.data !== null) {
      found = getdata.data.some(i => i.products[0].product_id.id == item.productDetail._id)
      console.log("Found", found)

      if (found == false) {
        products.push({
          product_id: item.productDetail._id,
          price: item.productDetail.price,
          quantity: 1,
          name: item.name,
          productImage: item.productImage
        })
        let body = {
          customer_id: userid,
          shop_id: item.productDetail.shop_id,
          amount: item.productDetail.price,
          products: products
        }
        const data = await addtobag(JSON.stringify(body))
        const getdata = await getbagproduct(userid)
        if (getdata.success && getdata.data !== null) {
          EventRegister.emit('cartlength', getdata.data.length)
        }
      } else {
        alreadyAddecart = true
        Alert.alert(
          '',
          "Already added",
          [{ text: 'OK' }],
          {
            cancelable: false,
          },
        );
      }
    } else {
      products.push({
        product_id: item.productDetail._id,
        price: item.productDetail.price,
        quantity: 1,
        name: item.name,
        productImage: item.productImage
      })
      let body = {
        customer_id: userid,
        shop_id: item.productDetail.shop_id,
        amount: item.productDetail.price,
        products: products
      }
      const data = await addtobag(JSON.stringify(body))
      console.log("when null ", data)
      const getdata = await getbagproduct(userid)
      if (getdata.success && getdata.data !== null) {
        EventRegister.emit('cartlength', getdata.data.length)
      }
    }
}

export default addToBagProduct