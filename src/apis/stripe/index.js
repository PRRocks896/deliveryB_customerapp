import apiConnector from "../index";

const postRequest = async (endPoint, body) => {
  try {
    const response = await apiConnector.post(endPoint, body);

    return { ...response, success: true };
  } catch (error) {
    const stripeError = error.response ? error.response : error;
    console.log("stripeError: ", stripeError);
    return { stripeError, success: false };
  }
};

const createStripeCustomer = email => {
  const endPoint = "/create-stripe-customer";
  const body = {
    email
  };

  return postRequest(endPoint, body);
};

const addNewPaymentSource = (customerId, token) => {
  const endPoint = "/add-payment-source";
  const body = {
    customerId,
    token
  };

  return postRequest(endPoint, body);
};

const deletePaymentSource = (customerId, token) => {
  const endPoint = "/delete-payment-source";
  const body = {
    customerId,
    token
  };

  return postRequest(endPoint, body);
};

const chargeStripeCustomer = ({ customer, currency, amount, source, uuid }) => {
  const endPoint = "/charge-stripe-customer";
  const body = {
    customer,
    currency,
    amount,
    source,
    uuid
  };

  return postRequest(endPoint, body);
};

const cleanCustomerStripeAccount = customer => {
  const endPoint = "/clean-customer-stripe-account";
  const body = {
    customer
  };

  return postRequest(endPoint, body);
};

export const stripeDataManager = {
  createStripeCustomer,
  addNewPaymentSource,
  deletePaymentSource,
  chargeStripeCustomer,
  cleanCustomerStripeAccount
};
