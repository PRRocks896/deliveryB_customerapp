import WebReq from '../web-req.service';
import api from '../url.service';

const getProducts = async () => {
    const res = await WebReq.get(api.getProduct.getProduct, true)
    return res;

}
export default getProducts;