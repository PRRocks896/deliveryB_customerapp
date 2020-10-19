import WebReq from '../web-req.service';
import api from '../url.service';

const getOrder = async (id, body) => {
    const res = await WebReq.post(api.getOrder.getOrder + id, body, true)
    return res;

}
export default getOrder;