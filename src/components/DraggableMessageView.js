import Clipboard from '@react-native-clipboard/clipboard';
import {useRef, useState} from 'react';
import {
  Alert,
  Linking,
  PanResponder,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {Animated} from 'react-native';

export const DraggableMessageView = ({
  message,
  draggedIndex,
  setDraggedIndex,
  index,
  showReplyToWindow,
  replyToMessage,
  scrollToDirectedMessage,
  highlightMessageIndex,
}) => {
  const shouldHandleReleaseRef = useRef(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          shouldHandleReleaseRef.current = true;
          // Only update pan.x if the gesture is moving to the right
          setDraggedIndex(index);
          Animated.event(
            [null, {dx: pan.x, dy: pan.y}], // Update pan.x and pan.y with gesture
            {useNativeDriver: false},
          )(evt, gestureState);
        } else {
          shouldHandleReleaseRef.current = false;
        }
      },
      onPanResponderRelease: () => {
        if (shouldHandleReleaseRef.current) {
          shouldHandleReleaseRef.current = false;
          showReplyToWindow(index);
          // Reset the position of the view to its initial state
          Animated.timing(pan, {
            toValue: {x: 0, y: 0},
            duration: 0, // Set duration to 0 to make it immediate
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  // method to parse the text passed and idintifying the links in it and then returning the text component with the links
  const parseTextWithLinks = text => {
    // Regular expression to split text by URLs
    const parts = text.split(
      /\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/,
    );
    return parts.map((part, index) => {
      if (
        part.match(/\b(https?:\/\/\S+|www\.\S+\.\S+|\S+\.\S+\/\S+|\S+\.\S+)/)
      ) {
        const url =
          part.startsWith('http') || part.startsWith('www')
            ? part
            : 'http://' + part; // Append http:// to URLs missing a protocol or www.
        return (
          <Text
            key={index}
            style={{color: '#FF4949'}}
            onPress={() => Linking.openURL(url)}>
            {part.trim()}
          </Text>
        );
      }
      return <Text key={index}>{part.trim()}</Text>;
    });
  };

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{translateX: pan.x}],
          },
        ]}
        {...panResponder.panHandlers}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: message.belongs_to ? 'flex-end' : 'flex-start',
            backgroundColor:
              highlightMessageIndex === index
                ? 'rgba(255, 255, 255, 0.2)'
                : 'transparent',
            paddingLeft: message.belongs_to ? 70 : 10,
            paddingRight: message.belongs_to ? 10 : 70,
          }}>
          <View
            style={{
              backgroundColor: message.belongs_to ? '#051EFF' : '#606060',
              borderRadius: message.reply_msg_id !== null ? 15 : 20,
              padding: 3,
              marginBottom: 8,
            }}>
            {message.reply_msg_id !== null ? (
              <TouchableOpacity
                onPress={() =>
                  scrollToDirectedMessage(replyToMessage?.messageId)
                }
                activeOpacity={0.8}>
                <View
                  style={{
                    backgroundColor: '#211F1F',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    padding: 5,
                  }}>
                  <View
                    style={{
                      borderRadius: 10,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          color: '#0066b2',
                          fontWeight: 500,
                          fontSize: 12,
                          paddingTop: 2,
                        }}>
                        {message.belongs_to ? 'You' : 'Stranger'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                      }}
                      numberOfLines={2}>
                      {replyToMessage ? replyToMessage.text : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onLongPress={() => {
              Clipboard.setString(message.text)
             ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT)
            }} 
              activeOpacity={0.8 }
              >
            <Text
              style={{
                color: 'white',
                fontSize: 15,
                flexWrap: 'wrap',
                paddingHorizontal: 5,
                paddingVertical: 5,
                lineHeight: 20
              }}>

              {' '}
              {parseTextWithLinks(message.text)}
            </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
};
