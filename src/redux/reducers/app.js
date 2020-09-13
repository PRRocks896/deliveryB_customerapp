const SET_LOADER = "SET_LOADER";
const UPDATE_USER = "UPDATE_USER";

export const setLoader = data => ({
  type: SET_LOADER,
  data
});

export const setUserData = data => ({
  type: UPDATE_USER,
  data
});

const initialState = {
  isLoading: false,
  user: {},
  stripeCustomer: ""
};

export const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADER:
      return {
        ...state,
        isLoading: action.data
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.data.user,
        stripeCustomer: action.data.stripeCustomer
      };

    default:
      return state;
  }
};
