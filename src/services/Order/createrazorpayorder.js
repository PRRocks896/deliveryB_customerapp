import WebReq from '../web-req.service';
import api from '../url.service';

const createOrderRazorpay = async (body) => {
    const res = await WebReq.post(api.createorder.createorder, body, false)
    return res;

}
export default createOrderRazorpay;