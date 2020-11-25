import WebReq from '../web-req.service';
import api from '../url.service';

const changeCartStatus = async (id) => {
console.log("id===========================", api.wishlistchangeStatus.wishlistchangeStatus + id)
    const res = await WebReq.put(api.wishlistchangeStatus.wishlistchangeStatus + id, {}, true)
    return res;

}
export default changeCartStatus;