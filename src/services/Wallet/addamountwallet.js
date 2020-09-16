import WebReq from '../web-req.service';
import api from '../url.service';

const addamountwallet = async (body,mobile) => {
    const res = await WebReq.post(api.addamountWallet.addamountWallet + mobile, body, false)
    return res;

}
export default addamountwallet;