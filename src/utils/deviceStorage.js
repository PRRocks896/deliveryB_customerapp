import AsyncStorage from "@react-native-community/async-storage";

const LOGGED_IN_USER_DATA = "LOGGED_IN_USER_DATA";
const SHOULD_SHOW_ONBOARDING_FLOW = "SHOULD_SHOW_ONBOARDING_FLOW";

const CREDENTIAL_KEYS = {
  email: "EMAIL",
  password: "PASSWORD"
};

/**
 * Get user Data
 * @returns {Object}
 */
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(LOGGED_IN_USER_DATA);
    console.log("userData in device store ", userData)
    // return userData ? JSON.parse(userData) : { data: {} };
    if (userData !== null) {
      return JSON.parse(userData);
    } else {
      return false;
    }
  } catch (err) {
    return err;
  }
};

/**
 * Set user Data
 * @param {Object} data
 *
 */
const setUserData = async data => {
  console.log(":::::::::::::::::::::::::setUserData:::::::::::::::::::::::::set data in device stogae", data)
  try {
    await AsyncStorage.setItem(LOGGED_IN_USER_DATA, JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
};

/**
 * Set user Data
 * @param {Object} data
 *
 */
const removeUserData = async () => {
  console.log("::::::::::::::::::::::::removeUserData:::::::::::::::::::::::::::set data in device stogae")
  try {
    await AsyncStorage.removeItem(LOGGED_IN_USER_DATA);
    await AsyncStorage.removeItem(CREDENTIAL_KEYS.email);
    await AsyncStorage.removeItem(CREDENTIAL_KEYS.password);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Set user Data
 * @param {String} value
 * @returns {Boolean}
 */
const getShouldShowOnboardingFlow = async () => {
  console.log(":::::::::::::::::::::::::::::::getShouldShowOnboardingFlow::::::::::::::::::::set data in device stogae")

  try {
    const result = await AsyncStorage.getItem(SHOULD_SHOW_ONBOARDING_FLOW);

    return result !== null ? false : true;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Set user Data
 * @param {String} value
 *
 */
const setShouldShowOnboardingFlow = async value => {
  console.log("::::::::::::::::::::::::::::::::::::::::setShouldShowOnboardingFlow:::::::::::set data in device stogae")

  try {
    await AsyncStorage.setItem(SHOULD_SHOW_ONBOARDING_FLOW, value);
  } catch (err) {
    console.log(err);
  }
};

const deviceStorage = {
  getUserData,
  setUserData,
  removeUserData,
  getShouldShowOnboardingFlow,
  setShouldShowOnboardingFlow
};

export default deviceStorage;
