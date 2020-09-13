import WebReq from '../web-req.service';
import api from '../url.service';

const addtobag = async (body) => {
    const res = await WebReq.post(api.addToBag.addToBag, body, true)
    return res;

}
export default addtobag;