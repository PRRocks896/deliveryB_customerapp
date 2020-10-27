import WebReq from '../web-req.service';
import api from '../url.service';

const getservicebookbyid = async (id, body) => {
    const res = await WebReq.post(api.servicebookbycustomerid.servicebookbycustomerid + id, body, false)
    return res;

}
export default getservicebookbyid;