import WebReq from '../web-req.service';
import api from '../url.service';

const BookDboy = async (body, id) => {
    console.log("api", api.dboybookingCustomerId.dboybookingCustomerId + id)
    const res = await WebReq.post(api.dboybookingCustomerId.dboybookingCustomerId + id, body, false)
    return res;

}
export default BookDboy;