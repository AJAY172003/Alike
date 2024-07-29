import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { routes } from "../constants/routes";
import { setChatData, setCurrentChatTab, setRequiredFilters } from "../redux/DataSlice";
import uuid from 'react-native-uuid';
import { getChatRooms } from "../utils/api";

export const ChatRoom = ({ route, navigation }) => {

    const [chatRoomsStats, setChatRoomsStats] = useState([]);
    const [isRequesting, setIsRequesting] = useState(true);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const chatRoomsData = await getChatRooms();

                // sort the chatrooms by number of users
                chatRoomsData.sort((a, b) => {
                    return b.numUsers - a.numUsers;
                });

                setChatRoomsStats(chatRoomsData);
                setIsRequesting(false);
            } catch (error) {
                console.log('Error fetching data', error);
            }
        }

        if (isRequesting) {
            fetchData();
        }
    }
        , [isRequesting]);
    return (
        <ScrollView
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#211F1F',
                paddingVertical: 40,
                paddingHorizontal: 20
            }}
            refreshControl={
                <RefreshControl
                    refreshing={isRequesting}
                    onRefresh={() => {
                        setIsRequesting(true);
                    }}
                />
            }
        >
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                    source={require('../assets/images/back_icon.png')}
                    style={{
                        width: 90,
                        height: 20
                    }}
                />
            </TouchableOpacity>
            <Text
                style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: 'white',
                    marginTop: 20
                }}
            >
                {`CHAT \nROOMS`}
            </Text>
            <Text
                style={{
                    fontSize: 15,
                    color: 'white',
                    fontWeight: 500
                }}
            >
                {`Join a chat room and talk with strangers about certain things`}
            </Text>

            <View
                style={{
                    marginTop: 15
                }}
            >
                {
                    isRequesting ?
                        <ActivityIndicator size='large' color='white' /> :
                        <>
                            {
                                chatRoomsStats.length === 0 ?
                                    <>
                                        <Text
                                            style={{
                                                textAlign: 'center',
                                                marginTop: 20
                                            }}
                                        >
                                            {`No one is online right now`}
                                        </Text>
                                    </>
                                    :

                                    <FlatList
                                        data={chatRoomsStats}
                                        keyExtractor={item => item.chatroom}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    dispatch(setCurrentChatTab(1));
                                                    dispatch(setChatData({
                                                        1: {
                                                            receiverId: null,
                                                            messages: [],
                                                            unseenMessages: 0,
                                                            requestId: uuid.v4(),
                                                            typing: false
                                                        }
                                                    }));
                                                    dispatch(setRequiredFilters({
                                                        country: null,
                                                        chatRoom: item.chatroom,
                                                        likes: []
                                                    }));
                                                    navigation.navigate(routes.CHATMANAGER, {
                                                        userId: uuid.v4()
                                                    });
                                                }}
                                                style={{
                                                    backgroundColor: '#051EFF',
                                                    height: 55,
                                                    padding: 10,
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: 24
                                                    }}
                                                >
                                                    {item.chatroom}
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontWeight: 500,
                                                        fontSize: 16,
                                                        paddingTop: 5
                                                    }}
                                                >
                                                    {`${item.numUsers} online`}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                            }
                        </>
                }
            </View>
        </ScrollView>
    )
}