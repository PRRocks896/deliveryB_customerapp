import WebReq from '../web-req.service';
import api from '../url.service';

const getProductsbyID = async (name) => {
    const res = await WebReq.get(api.getProductById.getProductById + name, true)
    return res;

}
export default getProductsbyID;