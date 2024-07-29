import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setChatData, setCurrentChatTab, setRequiredFilters } from "../redux/DataSlice";
import { routes } from "../constants/routes";
import uuid from 'react-native-uuid';
import { getCommonLikes } from "../utils/api";

export const CommonLikes = ({ route, navigation }) => {

    const [likes, setLikes] = useState([]);
    const [selectedLikes, setSelectedLikes] = useState([]);
    const [isRequesting, setIsRequesting] = useState(true);

    const dispatch = useDispatch();
    const { User } = useSelector(state => state.data);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const commonlikes = await getCommonLikes();
                setLikes(commonlikes);
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
                {`Common \nLikes`}
            </Text>
            <Text
                style={{
                    fontSize: 15,
                    color: 'white',
                    fontWeight: 500
                }}
            >
                {`Find people who like the same things you do, not just anyone randomly`}
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
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        columnGap: 5,
                                        minHeight: 100,
                                        backgroundColor: '#051EFF',
                                        marginTop: 10,
                                        paddingHorizontal: 15,
                                        paddingVertical: 10
                                    }}
                                >
                                    {selectedLikes.length == 0 ?
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontSize: 24,
                                                fontWeight: 700,
                                            }}
                                        >Add your interests<Text style={{fontSize:15,fontWeight:500}}>{`${'\n'}(Choose from below)`}</Text></Text>
                                        :
                                        <>
                                            {selectedLikes.map((like, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setSelectedLikes(selectedLikes.filter((item) => item !== like));
                                                            setLikes([...likes, like]);
                                                        }}
                                                        key={index}
                                                        style={{
                                                            backgroundColor: '#1A9CD9',
                                                            padding: 10,
                                                            marginTop: 5
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: 'white',
                                                                fontWeight: '700',
                                                                fontSize: 17
                                                            }}
                                                        >
                                                            {like}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                            }
                                        </>
                                    }
                                </View>
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
                                            chatRoom: null,
                                            likes: selectedLikes
                                        }));
                                        navigation.navigate(routes.CHATMANAGER, {
                                            userId: uuid.v4()
                                        });
                                    }}
                                    disabled={selectedLikes.length == 0}>
                                    <View
                                        style={{
                                            backgroundColor: selectedLikes.length == 0 ? '#212B7F' : '#051EFF',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginTop: 20,

                                            height: 55
                                        }}>
                                            <Text style={{alignSelf:'center',paddingLeft:15,color:'white',fontSize:20,fontWeight:'bold'}}>Start chat</Text>
                                        <Image
                                            source={require('../assets/images/arrow_icon.png')}
                                            style={{
                                                alignSelf: 'center',
                                                marginRight: 30,
                                                width: 50,
                                                height: 50
                                            }}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        columnGap: 5,
                                        marginTop: 40
                                    }}
                                >
                                    {likes.map((like, index) => {
                                        return (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSelectedLikes([...selectedLikes, like]);
                                                    setLikes(likes.filter((item) => item !== like));
                                                }}
                                                key={index}
                                                style={{
                                                    backgroundColor: '#051EFF',
                                                    padding: 10,
                                                    marginTop: 5
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontWeight: '700',
                                                        fontSize: 17
                                                    }}
                                                >
                                                    {like}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                    }
                                </View>
                            </View>
                        </>
                }
            </View>
        </ScrollView>
    )
}