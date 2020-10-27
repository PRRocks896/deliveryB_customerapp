import WebReq from '../web-req.service';
import api from '../url.service';

const searchServiceData = async (name) => {
    const res = await WebReq.get(api.searchService.searchService + name, true)
    return res;

}
export default searchServiceData;