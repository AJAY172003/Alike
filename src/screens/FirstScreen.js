import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image,Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Google from '../assets/images/google.svg';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {GOOGLE_SIGIN_WEB_CLIENT_ID} from '../utils/creds';
import {checkAndCreateUser} from '../utils/SupaClient';
import {getSubscriptionStatus} from '../utils/api';
import {
  setCountryFilter,
  setLanguageFilter,
  setSearchKey,
  setUser,
} from '../redux/DataSlice';
import { routes } from '../constants/routes';
import { SelectList } from 'react-native-dropdown-select-list';
import { StackActions } from '@react-navigation/native';
import axios from 'axios';

const genderData = [
  { key: '1', value: 'Female' },
  { key: '2', value: 'Male' },
];

function FirstScreen({ navigation }) {
  const[islogin,setisLogin]=useState(false);
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');
  const[email,setEmail]=useState('');
  const dispatch = useDispatch();
  const {User} = useSelector(state => state.data);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_SIGIN_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      console.log('userInfo', userInfo);
      // TODO: fetch subscription status from server and update the user state
      // const response = await getSubscriptionStatus({
      //   email: userInfo.user.email,
      // });
      // console.log('response', response);
      // let userData = {
      //   Email: userInfo.user.email,
      //   isLoggedIn: true,
      //   isPremium: response?.data?.premium_status,
      // };

      // if (!userData.isPremium) {
      //   userData = {
      //     ...userData,
      //     premiumSettings: {
      //       autoReconnect: false,
      //       autoMessage: '',
      //     },
      //   };
      // }

      // dispatch(setUser(userData));
      setEmail( userInfo.user.email)
      checkAndCreateUser(userInfo.user.name, userInfo.user.email);
      axios.post ('https://king-prawn-app-xjfwg.ondigitalocean.app/checkUserData', {
        email: userInfo.user.email
      }).then((response) => {
        const responseJSON=JSON.parse(JSON.stringify(response))
        //if user exists in mongo db
        if( responseJSON.data.message!=''){
        
 
          console.log("result",response.data.images)
          dispatch( setUser({
            imageData: responseJSON.data.images.length!=0? responseJSON.data.images:[{image:null,id:null},{image:null,id:null},{image:null,id:null},{image:null,id:null}],
            Email: userInfo.user.email,
            chances: responseJSON.data.message[0].chances,
            Name:  responseJSON.data.message[0].name,
            Country:  responseJSON.data.message[0].country,
            Gender:  responseJSON.data.message[0].gender,
            Language: responseJSON.data.message[0].language,
            isUserInfoFilled: true,
  
          }))
          navigation.dispatch(StackActions.replace(routes.HOMESCREEN, { params: {} }));
        }
        else setisLogin(true); 
      });
    
      console.log("reached")
      
      
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('play services not available or outdated');
      } else {
        console.log('error', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      dispatch(
        setUser({
          Email: '',
          isLoggedIn: false,
          isPremium: false,
          premiumSettings: {
            autoReconnect: false,
            autoMessage: '',
          },
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const { CountryFilter, LanguageFilter, SearchKey } = useSelector(
    state => state.data,
  );

  useEffect(() => {

    if (SearchKey == 'country' && CountryFilter !== null) {
      setCountry(CountryFilter);
      dispatch(setCountryFilter(null));
    } else if (SearchKey == 'language' && LanguageFilter !== null) {
      setLanguage(LanguageFilter);
      dispatch(setLanguageFilter(null));
    }
  }, [CountryFilter, LanguageFilter]);

  const Save = () => {
    axios.post ('https://king-prawn-app-xjfwg.ondigitalocean.app/saveUserData', {
      email: email,
      gender:gender,
      name:value,
      country:country,
      language:language
     
    }).then((response) => {
     console.log(response.data) 
    });
    const user = {
      chances:15,
      Email:email,
      Name: value,
      Country: country,
      Language: language,
      Gender: gender,
      isUserInfoFilled: true  
    };
    dispatch(setUser(user));
    navigation.dispatch(StackActions.replace(routes.HOMESCREEN, {params: {}}));
  };

  const [value, setValue] = useState('');
  console.log(value);
  const [isEmpty, setIsEmpty] = useState(true);
  useEffect(() => {
    if (
      country.length != 0 &&
      language.length != 0 &&
      gender.length != 0 &&
      value.length != 0
    )
      setIsEmpty(false);
    else setIsEmpty(true);
  }, [country, language, gender, value]);

  return (
    <View
     
      style={{
        backgroundColor: '#211F1F',
        height: '100%'
      }}>
       { islogin?
        
          
      <View
        style={{
          backgroundColor: '#211F1F',
          justifyContent: 'space-evenly',
          paddingHorizontal: 10
        }}>
        <Text
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 40,
            marginTop: 40
          }}>
          Tell us about yourself
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 18,
            fontWeight: 500,
            marginTop: 10,
            paddingRight: 30
          }}>
          Join a chat room and talk with strangers about certain things
        </Text>
        <View
          style={{
            paddingVertical: 20,
          }}>

          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 10,
              height: 55,
              fontWeight: '700',
              color: 'white',
              fontSize: 24,
              backgroundColor: '#051EFF',
            }}
            placeholder="Name"
            placeholderTextColor={'white'}
          />

          <SelectList
            setSelected={setGender}
            data={genderData}
            save="value"
            search={false}
            dropdownStyles={{ backgroundColor: '#212B7F', borderWidth: 0 }}
            dropdownTextStyles={{ color: 'white' }}

            boxStyles={{
              backgroundColor: '#051EFF',
              borderRadius: 0,
              height: 55,
              marginTop: 15,
              borderWidth: 0,
              paddingHorizontal: 10,
            }}
            inputStyles={{
              fontWeight: 700,
              color: 'white',
              fontSize: 24,
            }}
            placeholder={gender.length ? gender : 'Select Gender'}
          />
          <View>
            <TouchableOpacity
              onPress={() => {
                dispatch(setSearchKey('country'));
                navigation.navigate(routes.SEARCHLIST, {
                  title: 'Select Country',
                });
              }}>
              <TextInput
                placeholder="Select Country"
                placeholderTextColor={'white'}
                value={country}
                editable={false}
                style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: 24,
                  height: 55,
                  marginTop: 15,
                  backgroundColor: '#051EFF',
                  paddingHorizontal: 10,
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              dispatch(setSearchKey('language'));
              navigation.navigate(routes.SEARCHLIST, {
                title: 'Select Language',
              });
            }}>
            <TextInput
              placeholder="Select Language"
              placeholderTextColor={'white'}
              value={language}
              editable={false}
              style={{
                fontWeight: '700',
                color: 'white',
                height: 55,
                fontSize: 24,
                marginTop: 15,
                backgroundColor: '#051EFF',
                paddingHorizontal: 10,
              }}
            />
          </TouchableOpacity>
          {isEmpty ? (
            <View
              style={{
                backgroundColor: '#212B7F',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 55,
                height: 55
              }}>
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
          ) : (
            <TouchableOpacity onPress={Save}>
              <View
                style={{
                  backgroundColor: '#051EFF',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 20,
                  height: 55
                }}>
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
          )}
        </View>
      </View>:
  <View
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
  }}>
  {User.Email?.length > 0 ? (
    <>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 13,
          color: 'white',
          paddingTop: 10,
        }}>
        {User.Email}
      </Text>
      <View style={{marginTop: 10}}>
        <Button title="sign out" onPress={signOut}></Button>
      </View>
    </>
  ) : (
    <>
      {/* <Text
        style={{
          fontWeight: 500,
          fontSize: 14,
          color: 'white',
          marginTop: 10,
        }}>
        Login or sign up to restore your subscription
      </Text> */}
       
 
      <View style={{alignSelf:'center',alignItems:'center',
        borderRadius:10,borderWidth:1,borderColor:'white',width:'90%',padding:10,
        backgroundColor:'#000616'
      ,marginTop:50
      }}>

<Text style={{fontWeight:700,color:'white',fontSize:30,alignSelf:'flex-start',marginLeft:20,marginTop:20,marginBottom:20}}>Login or signup to account</Text>
    <Image source={require('../assets/images/alike.jpeg')} style={{width:300,height:400,alignSelf:'center',borderRadius:10}}/>
   
      <TouchableOpacity style={{width: '100%'}} onPress={signIn}>
        
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#051EFF',
            height: 50,
            width:270,
            alignSelf:'center' ,
            borderRadius: 10,
            marginTop: 10,
            marginBottom:20,
          }}>
          <Google width={30} height={30} />
          <Text
            style={{
              marginLeft: 10,
              color: 'white',
              fontWeight: 700,
              fontSize: 20,
            }}>
            Login/SignUp
          </Text>
        </View>
      </TouchableOpacity>
      </View>
    </>
  )}
</View>
}
</View>
  );
}
export default FirstScreen;
