import adminManager from "./instamobileAdminManager";
import { firebaseAuth, firebaseUser } from "../../firebase";
import { firebaseStorage } from "../../firebase/storage";
import { stripeDataManager } from "../../stripe";
import { ErrorCode } from "./ErrorCode";
import * as Geolocation from "expo-location";
import * as Facebook from "expo-facebook";
import { cos } from "react-native-reanimated";

const defaultProfilePhotoURL =
  "https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg";

const loginWithEmailAndPassword = (email, password, appConfig) => {
  return firebaseLogin(email, password);
};

const createAccountWithEmailAndPassword = (userDetails, appConfig) => {
  return createFirebaseAccount(userDetails, appConfig);
};

const retrievePersistedAuthUser = appConfig => {
  switch (appConfig.API_TO_USE.toLowerCase()) {
    case appConfig.APIs.firebase.toLowerCase():
      return retrieveFirebaseAuthUser();
    default:
      return retrieveFirebaseAuthUser();
  }
};

const retrieveFirebaseAuthUser = () => {
  return new Promise(resolve => {
    firebaseAuth.retrievePersistedAuthUser().then(user => {
      if (user) {
        handleSuccessfulLogin(user, false).then(res => {
          // Persisted login successful, push token stored, login credential persisted, so we log the user in.
          resolve({
            user: res.user,
            stripeCustomer: res.user.stripeCustomer
          });
        });
      } else {
        resolve(null);
      }
    });
  });
};

const firebaseLogin = (email, password) => {
  return new Promise(function (resolve, _reject) {
    firebaseAuth.loginWithEmailAndPassword(email, password).then(response => {
      if (!response.error) {
        handleSuccessfulLogin({ ...response.user }, false).then(res => {
          // Login successful, push token stored, login credential persisted, so we log the user in.
          resolve({ user: res.user, stripeCustomer: res.user.stripeCustomer });
        });
      } else {
        resolve({ error: response.error });
      }
    });
  });
};

const logout = user => {
  const userData = {
    ...user,
    isOnline: false
  };
  firebaseAuth.updateUser(user.id || user.userID, userData);
  firebaseAuth.logout();
};

const createStripeCustomer = async (email, appConfig) => {
  const stripeCustomer = await stripeDataManager.createStripeCustomer(
    email,
    appConfig
  );

  if (stripeCustomer.success) {
    return stripeCustomer.data.customer.id;
  }

  return false;
};

const createFirebaseAccount = (userDetails, appConfig) => {
  const { photoURI } = userDetails;
  const accountCreationTask = userData => {
    return new Promise((resolve, _reject) => {
      firebaseAuth
        .register(userData, appConfig.appIdentifier)
        .then(async response => {
          if (response.error) {
            resolve({ error: response.error });
          } else {
            // We created the user succesfully, time to upload the profile photo and update the users table with the correct URL
            let user = response.user;
            const stripeCustomer = await createStripeCustomer(
              userDetails.email,
              appConfig
            );
            if (stripeCustomer) {
              user.stripeCustomer = stripeCustomer;
              firebaseUser.updateUserData(user.id, {
                stripeCustomer
              });
            }
            if (photoURI) {
              firebaseStorage.uploadImage(photoURI).then(response => {
                if (response.error) {
                  // if account gets created, but photo upload fails, we still log the user in
                  resolve({
                    nonCriticalError: response.error,
                    user: { ...user, profilePictureURL: defaultProfilePhotoURL }
                  });
                } else {
                  firebaseAuth
                    .updateProfilePhoto(user.id, response.downloadURL)
                    .then(_result => {
                      resolve({
                        user: {
                          ...user,
                          profilePictureURL: response.downloadURL
                        }
                      });
                    });
                }
              });
            } else {
              resolve({
                user: {
                  ...response.user,
                  profilePictureURL: defaultProfilePhotoURL
                }
              });
            }
          }
        });
    });
  };

  return new Promise(function (resolve, _reject) {
    const userData = {
      ...userDetails,
      profilePictureURL: defaultProfilePhotoURL
    };
    accountCreationTask(userData).then(response => {
      if (response.error) {
        resolve({ error: response.error });
      } else {
        // We signed up successfully, so we are logging the user in (as well as updating push token, persisting credential,s etc.)
        handleSuccessfulLogin(response.user, true).then(response => {
          resolve({
            ...response,
            stripeCustomer: response.user.stripeCustomer
          });
        });
      }
    });
  });
};

