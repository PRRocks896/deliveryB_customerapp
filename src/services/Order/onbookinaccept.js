import WebReq from '../web-req.service';
import api from '../url.service';

const onBookinAcceptService = async (body) => {
    const res = await WebReq.post(api.onbookinAccept.onbookinAccept, body, false)
    return res;
}
export default onBookinAcceptService;