import WebReq from '../web-req.service';
import api from '../url.service';

const getwallettransactions = async (mobile, body) => {
    const res = await WebReq.post(api.walletTransaction.walletTransaction + mobile,body, false)
    return res;

}
export default getwallettransactions;