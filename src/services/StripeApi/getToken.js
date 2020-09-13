import WebReq from '../web-req.service';
import api from '../url.service';

const getStripeToken = async (body) => {
    const res = await WebReq.post(api.getStripeToken.getStripeToken, body, true, true)
    return res;

}
export default getStripeToken;