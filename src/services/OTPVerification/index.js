import WebReq from '../web-req.service';
import api from '../url.service';

const verifyOTP = async (body) => {
    console.log("Signup service", body)
    const res = await WebReq.post(api.verifyOtp.verifyOtp, body, false)
    console.log("in service", res)
    return res;

}
export default verifyOTP;