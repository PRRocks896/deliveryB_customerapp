import WebReq from '../web-req.service';
import api from '../url.service';

const getservicebyName = async (name) => {
    const res = await WebReq.get(api.getserviceCategorybyname.getserviceCategorybyname + name, true)
    return res;

}
export default getservicebyName;