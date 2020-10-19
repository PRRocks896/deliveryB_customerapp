import WebReq from '../web-req.service';
import api from '../url.service';

const addProfile = async (body) => {
    const res = await WebReq.put(api.addProfileDatails.addProfileDatails, body, false)
    return res;

}
export default addProfile;