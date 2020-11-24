import WebReq from '../web-req.service';
import api from '../url.service';

const getServiceData = async (page) => {
    const res = await WebReq.get(api.getservice.getservice + `&page=${page}&limit=10`, true)
    return res;

}
export default getServiceData;