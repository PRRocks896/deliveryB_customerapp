import WebReq from '../web-req.service';
import api from '../url.service';

const getorderbyidDetails = async (id) => {

    const res = await WebReq.get(api.getorderbyid.getorderbyid + id, true)
    return res;

}
export default getorderbyidDetails;