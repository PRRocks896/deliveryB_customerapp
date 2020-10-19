import WebReq from '../web-req.service';
import api from '../url.service';

const signup = async (body) => {
   
    const res = await WebReq.post(api.signup.singUP, body, false)
 
    return res;

}
export default signup;