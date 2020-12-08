import WebReq from '../web-req.service';
import api from '../url.service';
  
export async function getshopTypeList (body)  {
    
    const res = await WebReq.post(api.shopTypelist.shopTypelist, body, true)
    return res;

}

export async function getshopeListbyType (body, id)  {
    
    const res = await WebReq.post(api.shoplistbyType.shoplistbyType + id, body, true)
    return res;

}

export async function getproductshopWise (data)  {
    console.log("data api",api.productsbyshop.productsbyshop + data )
    const res = await WebReq.get(api.productsbyshop.productsbyshop + data, true)
    return res;

}