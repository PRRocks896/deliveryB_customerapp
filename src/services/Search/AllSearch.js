import WebReq from '../web-req.service';
import api from '../url.service';

const allSearchData = async (data) => {
    const res = await WebReq.get(api.allSearch.allSearch + data, true)
    return res;

}
export default allSearchData;