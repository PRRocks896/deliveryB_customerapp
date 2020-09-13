import React from 'react';
import PropTypes from 'prop-types';
import { FlatList } from 'react-native';

import ThreadItem from './ThreadItem';
import dynamicStyles from './styles';
import { useColorScheme } from 'react-native-appearance';

function MessageThread(props) {
  const {
    thread,
    user,
    onChatMediaPress,
    appStyles,
    onSenderProfilePicturePress,
  } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(appStyles, colorScheme);

  const renderChatItem = ({ item }) => (
    <ThreadItem
      item={item}
      user={{ ...user, userID: user.id }}
      appStyles={appStyles}
      onChatMediaPress={onChatMediaPress}
      onSenderProfilePicturePress={onSenderProfilePicturePress}
    />
  );

  return (
    <FlatList
      inverted={true}
      vertical={true}
      showsVerticalScrollIndicator={false}
      data={thread}
      renderItem={renderChatItem}
      keyExtractor={item => `${item.id}`}
      contentContainerStyle={styles.messageThreadContainer}
    />
  );
}

MessageThread.propTypes = {
  thread: PropTypes.array,
  user: PropTypes.object,
  onChatMediaPress: PropTypes.func,
};

export default MessageThread;
