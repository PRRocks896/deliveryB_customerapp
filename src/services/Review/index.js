import WebReq from '../web-req.service';
import api from '../url.service';

export async function addRating (body, id)  {
    const res = await WebReq.post(api.postReview.postReview + id, body, true)
    return res;

}
export async function getRatingbyProduct (id)  {
    const res = await WebReq.get(api.getratingproduct.getratingproduct + id + '?page=0&limit=1', true)
    return res;

}


export async function shopaddRating (body, id)  {
    const res = await WebReq.post(api.postShopRating.postShopRating + id, body, true)
    return res;

}
export async function getshopRatingbyProduct (id)  {
    const res = await WebReq.get(api.getRatingbyShop.getRatingbyShop + id + '?page=0&limit=1', true)
    return res;

}