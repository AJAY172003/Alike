import {
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import InAppReview from 'react-native-in-app-review';

import {routes} from '../constants/routes';
import {
  setChatData,
  setCurrentChatTab,
  setInfoPopupSeen,
  setNumUserOnline,
  setRequiredFilters,
  setstarsGiven,
} from '../redux/DataSlice';
import firebase from '@react-native-firebase/app';
import StarModalNext from '../assets/images/starModalNext.svg';
import {initializeApp} from 'firebase/app';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import uuid from 'react-native-uuid';
import React, {useEffect, useRef, useState} from 'react';
import {BlockedScreen} from '../components/BlockedScreen';
import appsFlyer from 'react-native-appsflyer';
import StarRating from 'react-native-star-rating-widget';
import StarImage from '../assets/images/starImage.svg';
import {getData} from '../utils/storage';

export const HomeScreen = ({navigation}) => {
  const ws = useRef(null);

  const [rating, setRating] = useState(0);
  const [starModalVisible, setstarModalVisible] = useState(false);
  // TODO: Replace the following with your app's Firebase project configuration
  // const firebaseConfig = {
  //   apiKey: 'AIzaSyAZTxitXSFBByCGdqB9gI2eJFTIbVLRNsw',
  //   authDomain: 'lit-app-login.firebaseapp.com',
  //   projectId: 'lit-app-login',
  //   storageBucket: 'lit-app-login.appspot.com',
  //   messagingSenderId: '410497703187',
  //   appId: '1:410497703187:android:e0d78a6df74f885c910ee6',
  // };
  // const app = initializeApp(firebaseConfig);
  useEffect(() => {
    getData('starsGiven').then(data => {
      console.log('data', data);
      if (data == null) {
        if (appOpenNumber % 5 == 0) {
          setstarModalVisible(true);
        }
      } else {
        if (appOpenNumber == 5 || appOpenNumber % data == 0) {
          setstarModalVisible(true);
        }
      }
    });
  }, []);
  const closeStarModal = () => {
    console.log('ratingggggggg', rating);
    if (rating == 5) {
      dispatch(setstarsGiven(50000));
      InAppReview.isAvailable();

      // trigger UI InAppreview
      InAppReview.RequestInAppReview()
        .then(hasFlowFinishedSuccessfully => {
          console.log('InAppReview.isAvailable', hasFlowFinishedSuccessfully);
        })
        .catch(error => {
          console.log(error);
        });
    }
    setstarModalVisible(false);
  };

  function setRatingByUser(stars) {
    if (stars == 4) dispatch(setstarsGiven(10));
    if (stars == 3) dispatch(setstarsGiven(20));
    if (stars == 2) dispatch(setstarsGiven(30));
    if (stars == 1) dispatch(setstarsGiven(40));
  }
  appsFlyer.initSdk(
    {
      devKey: 'bMqCKui6dFrYiwP4mePF3Q',
      isDebug: false,
      appId: 'app.lit',
      onInstallConversionDataListener: false, //Optional
      onDeepLinkListener: true, //Optional
      timeToWaitForATTUserAuthorization: 10, //for iOS 14.5
      manualStart: true, //Optional
    },
    res => {
      console.log('response', res);
    },
    err => {
      console.error(err);
    },
  );
  appsFlyer.startSdk();
  const [modalVisible, setModalVisible] = useState(false);

  const dispatch = useDispatch();
  const {
    NumUserOnline,
    Reports,
    isBlocked,
    InfoPopupSeen,
    appOpenNumber,
    User,
  } = useSelector(state => state.data);
  useFocusEffect(
    React.useCallback(() => {
      ws.current = new WebSocket(
        'wss://king-prawn-app-xjfwg.ondigitalocean.app',
      );
      console.log('connected to homwscreen');
      setTimeout(() => {
        ws.current.onmessage = event => {
          const message = JSON.parse(event.data);
          if (message.event == 'online') {
            dispatch(setNumUserOnline(message.numOnlineUsers));
          }
        };
      }, 0);

      return () => {
        console.log('unsubscribed......');
        ws.current.close();
      };
    }, []),
  );
  useEffect(() => {
    console.log('app', appOpenNumber);
    if (InfoPopupSeen == false) {
      openModal();
    }
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    // dispatch(setInfoPopupSeen(true));
    setModalVisible(false);
  };

  // method to add commas in number
  const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <View
      style={{
        backgroundColor: '#211F1F',
        height: '100%',
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 35,
      }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={starModalVisible}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 23.5,
              width: 310,
              height: 422,
              paddingHorizontal: 20,
              gap: 20,
              alignItems: 'center',
              backgroundColor: '#211F1F',
              marginTop: 150,
            }}>
            {rating == 0 ? (
              <>
                <View style={{alignItems: 'center'}}>
                  <StarImage />
                </View>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: 30,
                  }}>
                  If you enjoy using LIT app please rate us on 5 Star
                </Text>
                <StarRating
                  enableHalfStar={false}
                  rating={rating}
                  onChange={rating => {
                    setRatingByUser(Math.round(rating));
                    setRating(Math.round(rating));
                  }}
                />
              </>
            ) : (
              <>
                <View style={{alignItems: 'center'}}>
                  <View>
                    <StarModalNext />
                  </View>
                </View>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: 5,
                  }}>
                  Thank You for your {'\n'}feedback
                </Text>

                <TouchableOpacity
                  onPress={closeStarModal}
                  style={{
                    backgroundColor: '#051EFF',
                    marginTop: 35,
                    height: 50,
                    width: 130,
                    alignSelf: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      paddingTop: 10,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      {!isBlocked ? (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 25,
            }}>
            <View
              style={{
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 40,
                  marginTop: 15,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                {`${numberWithCommas(NumUserOnline)}`}
                <Text
                  style={{
                    color: 'white',
                    fontSize: 25,
                    fontWeight: 'bold',
                  }}>
                  {`\nPEOPLE ONLINE`}
                </Text>
              </Text>
              <Image
                source={require('../assets/images/online.png')}
                style={{
                  marginBottom: 10,
                  marginLeft: 7,
                  height: 11,
                  width: 11,
                  resizeMode: 'contain',
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate(routes.SETTINGS)}>
              <Image
                source={require('../assets/images/settings_icon.png')}
                style={{
                  height: 30,
                  width: 30,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 30,
            }}
            onPress={() => {
              dispatch(setCurrentChatTab(1));
              dispatch(
                setChatData({
                  1: {
                    receiverId: null,
                    messages: [],
                    unseenMessages: 0,
                    requestId: uuid.v4(),
                    typing: false,
                  },
                }),
              );
              dispatch(
                setRequiredFilters({
                  country: null,
                  chatRoom: null,
                  likes: [],
                }),
              );
              navigation.navigate(routes.CHATMANAGER, {
                userId: uuid.v4(),
              });
            }}>
            <ImageBackground
              source={require('../assets/images/chat_with_strangers.png')}
              style={{
                resizeMode: 'contain',
                height: 90,
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 7,
            }}>
            <TouchableOpacity
              style={{
                marginTop: 7,
                flex: 0.5,
              }}
              onPress={() => {
                navigation.navigate(routes.COUNTRYCHAT);
              }}>
              <ImageBackground
                source={require('../assets/images/country_chat.png')}
                style={{
                  resizeMode: 'contain',
                  height: 90,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.5,
                marginTop: 7,
              }}
              onPress={() => {
                navigation.navigate(routes.CHATROOM);
              }}>
              <ImageBackground
                source={require('../assets/images/chat_room.png')}
                style={{
                  resizeMode: 'contain',
                  height: 90,
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 7,
            }}
            onPress={() => {
              navigation.navigate(routes.COMMONLIKES);
            }}>
            <ImageBackground
              source={require('../assets/images/common_likes_banner.png')}
              style={{
                resizeMode: 'contain',
                height: 90,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate(routes.ACCOUNTHEALTH)}>
            <Text
              style={{
                backgroundColor: '#051EFF',
                fontSize: 12,
                padding: 4,
                color: 'white',
                fontWeight: 700,
                marginTop: 7,
              }}>
              {`${Reports}/10 reports`}
            </Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 23.5,
                  height: 370,
                  backgroundColor: '#211F1F',
                  marginTop: 200,
                }}>
                <Image
                  source={require('../assets/images/behave_wisely.png')}
                  style={{
                    height: 204,
                    width: 240,
                    resizeMode: 'contain',
                    borderTopLeftRadius: 23.5,
                    borderTopRightRadius: 23.5,
                  }}
                />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 25,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: 30,
                  }}>
                  Behave Wisely
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    backgroundColor: '#051EFF',
                    marginTop: 35,
                    height: 50,
                    width: 130,
                    alignSelf: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      paddingTop: 10,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <BlockedScreen />
      )}
    </View>
  );
};
