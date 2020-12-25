import WebReq from '../web-req.service';
import api from '../url.service';

const getProductsbyProductidService = async (id) => {
    const res = await WebReq.get(api.getProductbyproductid.getProductbyproductid + id, true)
    return res;

}
export default getProductsbyProductidService;