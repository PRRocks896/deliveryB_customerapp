import WebReq from '../web-req.service';
import api from '../url.service';

const getOrder = async (id, body) => {
    // console.log("get orders", api.getOrder.getOrder + id, body)
    const res = await WebReq.post(api.getOrder.getOrder + id, body, true)
    // console.log("in service res", res)
    return res;

}
export default getOrder;