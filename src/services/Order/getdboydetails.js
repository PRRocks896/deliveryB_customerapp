import WebReq from '../web-req.service';
import api from '../url.service';

const detailsdboyService = async (id) => {
    const res = await WebReq.get(api.getdboyDetails.getdboyDetails + id, false)
    return res;

}
export default detailsdboyService;