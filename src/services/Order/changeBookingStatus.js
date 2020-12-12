import WebReq from '../web-req.service';
import api from '../url.service';

const bookingStatusService = async (body, id) => {
    console.log("status change api", api.changeBookingStatus.changeBookingStatus + id, body)
    const res = await WebReq.put(api.changeBookingStatus.changeBookingStatus + id, body, false)
    return res;
}
export default bookingStatusService;