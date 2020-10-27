import WebReq from '../web-req.service';
import api from '../url.service';

const getServiceData = async () => {
    const res = await WebReq.get(api.getservice.getservice, true)
    return res;

}
export default getServiceData;