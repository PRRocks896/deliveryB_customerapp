import WebReq from '../web-req.service';
import api from '../url.service';

const addBookingData = async (body) => {
    const res = await WebReq.post(api.booking.booking,body, true)
    return res;

}
export default addBookingData;