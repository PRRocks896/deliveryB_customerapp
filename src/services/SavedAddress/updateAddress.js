import WebReq from '../web-req.service';
import api from '../url.service';

const updateAddress = async (body, id) => {
    const res = await WebReq.put(api.updateAddress.updateAddress + id, body, true)
    return res;

}
export default updateAddress;