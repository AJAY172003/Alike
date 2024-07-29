import React, {useState} from 'react';
import {Dimensions, Text, TouchableOpacity} from 'react-native';
import {NativeMediaView} from 'react-native-admob-native-ads';

export const MediaView = ({aspectRatio = 1.5}) => {
  const onVideoPlay = () => {
    console.log('VIDEO', 'PLAY', 'Video is now playing');
  };

  const onVideoPause = () => {
    console.log('VIDEO', 'PAUSED', 'Video is now paused');
  };

  const onVideoProgress = event => {
    // console.log('VIDEO', 'PROGRESS UPDATE', event);
  };

  const onVideoEnd = () => {
    console.log('VIDEO', 'ENDED', 'Video end reached');
  };

  const onVideoMute = muted => {
    console.log('VIDEO', 'MUTE', muted);
  };

  return (
      <NativeMediaView
        style={{
          width: 260,
          height: 260 / aspectRatio,
          backgroundColor: 'white',
          borderRadius: 10
        }}
        onVideoPause={onVideoPause}
        onVideoPlay={onVideoPlay}
        onVideoEnd={onVideoEnd}
        onVideoProgress={onVideoProgress}
        onVideoMute={onVideoMute}
      />
  );
};