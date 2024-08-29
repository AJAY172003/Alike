import {
  BackHandler,
  Image,
  Modal,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  AppState,
  Button,
} from 'react-native';
import uuid from 'react-native-uuid';
import {useDispatch, useSelector} from 'react-redux';
import BuyRefill from '../assets/images/buyrefill.svg';
import {
  setChatData,
  setCurrentChatTab,
  setIsBlocked,
} from '../redux/DataSlice';
import React, {useEffect, useRef, useState} from 'react';
import ChatScreen from '../components/ChatScreen';
import {ConfirmationPopup} from '../components/ConfirmationPopup';
import BackgroundTimer from 'react-native-background-timer';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import {baseMatchingUrls, currentMatchingSystem, matchingUrls, removeRequest, removeUsers, reportUser, skipChat} from '../utils/api';
import { routes } from '../constants/routes';
import { format } from 'date-fns';
import axios from 'axios';
const MAX_CHAT_TAB_LIMIT = 5;
const HEARTBEAT_TIMER = 2000;

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-5213405198446794/5572783813';
export const ChatManager = ({navigation, route}) => {

  const[isBuyRefillPressed,setBuyRefillPressed]=useState(false)
  const [isRefillModalVisible, setRefillModalVisible] = useState(false);
  const [confirmationPopupVisible, setConfirmationPopupVisible] =
    useState(false);
  const [confirmationPopupLoading, setConfirmationPopupLoading] =
    useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChatDeleteVisible, setModalChatDeleteVisible] = useState(false);
  const {userId = uuid.v4()} = route.params;
  const dispatch = useDispatch();
  const chatDataRef = useRef(null);
  const {ChatData, CurrentChatTab, IP, NewMessageText, ReplyIndex,debouncedSearchTerm, User} =
    useSelector(state => state.data);
  const [deleteKey, setDeleteKey] = useState(null);
  const ws = useRef(null);

  //for buying refill
  const buyRefill = () => {
    navigation.navigate(routes.PAYMENT_PROCESSING_REFILL);
    setBuyRefillPressed(true)
    setRefillModalVisible(false);
  }
  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    chatDataRef.current = ChatData;
    if(User.chances<=0 && User.Gender=='Male'){
     UpdateTimestamp()
      setRefillModalVisible(true);
    } 
  }, [ChatData]);

  //upadte the timestamp
  const UpdateTimestamp = async () => {
    try {
      const currentTimestamp = new Date().getTime();
      
      const formattedTimestamp = format(
        currentTimestamp,
        'yyyy-MM-dd HH:mm:ss',
      );
      console.log("formattedTimestamp",formattedTimestamp)
     await axios.post(
        `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.CHANCES}`,
        {
          chances: User.chances,
          email: User.Email,
          timestamp: formattedTimestamp,
        },
      );}
      catch(e){
        console.log(e)
      } 
    }
  //Hnadle delete chat tab
  const onYes = () => {
    setModalChatDeleteVisible(false);
    handleDeleteChatTab(deleteKey);
  };

  const onNo = () => {
    setModalChatDeleteVisible(false);
  };
 //sending the typing event
 useEffect(()=>{
  if (ws.current && ws.current.readyState === WebSocket.OPEN) {

    ws.current.send(JSON.stringify({event:'typing',receiverId:ChatData[CurrentChatTab].receiverId, userId: userId}));
  } else {
    console.log('WebSocket is not open');
  }
 },[debouncedSearchTerm])
  // Create a function to handle inserts
  const handleInserts = payload => {
  
    setIsLocked(true);
    const latestChatData = chatDataRef.current;

    const senderId = payload.sender_id;
    const receiverId = payload.receiver_id;
    if (receiverId == userId) {
      // check if senderId is in chatData
      if (
        Object.values(latestChatData).some(
          chatTab => chatTab.receiverId == senderId,
        )
      ) {
        // set new Message in chatData
        let tempChatData = {...latestChatData};
        let chatTabKey = Object.keys(tempChatData).find(
          key => tempChatData[key].receiverId == senderId,
        );
        tempChatData[chatTabKey] = {
          ...tempChatData[chatTabKey],
          messages: [
            ...tempChatData[chatTabKey].messages,
            {
              text: payload.message,
              belongs_to: false,
              messageId: payload.messageId,
              reply_msg_id: payload.reply_msg_id,
            },
          ],
          unseenMessages:
            CurrentChatTab === chatTabKey
              ? 0
              : tempChatData[chatTabKey].unseenMessages + 1,
        };
        dispatch(setChatData(tempChatData));
      }
    }
    setIsLocked(false);
  };

  useEffect(() => {
    while (isLocked);
    try {
  
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const messageData = {
          event: 'insert',
          sender_id: userId,
          receiver_id: ChatData[CurrentChatTab]?.receiverId,
          message: NewMessageText,
          messageId: ChatData[CurrentChatTab].messages.at(-1).messageId,
          created_at: new Date(),
          reply_msg_id: ReplyIndex,
        };
        ws.current.send(JSON.stringify(messageData));
      } else {
        console.log('WebSocket is not open');
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }, [NewMessageText]);
  // Create a function to handle deletes
  const handleDeletes = payload => {
    const latestChatData = chatDataRef.current;

    const user1 = payload.event=='deleteAll'? userId: payload.userId;
    const user2 = payload.receiverId;

    if (user1 == userId || user2 == userId) {
      // if user1 == userId, then find user2 as receiverId in chatData and if user2 == userId, then find user1 as receiverId in chatData
      let chatTabKey = Object.keys(latestChatData).find(
        key =>
          latestChatData[key].receiverId == (user1 == userId ? user2 : user1),
      );

      if (chatTabKey !== undefined) {
        if (chatTabKey == CurrentChatTab) {
          setModalVisible(false);
        }
        let tempChatData = {...latestChatData};

        // set receivedId to null and messages to empty array
        tempChatData[chatTabKey] = {
          receiverId: null,
          messages: [],
          unseenMessages: 0,
          requestId: uuid.v4(),
          typing: false,
        };

        dispatch(setChatData(tempChatData));
        console.log(
          'chat is deleted with user1: ',
          user1,
          ' and user2: ',
          user2,
        );
      }
    }
  };

  const removeUsersFunc = async (userId, connectedUserIds) => {
    try {
      const response = await removeUsers({
        userId: userId,
        connectedUserIds: connectedUserIds,
      });

      if (response.status !== 200) {
        ToastAndroid.show('Error disconnecting chats', ToastAndroid.SHORT);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleBack = async (payload) => {
    if(payload=="back"){
      ws.current.close();
    }
    setConfirmationPopupLoading(true);
    removeUsersFunc(
      userId,
      Object.keys(ChatData).map(key => ChatData[key].receiverId),
    );
    setConfirmationPopupLoading(false);
    setConfirmationPopupVisible(false);
    navigation.goBack();
  };

  const handleBlocked = payload => {
    dispatch(setIsBlocked(true));
    handleBack("block");
  };
  const pingServer = async () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageData = {
        event: 'heartbeat',
        userId: userId
      };
      ws.current.send(JSON.stringify(messageData));
    }
  };

  useEffect(() => {
    console.log("cfj")
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        BackgroundTimer.runBackgroundTimer(() => {
          pingServer();
        }, HEARTBEAT_TIMER);
        //rest of code will be performing for iOS on background too
      } else {
        BackgroundTimer.stopBackgroundTimer();
      }
    });

    let interval = null;
    if (userId !== null) {
      ws.current = new WebSocket('wss://king-prawn-app-xjfwg.ondigitalocean.app');
      ws.current.onopen = () => {
        console.log('Connected to the server');
      };
      // Listen to inserts
      ws.current.onmessage = event => {
        const message = JSON.parse(event.data);
  
        if(message.event=='typing'){
        ReceivedTypingEvent(message)
        }
        else if (message.event == 'delete') {
          handleDeletes(message);
        } 
        else if(message.event=='deleteAll') {
          handleDeletes(message)
         
        }
        else if(message.event=='block'){
       
          if("ip: ",message.ip==IP){
            
                handleBlocked;
              }
        }
        else if(message.event!="online"){
          handleInserts(message);
         
        }
      };

      interval = setInterval(() => {
        pingServer();
      }, HEARTBEAT_TIMER);

  
    }
    function ReceivedTypingEvent(payload){ 
      const receiverId = payload.receiverId;
      const senderId = payload.userId;
      const latestChatData = chatDataRef.current;

      // find the chat tab from ChatData where userId is receiverId and senderId is receiverId
      // if found, set isTyping to true and after 1 second set it to false
      const chatTabKey = Object.keys(latestChatData).find(
        key =>
          userId == receiverId &&
          latestChatData[key].receiverId == senderId,
      );
      if (chatTabKey !== undefined) {
        let tempChatData = {...latestChatData};
        tempChatData[chatTabKey] = {
          ...tempChatData[chatTabKey],
          typing: true,
        };
        dispatch(setChatData(tempChatData));
        setTimeout(() => {
          const latestChatData = chatDataRef.current;
          let tempChatData = {...latestChatData};
          tempChatData[chatTabKey] = {
            ...tempChatData[chatTabKey],
            typing: false,
          };
          dispatch(setChatData(tempChatData));
        }, 1000);
      }}
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setConfirmationPopupVisible(true);
        return true;
      },
    );

    return () => {
      ws.current.close()
      // if (userId !== null) {
      //   supaClient.removeAllChannels();
      // }
      // ws.current.close();
      console.log('connection closed');
      backHandler.remove();
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const handleAddChatTab = () => {
    console.log('Chat tab added');
    if (Object.keys(ChatData).length >= MAX_CHAT_TAB_LIMIT) {
      ToastAndroid.show(
        `You can only have ${MAX_CHAT_TAB_LIMIT} chat tabs at a time`,
        ToastAndroid.SHORT,
      );
    } else {
      // find the maximum number in the keys and add 1 to it
      let newChatTab =
        Math.max(...Object.keys(ChatData).map(key => parseInt(key))) + 1;

      const latestChatData = chatDataRef.current;
      let tempChatData = {...latestChatData};
      tempChatData[newChatTab] = {
        messages: [],
        receiverId: null,
        unseenMessages: 0,
        requestId: uuid.v4(),
        typing: false,
      };
      dispatch(setChatData(tempChatData));
      dispatch(setCurrentChatTab(newChatTab));
    }
  };

  const handleDeleteChatTab = chatTabToDelete => {
    console.log("corssesssssss")
    const latestChatData = chatDataRef.current;
    let tempChatData = {...latestChatData};
    if (tempChatData[chatTabToDelete].receiverId !== null) {
      skipChat({userId: userId, receiverId: tempChatData[chatTabToDelete].receiverId});
    } else {
      console.log(tempChatData[chatTabToDelete]);
      removeRequest({
        userId,
        requestId: tempChatData[chatTabToDelete].requestId,
      });
    }

    delete tempChatData[chatTabToDelete];
    console.log(tempChatData);
    dispatch(setChatData(tempChatData));
    if (CurrentChatTab == chatTabToDelete) {
      dispatch(setCurrentChatTab(Object.keys(tempChatData)[0]));
    }
  };
  console.log(userId)
  const reportUserFunc = async reason => {
    // ws.current.send(JSON.stringify({
    //   event:'block',
    //   ip:IP
    // }))
    if (ChatData[CurrentChatTab].receiverId !== null) {
      closeModal();
      try {
        await reportUser({
          userId: userId,
          receiverId: ChatData[CurrentChatTab].receiverId,
          reason: reason,
        });
        skipChat({userId, receiverId: ChatData[CurrentChatTab].receiverId});
        ToastAndroid.show('Stranger has been reported', ToastAndroid.SHORT);
      } catch (e) {
        console.log(e);
        ToastAndroid.show('Stranger has been reported', ToastAndroid.SHORT);
      }
    }
  };

  const formatTabName = key => {
    if (CurrentChatTab == key) {
      return `@`;
    } else if (ChatData[key].receiverId == null) {
      return 'X';
    } else {
      return ChatData[key].unseenMessages;
    }
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#211F1F',
      }}>
                        <BannerAd
      unitId={adUnitId}
    
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
   
      <Modal
      animationType="slide"
      transparent={true}
      visible={ isRefillModalVisible}
     >
    
        <View
          style={{
            alignSelf:'center',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 28,
            width:310,
            height: 511,
             paddingHorizontal:20,
            alignItems:'center',
            backgroundColor: '#211F1F',
            marginTop: 150,
          }}>
     <View style={{}}> 
   <BuyRefill/>
     </View>
     {
        isBuyRefillPressed? <><Text style={{color:'white',fontSize:55,  marginTop:30,}}>-12+</Text>
        <Text style={{color:'white',fontSize:32,  marginTop:20,}}>$1</Text></>
        :
        <Text style={{color:'white',fontSize:21.3,  marginTop:30,}}>You used all the daily chat limit. Wait for 12 hours to refill</Text>

     }
    
      <TouchableOpacity
            onPress={()=>isBuyRefillPressed? setRefillModalVisible(false):buyRefill()}
            style={{
              backgroundColor: isBuyRefillPressed? "#051EFF": '#109A0D',
              marginTop:30,
              height: 50,
              width: 230,
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
             Buy Refill
            </Text>
          </TouchableOpacity>

      </View>
    </Modal> 
     
      <View
        style={{
          flexDirection: 'row',
        }}>
        <ScrollView
          style={{
            maxHeight: 70,
          }}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: 20,
            height: 60,
            gap: 10,
            paddingHorizontal: 20,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              height: 42,
              justifyContent: 'flex-start',
              borderBottomColor: '#051EFF',
              borderBottomWidth: 2,
            }}>
            {Object.keys(ChatData).map((key, index) => {
              return (

                <View
                  key={index}
                  style={{
                    backgroundColor: CurrentChatTab == key ? '#051EFF' : 'grey',
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    minWidth: 80,
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'space-between',

                    rowGap: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      // setTabKey(key);
                      dispatch(setCurrentChatTab(key));
                      const latestChatData = chatDataRef.current;
                      const chatData = {...latestChatData};
                      chatData[key] = {...chatData[key], unseenMessages: 0};
                      dispatch(setChatData(chatData));
                    }}
                    style={{
                      flex: 1,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}>
                      {formatTabName(key)}
                    </Text>
                  </TouchableOpacity>
                  {Object.keys(ChatData).length > 1 && (
                    <TouchableOpacity
                      style={{
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                      onPress={() => {
                        setDeleteKey(key);
                        setModalChatDeleteVisible(true);
                      }}>
                        
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                          alignSelf: 'center',
                        }}
                        source={require('../assets/images/cancel_icon.png')}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalChatDeleteVisible}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 22,
              }}>
              <View
                style={{
                  backgroundColor: '#343434',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'white',
                  padding: 25,
                  alignItems: 'center',
                  shadowColor: 'white',
                  width: 270,
                  elevation: 3,
                }}>
                <Text
                  style={{
                    marginBottom: 18,
                    textAlign: 'center',
                    color: 'white',

                    fontWeight: '500',
                  }}>
                  Do you want to close this tab?
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <Button color={'#051EFF'} title="No" onPress={onNo} />
                  <Button color={'#051EFF'} title="Yes" onPress={onYes} />
                </View>
              </View>
            </View>
          </Modal>
          <TouchableOpacity onPress={handleAddChatTab}>
            <Image
              style={{
                width: 36,
                height: 36,
                marginTop: 2,
                alignSelf: 'center',
              }}
              source={require('../assets/images/plus_icon.png')}
            />
          </TouchableOpacity>
        </ScrollView>
        {ChatData[CurrentChatTab].receiverId !== null && (
          <TouchableOpacity onPress={openModal}>
            <Image
              source={require('../assets/images/options_icon.png')}
              style={{
                width: 36,
                height: 40,
                resizeMode: 'contain',
                marginTop: 20,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      {
        isRefillModalVisible?
        <></>:
      
      Object.keys(ChatData).map((key, index) => {
        return (
          <View
            style={{
              display: CurrentChatTab == key ? 'flex' : 'none',
              flex: 1,
              backgroundColor: 'black',
              flexDirection: 'column',
            }}
            key={key}>
            <ChatScreen navigation={navigation} chatTab={key} userId={userId} isLocked={isLocked} />
          </View>
        );
      })}
      <ConfirmationPopup
        isVisible={confirmationPopupVisible}
        title={`Are you sure you want to exit the chat? all windows will be closed`}
        positiveLabel="YES"
        positiveCallback={()=>handleBack("back")}
        negativeLabel="NO"
        negativeCallback={() => {
          setConfirmationPopupVisible(false);
        }}
        popupLoader={confirmationPopupLoading}
      />
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 23.5,
              width: 260,
              backgroundColor: '#211F1F',
              marginTop: 100,
              paddingBottom: 30,
            }}>
            <Image
              source={require('../assets/images/report_popup.jpg')}
              style={{
                height: 204,
                width: 260,
                resizeMode: 'cover',
                borderTopLeftRadius: 23.5,
                borderTopRightRadius: 23.5,
              }}
            />
            <TouchableOpacity
              onPress={closeModal}
              style={{
                position: 'absolute',
                top: 10,
                right: 15,
              }}>
              <Text
                style={{
                  fontSize: 24,
                  color: '#051EFF',
                  fontWeight: 700,
                }}>
                X
              </Text>
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  position: 'absolute',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'white',
                  alignSelf: 'center',
                  top: -30,
                }}>
                Report User
              </Text>
              <View
                style={{
                  paddingHorizontal: 20,
                }}>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Spam User')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Spam User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Abusive')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 7,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Abusive
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reportUserFunc('Pornography')}
                  style={{
                    backgroundColor: '#051EFF',
                    height: 45,
                    paddingVertical: 10,
                    marginTop: 7,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Pornography
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
