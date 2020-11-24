import WebReq from '../web-req.service';
import api from '../url.service';

export async function getSubCategoryService  (categoryid) {
    const res = await WebReq.get(api.getsubCategory.getsubCategory + categoryid, true)
    return res;
}
export async function getsubcategoryProductService  (data) {
    const res = await WebReq.get(api.getSubCategoryData.getSubCategoryData + data, true)
    return res;
}

export async function sortingProducts  (data) {
    const res = await WebReq.get(api.sortingProduct.sortingProduct + data, true)
    return res;

}
