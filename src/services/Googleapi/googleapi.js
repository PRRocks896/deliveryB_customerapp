import WebReq from '../web-req.service';
import api from '../url.service';

const getkmgoogleapi = async (body) => {
    const res = await WebReq.get(api.googleapiforkm.googleapiforkm + body, false)
    return res;

}
export default getkmgoogleapi;