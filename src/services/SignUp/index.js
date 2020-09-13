import WebReq from '../web-req.service';
import api from '../url.service';

const signup = async (body) => {
    // console.log("Signup service", body)
    const res = await WebReq.post(api.signup.singUP, body, false)
    // console.log("in service", res)
    return res;

}
export default signup;