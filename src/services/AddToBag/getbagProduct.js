import WebReq from '../web-req.service';
import api from '../url.service';

const getbagproduct = async (id) => {
// console.log("get wishlist",api.getbagproduct.getbagproduct + id)
    const res = await WebReq.get(api.getbagproduct.getbagproduct + id, true)
    return res;

}
export default getbagproduct;