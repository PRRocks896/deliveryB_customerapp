import WebReq from '../web-req.service';
import api from '../url.service';

const searchproducts = async (word) => {
    const res = await WebReq.get(api.searchProducts.searchProducts + word, true)
    return res;

}
export default searchproducts;