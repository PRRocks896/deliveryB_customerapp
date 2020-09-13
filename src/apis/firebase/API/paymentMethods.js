import firebase from "react-native-firebase";
import AppConfig from "../../../ShopertinoConfig";

const paymentMethodsRef = firebase
  .firestore()
  .collection(AppConfig.FIREBASE_COLLECTIONS.PAYMENT_METHODS);

export const updateUserPaymentMethods = async ({ ownerId, card }) => {
  try {
    await paymentMethodsRef.doc(card.cardId).set({ ownerId, card });
  } catch (error) {
    return { error, success: false };
  }
};

export const deleteFromUserPaymentMethods = async cardId => {
  try {
    await paymentMethodsRef.doc(cardId).delete();
  } catch (error) {
    return { error, success: false };
  }
};

export const subscribePaymentMethods = (ownerId, callback) => {
  return paymentMethodsRef
    .where("ownerId", "==", ownerId)
    .onSnapshot(querySnapshot => {
      const paymentMethods = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();

        paymentMethods.push(data);
      });

      return callback(paymentMethods);
    });
};

export const savePaymentSource = async (userId, source) => {
  try {
    const response = await firebase
      .firestore()
      .collection(AppConfig.FIREBASE_COLLECTIONS.STRIPE_CUSTOMERS)
      .doc(userId)
      .collection(AppConfig.FIREBASE_COLLECTIONS.SOURCES)
      .doc(source.fingerprint)
      .set(source);

    return { response, success: true };
  } catch (error) {
    return { error, success: false };
  }
};
