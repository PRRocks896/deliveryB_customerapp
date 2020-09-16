import WebReq from '../web-req.service';
import api from '../url.service';

const createWallet = async (body) => {
    const res = await WebReq.post(api.createWallet.createWallet, body, false)
    return res;

}
export default createWallet;