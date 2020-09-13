import {
  register,
  login,
  loginWithFacebook,
  logout,
  getUserData,
  saveStripeCustomer,
  getStripeCustomerId,
  loginWithGoogle
} from "./auth";
import { categoriesRef, subscribeCategories } from "./categories";
import { savePaymentCharge, updateOrders } from "./checkout";
import { setUserProfile } from "./editProfile";
import { subscribeOrders } from "./orders";
import {
  updateUserPaymentMethods,
  deleteFromUserPaymentMethods,
  subscribePaymentMethods,
  savePaymentSource
} from "./paymentMethods";
import { productsRef, subscribeProducts } from "./products";
import {
  setUserShippingAddress,
  subscribeShippingMethods
} from "./shippingAddress";
import { setUserWishList } from "./wishlist";

export const firebaseDataManager = {
  register,
  login,
  loginWithFacebook,
  loginWithGoogle,
  logout,
  getUserData,
  saveStripeCustomer,
  getStripeCustomerId,
  categoriesRef,
  subscribeCategories,
  savePaymentCharge,
  updateOrders,
  setUserProfile,
  subscribeOrders,
  updateUserPaymentMethods,
  deleteFromUserPaymentMethods,
  subscribePaymentMethods,
  savePaymentSource,
  productsRef,
  subscribeProducts,
  setUserShippingAddress,
  subscribeShippingMethods,
  setUserWishList
};
