import firebase from 'react-native-firebase';

import { firebaseUser } from '../../../firebase';
import { firebasePost, firebaseStory } from '../../feed/firebase';
import { notificationManager } from '../../../notifications';
import { IMLocalized } from '../../../localization/IMLocalization';
import firebaseConfig from '../../../firebase/config';

// if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const usersRef = firebase.firestore().collection('users');

const friendshipsRef = firebase.firestore().collection('friendships');

const onCollectionUpdate = (querySnapshot, callback) => {
  const data = [];
  querySnapshot.forEach(doc => {
    const temp = doc.data();
    temp.id = doc.id;
    data.push(temp);
  });
  return callback(data, usersRef);
};

export const subscribeToInboundFriendships = (userId, callback) => {
  return friendshipsRef
    .where('user2', '==', userId)
    .onSnapshot(querySnapshot => onCollectionUpdate(querySnapshot, callback));
};

export const subscribeToOutboundFriendships = (userId, callback) => {
  return friendshipsRef
    .where('user1', '==', userId)
    .onSnapshot(querySnapshot => onCollectionUpdate(querySnapshot, callback));
};

export const addFriendRequest = (
  fromUser,
  toUser,
  persistFriendshipsCounts,
  extendFollowers,
  enableFeedUpdates,
  callback,
) => {
  const fromUserID = fromUser.id;
  const toUserID = toUser.id;
  if (fromUserID == toUserID) {
    callback(null);
    return;
  }

  friendshipsRef
    .add({
      user1: fromUserID,
      user2: toUserID,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      if (persistFriendshipsCounts) {
        updateFriendshipsCounts(fromUserID);
        updateFriendshipsCounts(toUserID);
      }
      if (enableFeedUpdates) {
        if (extendFollowers) {
          // We followed someone so we populate our own feed with posts from that person
          firebasePost.hydrateFeedForNewFriendship(fromUserID, toUserID);
          firebaseStory.hydrateStoriesForNewFriendship(fromUserID, toUserID);
        }
      }
      var notificationBody =
        fromUser.firstName +
        ' ' +
        fromUser.lastName +
        ' ' +
        (extendFollowers
          ? IMLocalized('just followed you.')
          : IMLocalized('sent you a friend request.'));
      notificationManager.sendPushNotification(
        toUser,
        fromUser.firstName + ' ' + fromUser.lastName,
        notificationBody,
        extendFollowers ? 'friend_request' : 'social_follow',
        { fromUser },
      );
      callback({ success: true });
    })
    .catch(error => {
      callback({ error: error });
    });
};

export const cancelFriendRequest = (
  currentUserID,
  toUserID,
  persistFriendshipsCounts,
  enableFeedUpdates,
  callback,
) => {
  if (currentUserID == toUserID) {
    callback(null);
    return;
  }
  const query = friendshipsRef
    .where('user1', '==', currentUserID)
    .where('user2', '==', toUserID);
  const db = firebase.firestore();
  let batch = db.batch();
  const unsubscribe = query.onSnapshot(querySnapshot => {
    if (querySnapshot) {
      querySnapshot.forEach(doc => {
        let ref = friendshipsRef.doc(doc.id);
        batch.delete(ref);
      });
      // Commit the batch
      batch.commit().then(function() {
        unsubscribe();
        if (persistFriendshipsCounts) {
          updateFriendshipsCounts(currentUserID);
          updateFriendshipsCounts(toUserID);
        }
        if (enableFeedUpdates) {
          // currentUserID is not following toUserID anymore, so we remove feed posts and stories
          firebasePost.removeFeedForOldFriendship(currentUserID, toUserID);
          firebaseStory.removeStoriesForOldFriendship(currentUserID, toUserID);
        }
        callback({ success: true });
      });
    } else {
      callback({ success: true });
    }
  });
};

export const unfriend = async (
  currentUserID,
  toUserID,
  persistFriendshipsCounts,
  enableFeedUpdates,
  callback,
) => {
  if (currentUserID == toUserID) {
    callback(null);
    return;
  }
  if (enableFeedUpdates) {
    // This is in fact an unfollow, for a mutual follow relationship
    cancelFriendRequest(
      currentUserID,
      toUserID,
      persistFriendshipsCounts,
      enableFeedUpdates,
      response => {
        callback(response);
      },
    );
  } else {
    cancelFriendRequest(
      currentUserID,
      toUserID,
      persistFriendshipsCounts,
      enableFeedUpdates,
      _response => {
        cancelFriendRequest(
          toUserID,
          currentUserID,
          persistFriendshipsCounts,
          enableFeedUpdates,
          response => {
            callback(response);
          },
        );
      },
    );
  }
};

export const updateFeedsForNewFriends = (userID1, userID2) => {
  firebasePost.hydrateFeedForNewFriendship(userID1, userID2);
  firebaseStory.hydrateStoriesForNewFriendship(userID1, userID2);
  firebasePost.hydrateFeedForNewFriendship(userID2, userID1);
  firebaseStory.hydrateStoriesForNewFriendship(userID2, userID1);
};

const updateFriendshipsCounts = async userID => {
  // inbound
  const inbound = await friendshipsRef.where('user2', '==', userID).get();
  const inboundCount = inbound.docs ? inbound.docs.length : 0;
  firebaseUser.updateUserData(userID, { inboundFriendsCount: inboundCount });

  // outbound
  const outbound = await friendshipsRef.where('user1', '==', userID).get();
  const outboundCount = outbound.docs ? outbound.docs.length : 0;
  firebaseUser.updateUserData(userID, { outboundFriendsCount: outboundCount });
};
