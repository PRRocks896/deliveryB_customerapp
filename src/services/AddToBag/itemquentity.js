import WebReq from '../web-req.service';
import api from '../url.service';

const itemQuentity = async (id, body) => {

    const res = await WebReq.put(api.addToBag.addToBag + '/' + id, body, true)
    return res;

}
export default itemQuentity;