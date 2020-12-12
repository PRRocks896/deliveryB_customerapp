import WebReq from '../web-req.service';
import api from '../url.service';

const bookingChargeService = async (body, id) => {
    console.log("api=================================",api.bookingCharge.bookingCharge + id )
    const res = await WebReq.put(api.bookingCharge.bookingCharge + id, body, false)
    return res;
}
export default bookingChargeService;