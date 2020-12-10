import WebReq from '../web-req.service';
import api from '../url.service';

const cancelbookdboyService = async (id) => {
    const res = await WebReq.put(api.cancelBooking.cancelBooking + id, {}, false)
    return res;

}
export default cancelbookdboyService;