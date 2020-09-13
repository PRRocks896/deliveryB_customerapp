import Headers from '../../src/Constants/header'
import { AsyncStorage } from 'react-native';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_zKjF89F1BXY9dRGquKZ44ZS300EI4WCGKh';
const STRIPE_SECRET_KEY = 'sk_test_7jK3rEYJcduJPhXqDKtZh4zc00G47MbWVQ'
const WebReq = {
    get: async function (url, isToken = false) {
        try {
            let allData = await AsyncStorage.getItem('LoginData')
            let token = JSON.parse(allData)
            const headers =
                isToken ? {
                    ...Headers,
                    'Authorization': token.xauthtoken,
                } :
                    Headers


            const res = await fetch(url, { headers: headers, method: 'GET' });
            // console.log("get WEB REQ FILE", res)
            if (res && res.status === 200) {
                return await res.json();
            } else if (res && res.status === 404) {
                return await res.json()
            } else if (res && res.status === 500) {
                return {
                    data: {},
                    message: 'Internal server error',
                    messageCode: 'Internal server error',
                    success: false
                }
            }
        } catch (err) {
            throw err;
        }
    },
    post: async function (url, body, isToken = false, changeContenttype = false, secretKey = false) {
        try {
            let allData = await AsyncStorage.getItem('LoginData')
            let token = JSON.parse(allData)
            // console.log('changeContent: ', changeContenttype);
            if (changeContenttype == true || secretKey == true) {
                Headers['Content-Type'] = 'application/x-www-form-urlencoded'
            } else {
                Headers['Content-Type'] = 'application/json'
            }
            // console.log('After change header: ', Headers);
            const headers =
                isToken ? {
                    ...Headers,
                    'Authorization': changeContenttype ? `Bearer ${STRIPE_PUBLISHABLE_KEY}` : secretKey ? `Bearer ${STRIPE_SECRET_KEY}` : token.xauthtoken,
                } :
                    Headers
            console.log("body", url, body, headers)
            const res = await fetch(url, { headers: headers, method: 'POST', body: body });
            console.log("In WEB REQ service:", res)
            if (res && res.status === 200) {
                const authToken = res.headers.map['x-auth-token'];
                const data = await res.json();
                return { 'xauthtoken': authToken, ...data };
            } else if (res && res.status === 404) {
                return await res.json()
            } else if (res && res.status === 500) {
                return {
                    data: {},
                    message: 'Internal server error',
                    messageCode: 'Internal server error',
                    success: false
                }
            }
            else if (res && res.status === 400) {
                return {
                    data: {},
                    message: 'Somthing went wrong',
                    messageCode: 'Somthing went wrong',
                    success: false
                }
            }
        } catch (err) {
            console.log("Error", err)
            throw err;
        }
    },
    put: async function (url, body, isToken = false,) {
        try {
            let allData = await AsyncStorage.getItem('LoginData')
            let token = JSON.parse(allData)
            const headers =
                isToken ? {
                    ...Headers,
                    'Authorization': token.xauthtoken,
                } :
                    Headers
            // console.log("in put web req", url, body)
            const res = await fetch(url, { headers: headers, method: 'PUT', body: body });
            // console.log("PUT REQ WEB SERVICE", res)
            if (res && res.status === 200) {
                return await res.json()
            } else if (res && res.status === 404) {
                return await res.json()
            } else if (res && res.status === 500) {
                return {
                    data: {},
                    message: 'Internal server error',
                    messageCode: 'Internal server error',
                    success: false
                }
            }
        } catch (err) {
            throw err;
        }

    },
    delete: async function (url, isToken = false) {
        try {
            let allData = await AsyncStorage.getItem('LoginData')
            let token = JSON.parse(allData)
            const headers =
                isToken ? {
                    ...Headers,
                    'Authorization': token.xauthtoken,
                } :
                    Headers
            // console.log("in delete web req", url, headers)
            const res = await fetch(url, { headers: headers, method: 'DELETE' });
            // console.log("DELETE REQ WEB SERVICE", res)
            if (res && res.status === 200) {
                return await res.json()
            } else if (res && res.status === 404) {
                return await res.json()
            } else if (res && res.status === 500) {
                return {
                    data: {},
                    message: 'Internal server error',
                    messageCode: 'Internal server error',
                    success: false
                }
            }
        } catch (err) {
            throw err;
        }

    },

}

export default WebReq;