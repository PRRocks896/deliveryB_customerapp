import AsyncStorage from "@react-native-community/async-storage";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import addtobag from "../../services/AddToBag";
import getbagproduct from "../../services/AddToBag/getbagProduct"



const addToBagProduct = async(item, alreadyAddecart, color, size, quentity, selectedshopID) => {
  console.log("On Add to bag function", color, size, quentity)
    let userid = await AsyncStorage.getItem('userId')
    let products = []
    let found;
    const getdata = await getbagproduct(userid)
    console.log("add to bag function", getdata)
    if (getdata.data.data !== null) {
      found = getdata.data.data.some(i => i.products[0].product_id.id == item.productDetail._id)
        console.log("found==========", found)

      if (found == false) {
        products.push({
          product_id: item.productDetail._id,
          price: item.productDetail.price,
          discount_price:item.productDetail.discount_price ? item.productDetail.discount_price : item.productDetail.price, 
          quantity: quentity,
          size:size,
          color:color,
          name: item.name,
          productImage: item.productImage
        })
        let body = {
          customer_id: userid,
          shop_id: selectedshopID,
          amount: item.productDetail.price,
          products: products
        }
        const data = await addtobag(JSON.stringify(body))
        console.log("Add to bage response", data)
        const getdata = await getbagproduct(userid)
        if (getdata.success && getdata.data.data !== null) {
          EventRegister.emit('cartlength', getdata.data.data.length)
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
     
      const getdata = await getbagproduct(userid)
      if (getdata.success && getdata.data.data !== null) {
        EventRegister.emit('cartlength', getdata.data.data.length)
      }
    }
}

export default addToBagProduct