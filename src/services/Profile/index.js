import WebReq from '../web-req.service';
import api from '../url.service';

const addProfile = async (body) => {
    console.log("add Profile service", body)
    const res = await WebReq.put(api.addProfileDatails.addProfileDatails, body, false)
    console.log("in service", res)
    return res;

}
export default addProfile;