import WebReq from '../web-req.service';
import api from '../url.service';

const paytoDBoyService = async (body) => {
    const res = await WebReq.post(api.sendmoneytodBoy.sendmoneytodBoy , body,false)
    return res;

}
export default paytoDBoyService;