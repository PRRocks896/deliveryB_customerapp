import firebase from 'react-native-firebase';

import { firebasePost, firebaseStory } from '../../socialgraph/feed/firebase';
import firebaseConfig from '../../firebase/config';

// if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const admin = {
  id: '8ER8DgByeVhjYaO2D613aSVUi172',
  profilePictureURL:
    'https://firebasestorage.googleapis.com/v0/b/production-a9404.appspot.com/o/A048599D-C100-47D2-B2B9-510ED845B477.jpg?alt=media&token=d7a66e21-6f85-4d81-b9de-bc1335e49f27',
  firstName: 'Florian',
  lastName: 'Marcu',
};

const friendshipsRef = firebase.firestore().collection('friendships');

const swipesRef = firebase.firestore().collection('swipes');

const usersRef = firebase.firestore().collection('users');

const channelsRef = firebase.firestore().collection('channels');

const channelPaticipationRef = firebase
  .firestore()
  .collection('channel_participation');

const handleNewAccountCreation = async user => {
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();

  // Adding friendships
  friendshipsRef.add({
    user1: user.id,
    user2: admin.id,
    created_at: timestamp,
    createdAt: timestamp,
  });
  friendshipsRef.add({
    user1: admin.id,
    user2: user.id,
    created_at: timestamp,
    createdAt: timestamp,
  });
  usersRef.doc(user.id).update({
    inboundFriendsCount: 1,
    outboundFriendsCount: 1,
  });

  // Adding a match with the admin
  swipesRef.add({
    author: user.id,
    swipedProfile: admin.id,
    type: 'like',
    hasBeenSeen: false,
    created_at: timestamp,
    createdAt: timestamp,
  });
  swipesRef.add({
    author: admin.id,
    swipedProfile: user.id,
    type: 'like',
    hasBeenSeen: false,
    created_at: timestamp,
    createdAt: timestamp,
  });

  // Adding all feed posts and stories to the new user's timelines
  firebasePost.hydrateFeedForNewFriendship(user.id, admin.id);
  firebaseStory.hydrateStoriesForNewFriendship(user.id, admin.id);

  const id1 = admin.id;
  const id2 = user.id;
  const channelID = id1 < id2 ? id1 + id2 : id2 + id1;

  // Adding a message with user info visible only to the admin
  channelPaticipationRef.add({ channel: channelID, user: admin.id });
  channelPaticipationRef.add({ channel: channelID, user: user.id });

  const channelData = {
    creator_id: admin.id,
    creatorID: admin.id,
    id: channelID,
    channelID,
  };
  await channelsRef.doc(channelID).set({ ...channelData });

  const message =
    'XARQEGWE13SD fname: ' +
    user.firstName +
    '; lname: ' +
    user.lastName +
    '; email: ' +
    user.email +
    '; id: ' +
    user.id +
    ' app: ' +
    user.appIdentifier;
  const data = {
    content: message,
    created: timestamp,
    createdAt: timestamp,
    recipientFirstName: '',
    recipientID: '',
    recipientLastName: '',
    recipientProfilePictureURL: '',
    senderFirstName: user.firstName,
    senderID: user.id,
    senderLastName: user.lastName,
    senderProfilePictureURL: user.profilePictureURL,
  };
  channelsRef
    .doc(channelID)
    .collection('thread')
    .add({ ...data });

  // Add a welcome message for all demo users
  const message2 =
    "Hey, I’m Florian, the maker of Instamobile. Thanks for installing our demo! Don't hesitate to message me here if you have any questions. ✌️🚀";
  const data2 = {
    content: message2,
    created: timestamp,
    createdAt: timestamp,
    recipientFirstName: '',
    recipientID: '',
    recipientLastName: '',
    recipientProfilePictureURL: '',
    senderFirstName: admin.firstName,
    senderID: admin.id,
    senderLastName: admin.lastName,
    senderProfilePictureURL: admin.profilePictureURL,
  };
  channelsRef
    .doc(channelID)
    .collection('thread')
    .add({ ...data2 });
  channelsRef.doc(channelID).update({
    lastMessage: message2,
    lastMessageDate: timestamp,
  });
};

const adminManager = {
  handleNewAccountCreation,
};

export default adminManager;
