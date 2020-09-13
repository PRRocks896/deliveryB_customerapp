import WebReq from '../web-req.service';
import api from '../url.service';

const createStripeCustomer = async (body) => {

    const res = await WebReq.post(api.createStripeCustomer.createStripeCustomer, body, true, false, true)

    return res;

}
export default createStripeCustomer;