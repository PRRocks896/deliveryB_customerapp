import WebReq from '../web-req.service';
import api from '../url.service';

const getAddress = async (id) => {
    const res = await WebReq.get(api.getAddress.getAddress + id, true)
    return res;

}
export default getAddress;