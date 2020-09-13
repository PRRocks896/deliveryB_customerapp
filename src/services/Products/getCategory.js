import WebReq from '../web-req.service';
import api from '../url.service';

const getCategory = async () => {
    const res = await WebReq.get(api.getCategory.getCategory, true)
    return res;

}
export default getCategory;