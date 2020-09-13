import WebReq from '../web-req.service';
import api from '../url.service';

const signin = async (body) => {
    const res = await WebReq.post(api.signIN.signIN, body, false)
    return res;

}
export default signin;