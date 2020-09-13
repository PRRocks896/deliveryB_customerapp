//default
import axios from "axios";
import AppConfig from "../ShopertinoConfig";

//firebase
export * from "./firebase/API";

//stripe
export * from "./stripe";

export default axios.create(AppConfig.stripe_ENV.API);
