
import WebReq from '../web-req.service';
import api from '../url.service';

const refreshTokenService = async (body) => {
    const res = await WebReq.post(api.refreshToken.refreshToken, body, false)
    return res;

}
export default refreshTokenService;