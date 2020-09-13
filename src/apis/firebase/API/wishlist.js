import firebase from "react-native-firebase";
import AppConfig from "../../../ShopertinoConfig";

export const setUserWishList = async (userId, wishlist) => {
  try {
    const userRef = firebase
      .firestore()
      .collection(AppConfig.FIREBASE_COLLECTIONS.USERS)
      .doc(userId);

    await userRef.update({
      wishlist
    });
    const user = await userRef.get();

    return { user: user.data(), success: true };
  } catch (error) {
    return { error, success: false };
  }
};
