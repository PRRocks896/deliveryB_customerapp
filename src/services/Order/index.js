import WebReq from '../web-req.service';
import api from '../url.service';

const getOrder = async (id, body) => {
    console.log("ordr", api.getOrder.getOrder + id)
    const res = await WebReq.post(api.getOrder.getOrder + id, body, true)
    return res;

}
export default getOrder;