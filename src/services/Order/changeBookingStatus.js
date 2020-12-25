import WebReq from '../web-req.service';
import api from '../url.service';

const bookingStatusService = async (body, id) => {
    const res = await WebReq.put(api.changeBookingStatus.changeBookingStatus + id, body, false)
    return res;
}
export default bookingStatusService;