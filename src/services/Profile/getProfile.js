import WebReq from '../web-req.service';
import api from '../url.service';

const getProfileDetails = async (body) => {
    const res = await WebReq.post(api.getProfileDetails.getProfileDetails, body, true)
    return res;

}
export default getProfileDetails;