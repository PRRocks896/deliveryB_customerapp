import WebReq from '../web-req.service';
import api from '../url.service';

const forgotpassword = async (body) => {
    const res = await WebReq.post(api.forgotPassword.forgotPassword, body, false)
    return res;

}
export default forgotpassword;