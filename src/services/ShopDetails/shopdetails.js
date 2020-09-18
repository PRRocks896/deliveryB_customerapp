import WebReq from '../web-req.service';
import api from '../url.service';

const shopdetails = async (id) => {
    const res = await WebReq.get(api.getShopDetails.getShopDetails + id, true)
    return res;

}
export default shopdetails;