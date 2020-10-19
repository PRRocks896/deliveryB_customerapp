import WebReq from '../web-req.service';
import api from '../url.service';

const addAddress = async (body) => {
    
    const res = await WebReq.post(api.addAddress.addAddress, body, true)
    return res;

}
export default addAddress;