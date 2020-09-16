import WebReq from '../web-req.service';
import api from '../url.service';

const getamountWallet = async (mobile) => {
    const res = await WebReq.get(api.getamountwallet.getamountwallet + mobile, false)
    return res;

}
export default getamountWallet;