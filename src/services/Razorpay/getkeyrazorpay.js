
import WebReq from '../web-req.service';
import api from '../url.service';

const getRazorpaykey = async () => {
    const res = await WebReq.get(api.razorpaykey.razorpaykey, false)
    return res;

}
export default getRazorpaykey;