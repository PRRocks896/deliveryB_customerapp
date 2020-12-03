import WebReq from '../web-req.service';
import api from '../url.service';

const getProducts = async (page) => {
    const res = await WebReq.get(api.getbestSellerProduct.getbestSellerProduct + page + `&limit=10`, true)
    return res;

}
export default getProducts;