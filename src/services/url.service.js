import Config from '../config'
import config from '../config';
const api = {
    signup: {
        singUP: Config.getURL + 'shared/app-signup'
    },
    verifyOtp: {
        verifyOtp: Config.getURL + 'shared/app-verify-otp'
    },
    addProfileDatails: {
        addProfileDatails: Config.getURL + 'shared/app-personal-detail'
    },
    signIN: {
        signIN: Config.getURL + 'customer/signin'
    },
    forgotPassword: {
        forgotPassword: Config.getURL + 'shared/app-forgot-password'
    },
    resetPassword: {
        resetPassword: Config.getURL + 'shared/app-reset-password'
    },
    getProduct: {
        getProduct: Config.getURL + 'customer/products?order=asc'
    },
    getCategory: {
        getCategory: Config.getURL + 'common/category/list'
    },
    getProfileDetails: {
        getProfileDetails: Config.getURL + 'shared/user'
    },
    changeProfileImage: {
        changeProfileImage: Config.getURL + 'shared/user-profile-picture'
    },
    getProductById: {
        getProductById: Config.getURL + 'customer/products?order=asc&category='
    },
    postOrder: {
        postOrder: Config.getURL + 'customer/orders'
    },
    addAddress: {
        addAddress: Config.getURL + 'customer/address'
    },
    getAddressviauser: {
        getAddressviauser: Config.getURL + 'customer/addressViaUserId/'
    },
    getAddress: {
        getAddress: Config.getURL + 'customer/address/'
    },
    updateAddress: {
        updateAddress: Config.getURL + 'customer/address/'
    },
    getOrder: {
        getOrder: Config.getURL + 'customer/ordersByCustomerId/'
    },
    searchProducts: {
        searchProducts: Config.getURL + 'customer/search-products?words='
    },
    addToBag: {
        addToBag: Config.getURL + 'customer/wishlist'
    },
    wishlistchangeStatus: {
        wishlistchangeStatus: Config.getURL + 'customer/wishlist/changeStatus/'
    },
    changeMobile: {
        changeMobile: Config.getURL + 'shared/change-mobile'
    },




    // For Stripe Token
    getStripeToken: {
        getStripeToken: 'https://api.stripe.com/v1/tokens'
    },
    createStripeCustomer: {
        createStripeCustomer: 'https://api.stripe.com/v1/customers'
    },
    customerCharges: {
        customerCharges: 'https://api.stripe.com/v1/charges'
    },

}

export default api;