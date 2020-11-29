import WebReq from '../web-req.service';
import api from '../url.service';

const cancelOrderData = async (id) => {
    console.log("cancel order",api.cancelorder.cancelorder + id )
    const res = await WebReq.put(api.cancelorder.cancelorder + id, '', true)
    return res;

}
export default cancelOrderData;