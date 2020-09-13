import WebReq from '../web-req.service';
import api from '../url.service';

const changeMobilEdit = async (body) => {
    const res = await WebReq.put(api.changeMobile.changeMobile, body, true)
    return res;

}
export default changeMobilEdit;