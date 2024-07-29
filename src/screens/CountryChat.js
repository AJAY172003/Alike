import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {routes} from '../constants/routes';
import {
  setChatData,
  setCurrentChatTab,
  setRequiredFilters,
} from '../redux/DataSlice';
import uuid from 'react-native-uuid';
import {getCountryChatInfo} from '../utils/api';

export const CountryChat = ({navigation}) => {
  const [userCountryStat, setUserCountryStat] = useState({});
  const [otherCountriesStat, setOtherCountriesStat] = useState([]);
  console.log(otherCountriesStat)
  const [isRequesting, setIsRequesting] = useState(true);
  const dispatch = useDispatch();
  const {User} = useSelector(state => state.data);
 console.log("ssssssssssstatas",userCountryStat.country)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const countriesStats = await getCountryChatInfo(User.Country);

        const userCountryStat = countriesStats.find(
          countryStat => countryStat.country === User.Country,
        );
        if (userCountryStat) {
          setUserCountryStat(userCountryStat);
        }

        const otherCountriesStat = countriesStats.filter(
          countryStat => countryStat.country !== User.Country,
        );

        // sort the countries by number of users
        otherCountriesStat.sort((a, b) => {
          return b.numUsers - a.numUsers;
        });
        setOtherCountriesStat(otherCountriesStat);
        setIsRequesting(false);
      } catch (error) {
        console.log('Error fetching data', error);
      }
    };

    if (isRequesting) {
      fetchData();
    }
  }, [isRequesting]);
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#211F1F',
        paddingVertical: 40,
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRequesting}
          onRefresh={() => {
            setIsRequesting(true);
          }}
        />
      }>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/images/back_icon.png')}
          style={{
            width: 90,
            height: 20,
          }}
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 40,
          fontWeight: 'bold',
          color: 'white',
          marginTop: 20,
        }}>
        {`COUNTRY \nCHAT`}
      </Text>


        {isRequesting ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            {Object.keys(userCountryStat).length === 0 &&
            otherCountriesStat.length === 0 ? (
              <>
                <Text
                  style={{
                    color: '#DFDFDF',
                    textAlign: 'center',
                    marginTop: 20,
                  }}>
                  {`No one is online right now`}
                </Text>
              </>
            ) : (
              <FlatList
                data={otherCountriesStat}
                keyExtractor={item => item.country}
                ListHeaderComponent={() => {
                  return (
                    <>
                      {Object.keys(userCountryStat).length != 0 ? (
                        <>
                          <View>
                            <Text
                              style={{
                                color: 'white',
                                fontSize: 15,
                                fontWeight: 500,
                              }}>
                              Join stranger in your country
                            </Text>
                          </View>
                          <TouchableOpacity
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
                                  country: userCountryStat.country,
                                  chatRoom: null,
                                  likes: [],
                                }),
                              );
                              navigation.navigate(routes.CHATMANAGER, {
                                userId: uuid.v4(),
                              });
                            }}
                            style={{
                              backgroundColor: '#051EFF',
                          
                              padding: 10,
                              marginTop: 10,
                              marginBottom: 25,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                              <View style={{width:220}}>
                            <Text
                              style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 24,
                              }}>
                              {userCountryStat.country}
                            </Text>
                            </View>
                            <Text
                              style={{
                                color: 'white',
                                fontWeight: 500,
                                fontSize: 16,
                                paddingTop: 5,
                              }}>
                              {`${userCountryStat.numUsers} online`}
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : null}
                      {otherCountriesStat.length != 0 ? (
                        <View>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 15,
                              fontWeight: 500,
                            }}>
                            Join stranger in other country
                          </Text>
                        </View>
                      ) : null}
                    </>
                  );
                }}
          
                renderItem={({item}) => (
                  <TouchableOpacity
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
                          country: item.country,
                          chatRoom: null,
                          likes: [],
                        }),
                      );
                      navigation.navigate(routes.CHATMANAGER, {
                        userId: uuid.v4(),
                      });
                    }}
                    style={{
                      backgroundColor: '#051EFF',
                    
                      padding: 10,
                      marginTop: 10,
                      flexDirection: 'row',
              
                      justifyContent: 'space-between',
                    }}>
                      <View style={{width:220}}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 24,
                      }}>
                      {item.country}
                    </Text>
                    </View>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 500,
                        fontSize: 16,
                        paddingTop: 5,
                      }}>
                      {`${item.numUsers} online`}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
      </View>

  );
};
