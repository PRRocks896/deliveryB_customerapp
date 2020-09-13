import WebReq from '../web-req.service';
import api from '../url.service';

const customerCharges = async (body) => {
    const res = await WebReq.post(api.customerCharges.customerCharges, body, true, false, true)
    return res;

}
export default customerCharges;