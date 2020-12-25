import WebReq from '../web-req.service';
import api from '../url.service';

const removeitemforlocalProducts = async (body) => {
    const res = await WebReq.delete(api.loccalProductaddtobag.loccalProductaddtobag, true, body)
    return res;

}
export default removeitemforlocalProducts;