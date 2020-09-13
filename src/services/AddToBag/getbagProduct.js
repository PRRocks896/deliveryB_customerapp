import WebReq from '../web-req.service';
import api from '../url.service';

const getbagproduct = async (id) => {

    const res = await WebReq.get(api.addToBag.addToBag + '/' + id, true)
    return res;

}
export default getbagproduct;