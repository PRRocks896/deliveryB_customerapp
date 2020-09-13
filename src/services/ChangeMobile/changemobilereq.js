import WebReq from '../web-req.service';
import api from '../url.service';

const changeMobilereq = async (body) => {
    const res = await WebReq.post(api.changeMobile.changeMobile, body, true)
    return res;

}
export default changeMobilereq;