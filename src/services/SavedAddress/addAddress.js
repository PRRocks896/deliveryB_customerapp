import WebReq from '../web-req.service';
import api from '../url.service';

const addAddress = async (body) => {
    console.log("body in service", body)
    const res = await WebReq.post(api.addAddress.addAddress, body, true)
    console.log("RES in SERVICE", res)
    return res;

}
export default addAddress;