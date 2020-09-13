import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useColorScheme } from 'react-native-appearance';
import PropTypes from 'prop-types';
import dynamicStyles from './styles';

const defaultAvatar =
  'https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg';

function IMConversationIconView(props) {
  const { participants, imageStyle, style, appStyles } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(appStyles, colorScheme);

  const [imgErr, setImgErr] = useState(false);
  const [secondImgErr, setSecondImgErr] = useState(false);

  const onImageError = () => {
    setImgErr(true);
  };

  const onSecondImageError = () => {
    setSecondImgErr(true);
  };

  let firstAvatarUri =
    participants.length > 0 &&
    participants[0].profilePictureURL &&
    participants[0].profilePictureURL.length > 0
      ? participants[0].profilePictureURL
      : defaultAvatar;
  let secondAvatarUri =
    participants.length > 1 &&
    participants[1].profilePictureURL &&
    participants[1].profilePictureURL.length > 0
      ? participants[1].profilePictureURL
      : defaultAvatar;

  return (
    <View style={styles.container}>
      {participants.length == 0 && (
        <View style={styles.singleParticipation}>
          <Image
            style={styles.singleChatItemIcon}
            source={{ uri: defaultAvatar }}
          />
        </View>
      )}
      {participants.length === 1 && (
        <View style={style ? style : styles.singleParticipation}>
          <Image
            style={[styles.singleChatItemIcon, imageStyle]}
            onError={onImageError}
            source={imgErr ? { uri: defaultAvatar } : { uri: firstAvatarUri }}
          />
          {participants[0].isOnline && <View style={styles.onlineMark} />}
        </View>
      )}
      {participants.length > 1 && (
        <View style={styles.multiParticipation}>
          <Image
            style={[styles.multiPaticipationIcon, styles.bottomIcon]}
            onError={onImageError}
            source={imgErr ? { uri: defaultAvatar } : { uri: firstAvatarUri }}
          />
          <View style={styles.middleIcon} />
          <Image
            style={[styles.multiPaticipationIcon, styles.topIcon]}
            onError={onSecondImageError}
            source={
              secondImgErr ? { uri: defaultAvatar } : { uri: secondAvatarUri }
            }
          />
        </View>
      )}
    </View>
  );
}

IMConversationIconView.propTypes = {
  participants: PropTypes.array,
  style: PropTypes.object,
};

export default IMConversationIconView;
