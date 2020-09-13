import WebReq from '../web-req.service';
import api from '../url.service';

const removeCartItem = async (id) => {
    const res = await WebReq.delete(api.addToBag.addToBag + '/' + id, true)
    return res;

}
export default removeCartItem;