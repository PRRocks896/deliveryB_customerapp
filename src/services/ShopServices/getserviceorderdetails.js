import WebReq from '../web-req.service';
import api from '../url.service';

const serviceDetailsData = async (id) => {
    const res = await WebReq.get(api.getserviceorderdetails.getserviceorderdetails + id, true)
    return res;

}
export default serviceDetailsData;