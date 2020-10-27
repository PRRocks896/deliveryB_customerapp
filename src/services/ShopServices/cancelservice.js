import WebReq from '../web-req.service';
import api from '../url.service';

const cancelServiceData = async (id) => {
    const res = await WebReq.put(api.deleteService.deleteserice + id,'', true)
    return res;

}
export default cancelServiceData;