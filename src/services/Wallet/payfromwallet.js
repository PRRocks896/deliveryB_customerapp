import WebReq from '../web-req.service';
import api from '../url.service';

const payfromwallet = async (body,mobile) => {
    const res = await WebReq.post(api.payfromwallet.payfromwallet + mobile, body,false)
    return res;

}
export default payfromwallet;