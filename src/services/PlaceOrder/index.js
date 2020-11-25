import WebReq from '../web-req.service';
import api from '../url.service';

const placeOrder = async (body) => {
    console.log("api place order",api.postOrder.postOrder)
    const res = await WebReq.post(api.postOrder.postOrder, body, true, false, false)
    return res;

}
export default placeOrder;