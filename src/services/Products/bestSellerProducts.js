import WebReq from '../web-req.service';
import api from '../url.service';

const getbestSellerService = async (page) => {
    console.log("============================", api.getbestSellerProduct.getbestSellerProduct + page + `&limit=10`)
    const res = await WebReq.get(api.getbestSellerProduct.getbestSellerProduct + page + `&limit=10`, true)
    return res;

}
export default getbestSellerService;