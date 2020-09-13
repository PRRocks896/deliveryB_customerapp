import WebReq from '../web-req.service';
import api from '../url.service';

const getAddressviaUSer = async (id) => {
    const res = await WebReq.get(api.getAddressviauser.getAddressviauser + id, true)
    return res;

}
export default getAddressviaUSer;