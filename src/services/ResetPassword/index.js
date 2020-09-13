import WebReq from '../web-req.service';
import api from '../url.service';

const resetPassword = async (body) => {
    const res = await WebReq.post(api.resetPassword.resetPassword, body, false)
    return res;

}
export default resetPassword;