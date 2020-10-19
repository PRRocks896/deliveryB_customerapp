import WebReq from '../web-req.service';
import api from '../url.service';

const verifyOTP = async (body) => {
   
    const res = await WebReq.post(api.verifyOtp.verifyOtp, body, false)
    return res;

}
export default verifyOTP;