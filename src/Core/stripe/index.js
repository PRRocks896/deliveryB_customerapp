import axios from "axios";

const postRequest = async (endPoint, body, appConfig) => {
  const apiConnector = axios.create(appConfig.stripe_ENV.API);

  try {
    const response = await apiConnector.post(endPoint, body);

    return { ...response, success: true };
  } catch (error) {
    console.log(error);
    const stripeError = error.response ? error.response : error;

    return { stripeError, success: false };
  }
};

const createStripeCustomer = (email, appConfig) => {
  const endPoint = "/create-stripe-customer";
  const body = {
    email
  };

  return postRequest(endPoint, body, appConfig);
};

export const stripeDataManager = {
  createStripeCustomer
};