const loginOrSignUpWithFacebook = appConfig => {
  Facebook.initializeAsync("285315185217069");

  return new Promise(async (resolve, _reject) => {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions
      } = await Facebook.logInWithReadPermissionsAsync({
        // permissions: ['public_profile'],
        permissions: ["email"]
      });

      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        // const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        // Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
        firebaseAuth
          .loginWithFacebook(token, appConfig.appIdentifier)
          .then(async response => {
            if (response.user) {
              const newResponse = {
                user: { ...response.user },
                accountCreated: response.accountCreated
              };
              const stripeCustomer = await createStripeCustomer(
                response.user.email,
                appConfig
              );
              if (stripeCustomer) {
                response.user.stripeCustomer = stripeCustomer;
                firebaseUser.updateUserData(response.user.id, {
                  stripeCustomer
                });
              }
              handleSuccessfulLogin(
                newResponse.user,
                response.accountCreated
              ).then(response => {
                // resolve(response);
                resolve({
                  ...response,
                  stripeCustomer: response.user.stripeCustomer
                });
              });
            } else {
              resolve({ error: ErrorCode.fbAuthFailed });
            }
          });
      } else {
        resolve({ error: ErrorCode.fbAuthCancelled });
      }
    } catch (error) {
      resolve({ error: ErrorCode.fbAuthFailed });
    }
  });
};

const retrieveUserByPhone = phone => {
  console.log("in auth manager retrieveUserByPhone:", phone)
  return firebaseAuth.retrieveUserByPhone(phone);
};

const sendSMSToPhoneNumber = phoneNumber => {
  return firebaseAuth.sendSMSToPhoneNumber(phoneNumber);
};

const loginWithSMSCode = (smsCode, verificationID) => {
  return new Promise(function (resolve, _reject) {
    firebaseAuth.loginWithSMSCode(smsCode, verificationID).then(response => {
      if (response.error) {
        resolve({ error: response.error });
      } else {
        // successful phone number login, we fetch the push token
        handleSuccessfulLogin(response.user, false).then(response => {
          resolve(response);
        });
      }
    });
  });
};

const registerWithPhoneNumber = (
  userDetails,
  smsCode,
  verificationID,
  appIdentifier
) => {
  const { photoURI } = userDetails;
  const accountCreationTask = userData => {
    return new Promise(function (resolve, _reject) {
      firebaseAuth
        .registerWithPhoneNumber(
          userData,
          smsCode,
          verificationID,
          appIdentifier
        )
        .then(response => {
          if (response.error) {
            resolve({ error: response.error });
          } else {
            // We created the user succesfully, time to upload the profile photo and update the users table with the correct URL
            let user = response.user;
            if (photoURI) {
              firebaseStorage.uploadImage(photoURI).then(response => {
                if (response.error) {
                  // if account gets created, but photo upload fails, we still log the user in
                  resolve({
                    nonCriticalError: response.error,
                    user: { ...user, profilePictureURL: defaultProfilePhotoURL }
                  });
                } else {
                  firebaseAuth
                    .updateProfilePhoto(user.id, response.downloadURL)
                    .then(_res => {
                      resolve({
                        user: {
                          ...user,
                          profilePictureURL: response.downloadURL
                        }
                      });
                    });
                }
              });
            } else {
              resolve({
                user: {
                  ...response.user,
                  profilePictureURL: defaultProfilePhotoURL
                }
              });
            }
          }
        });
    });
  };

  return new Promise(function (resolve, _reject) {
    const userData = {
      ...userDetails,
      profilePictureURL: defaultProfilePhotoURL
    };
    accountCreationTask(userData).then(response => {
      if (response.error) {
        resolve({ error: response.error });
      } else {
        handleSuccessfulLogin(response.user, true).then(response => {
          resolve(response);
        });
      }
    });
  });
};

const handleSuccessfulLogin = (user, accountCreated) => {
  // After a successful login, we fetch & store the device token for push notifications, location, online status, etc.
  // we don't wait for fetching & updating the location or push token, for performance reasons (especially on Android)
  fetchAndStoreExtraInfoUponLogin(user, accountCreated);
  if (accountCreated && adminManager) {
    adminManager.handleNewAccountCreation(user);
  }
  return new Promise(resolve => {
    resolve({ user: { ...user } });
  });
};

const fetchAndStoreExtraInfoUponLogin = async (user, accountCreated) => {
  getCurrentLocation(Geolocation).then(async location => {
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    var locationData = {};
    if (location) {
      locationData = {
        location: {
          latitude: latitude,
          longitude: longitude
        }
      };
      if (accountCreated) {
        locationData = {
          ...locationData,
          signUpLocation: {
            latitude: latitude,
            longitude: longitude
          }
        };
      }
    }
    const pushToken = await firebaseAuth.fetchPushTokenIfPossible();
    const userData = {
      ...user,
      ...locationData,
      pushToken: pushToken,
      isOnline: true
    };
    firebaseAuth.updateUser(user.id || user.userID, userData);
  });
};

const getCurrentLocation = geolocation => {
  return new Promise(async resolve => {
    const location = await geolocation.getCurrentPositionAsync({});
    resolve(location);
    // setRegion(location.coords);
    // onLocationChange(location.coords);

    // geolocation.getCurrentPosition(
    //     resolve,
    //     () => resolve({ coords: { latitude: "", longitude: "" } }),
    //     { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    // );
  });
};

const authManager = {
  retrievePersistedAuthUser,
  loginWithEmailAndPassword,
  logout,
  createAccountWithEmailAndPassword,
  loginOrSignUpWithFacebook,
  sendSMSToPhoneNumber,
  loginWithSMSCode,
  registerWithPhoneNumber,
  retrieveUserByPhone
};

export default authManager;
