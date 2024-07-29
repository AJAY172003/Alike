import React, {useEffect, useRef, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import PlusIcon from '../assets/images/plusIcon.svg';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  ToastAndroid,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Profile from '../assets/images/profile.svg';
import {
  setCountryFilter,
  setLanguageFilter,
  setSearchKey,
  setUser,
} from '../redux/DataSlice';
import {routes} from '../constants/routes';
import {SelectList} from 'react-native-dropdown-select-list';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import { set } from 'mongoose';

const genderData = [
  {key: '1', value: 'Female'},
  {key: '2', value: 'Male'},
];

function Settings({navigation}) {
  //   useFocusEffect(
  //     React.useCallback(() => {
  //       const onBlur = () => {
  // uploadImage();
  //       };

  //       // Return a function to clean up
  //       return () => {
  //         onBlur();
  //       };
  //     }, [])
  //   );
  const {CountryFilter, LanguageFilter, SearchKey, User} = useSelector(
    state => state.data,
  );
  const scrollViewRef = useRef();
  const scrollToTop = () => {
    ToastAndroid.show('Login first to buy Premium ', ToastAndroid.SHORT);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 0, animated: true});
    }
  };
  const[email,setEmail]=useState(User.Email);
  const [country, setCountry] = useState(User.Country);
  const [language, setLanguage] = useState(User.Language);
  const [gender, setGender] = useState(User.Gender);
  const [left, setLeft] = useState(!User.premiumSettings.autoReconnect);
  const [slideAnim, setSlideAnim] = useState(new Animated.Value(0));
  const [isOn, setIsOn] = useState(User.premiumSettings.autoReconnect);
  const [message, setMessage] = useState(User.premiumSettings.autoMessage);
  const [value, setValue] = useState(User.Name);
  const imageUri =useRef([]) 
  const [singleImageData, setSingleImageData] = useState(null);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const dispatch = useDispatch();
  const  uploadImage = async (uri,id,number,image) => {
    const data = new FormData();
    console.log("in request")
    data.append('fileData', {
      uri: uri,
      type: 'image/jpeg',
      name: 'image.jpeg',
    });
    data.append('userId', email);
    
    data.append('id', id);


//  console.log("data",  data._parts[2])
    try {
      console.log("ssssssssssssssssssssssssssssssssssss")
      const response = await axios.post(
        'http://192.168.1.6:8000/upload',
        data,
  
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },

        },
      );
      
      imageUri.current= imageUri.current.map((item, index) =>
          index == number
            ? {image: image, id: response.data.id}
            : item,
        );
        
        dispatch(setUser({imageData: imageUri.current}));
     
      // dispatch(setUser(imageUri));
      console.log('Image uploaded successfully: ', response.data.id);
    } catch (error) {
      console.error('Error uploading images: ', error);
    }
  };
  useEffect(() => {
    setEmail(User.Email);
    imageUri.current=([
      {image: null, id: null},
      {image: null, id: null},
      {image: null, id: null},
      {image: null, id: null},
    ]);
    console.log(imageUri.current);
   
    // if (User.imageData != null) {
    //   User.imageData.map((item, index) => {
    //     if (index == 0 && User.imageData[0].image != null) setImage1(true);
    //     if (index == 1 && User.imageData[1].image != null) setImage2(true);
    //     if (index == 2 && User.imageData[2].image != null) setImage3(true);
    //     if (index == 3 && User.imageData[3].image != null) setImage4(true);
    //   });
    //   if (User.imageData.length == 1) {
    //     setImageUri([
    //       {image: User.imageData[0].image, id: User.imageData[0].id},
    //       {image: null, id: null},
    //       {image: null, id: null},
    //       {image: null, id: null},
    //     ]);
    //   } else if (User.imageData.length == 2) {
    //     setImageUri([
    //       {image: User.imageData[0].image, id: User.imageData[0].id},
    //       {image: User.imageData[1].image, id: User.imageData[1].id},
    //       {image: null, id: null},
    //       {image: null, id: null},
    //     ]);
    //   } else if (User.imageData.length == 3) {
    //     setImageUri([
    //       {image: User.imageData[0].image, id: User.imageData[0].id},
    //       {image: User.imageData[1].image, id: User.imageData[1].id},
    //       {image: User.imageData[2].image, id: User.imageData[2].id},
    //       {image: null, id: null},
    //     ]);
    //   } else if (User.imageData.length == 4) {
    //     setImageUri([
    //       {image: User.imageData[0].image, id: User.imageData[0].id},
    //       {image: User.imageData[1].image, id: User.imageData[1].id},
    //       {image: User.imageData[2].image, id: User.imageData[2].id},
    //       {image: User.imageData[3].image, id: User.imageData[3].id},
    //     ]);
    //   }
    // }
    // console.log('imageuri', User.imageData);
  }, []);
  // useEffect(() => {
  //   console.log("raeched");
  //   // console.log("imageuri",imageUri[singleImageData.number].id);
  //     dispatch(setUser({imageData: imageUri.current}));
    
  // }, [imageUri]);
  // useEffect(() => {
  //   if (singleImageData != null) {
  //  uploadImage()
   
  //   }
  // }, [singleImageData]);
  const selectImage = number => {
    launchImageLibrary({mediaType: 'photo', includeBase64: true}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const asset = response.assets[0];
      console.log("imageuri",imageUri.current[number].id);
        if ( imageUri.current[number].id!= null && imageUri.current[number] != undefined) {
          uploadImage(asset.uri,imageUri.current[number].id,number,asset.base64)
         
            setSingleImageData({
              uri: asset.uri,
              id: [imageUri.current[number].id],
              number: number,
              image: asset.base64,
            });
   
        } 
        else {
          uploadImage(asset.uri,imageUri.current[number].id,number,asset.base64)
          
          setSingleImageData({
            uri: asset.uri,
            id:null,
            number: number,
            image: asset.base64,
          });
          // setSingleImageData({uri: asset.uri, id: null, number: number, image: asset.base64});
        }
        // imageUri.current=
        //    imageUri.current.map((item, index) =>
        //     index == number ? {image: asset.base64} : item,
        //   );
       
      console.log("below the singldata")
  
        if (number == 0) setImage1(true);
        if (number == 1) setImage2(true);
        if (number == 2) setImage3(true);
        if (number == 3) setImage4(true);

      }
    });
   
  };
  useEffect(() => {
    if (SearchKey == 'country' && CountryFilter !== null) {
      setCountry(CountryFilter);
      dispatch(setCountryFilter(null));
    } else if (SearchKey == 'language' && LanguageFilter !== null) {
      setLanguage(LanguageFilter);
      dispatch(setLanguageFilter(null));
    }
  }, [CountryFilter, LanguageFilter]);

  useEffect(() => {
    const user = {
      Country: country,
      Name: value,
      Language: language,
      Gender: gender,
      premiumSettings: {
        autoReconnect: isOn,
        autoMessage: message.trim(),
      },
    };
    dispatch(setUser(user));
  }, [country, language, gender, value, isOn, message]);

  const slideBox = () => {
    if (User.isPremium) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsOn(!isOn);
      setTimeout(() => {
        setLeft(!left);

        setSlideAnim(new Animated.Value(0));
      }, 300);
    } else ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT);
  };

  const slideFromLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });
  const slideFromRight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const onTextPress = () => {
    if (!User.isPremium)
      ToastAndroid.show('Upgrade to Premium First', ToastAndroid.SHORT);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
      contentContainerStyle={{
        paddingBottom: 30,
      }}
      style={{
        height: '100%',
        backgroundColor: '#211F1F',
        paddingHorizontal: 20,
      }}>
      <TouchableOpacity
        style={{
          marginTop: 20,
        }}
        onPress={() => navigation.goBack()}>
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
          fontWeight: '700',
          color: 'white',
          marginTop: 10,
        }}>
        Setting
      </Text>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <View
          style={{flexDirection: 'row', gap: 17, width: 300, marginTop: 17}}>
          <TouchableOpacity
            onPress={() => {
              selectImage(0);
            }}>
            {image1 ? (
              <Image
                source={{uri: `data:image/jpeg;base64,${imageUri.current[0].image}`}}
                style={{
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: 'white',
                  width: 90,
                  height: 140,
                }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 140,
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <PlusIcon />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              selectImage(1);
            }}>
            {image2 ? (
              <Image
                source={{uri: `data:image/jpeg;base64,${imageUri.current[1].image}`}}
                style={{
                  borderRadius: 5,

                  borderWidth: 1,
                  borderColor: 'white',
                  width: 90,
                  height: 140,
                }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 140,
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <PlusIcon />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              selectImage(2);
            }}>
            {image3 ? (
              <Image
                source={{uri: `data:image/jpeg;base64,${imageUri.current[2].image}`}}
                style={{
                  borderRadius: 5,

                  borderWidth: 1,
                  borderColor: 'white',
                  width: 90,
                  height: 140,
                }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 140,
                  borderWidth: 1,
                  borderColor: 'white',
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <PlusIcon />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{alignSelf: 'flex-start', marginTop: 17, marginLeft: 10}}
          onPress={() => {
            selectImage(3);
          }}>
          {image4 ? (
            <Image
              source={{uri: `data:image/jpeg;base64,${imageUri.current[3].image}`}}
              style={{
                borderRadius: 5,

                borderWidth: 1,
                borderColor: 'white',
                width: 90,
                height: 140,
              }}
            />
          ) : (
            <View
              style={{
                width: 90,
                height: 140,
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 7,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <PlusIcon />
            </View>
          )}
        </TouchableOpacity>
        {/* <View
          style={{
            borderWidth: 4,
            borderColor: 'white',
            width: 70,
            height: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginTop: 20,
            borderRadius: 35,
          }}>
          <Profile />
        </View>
        <GoogleSigninScreen /> */}
        <View
          style={{
            marginTop: 30,
            width: '100%',
          }}>
          <TextInput
            onChangeText={setValue}
            value={value}
            style={{
              padding: 10,
              fontWeight: '700',
              color: 'white',
              height: 50,
              fontSize: 20,
              backgroundColor: '#051EFF',
            }}
            placeholder="Name"
            placeholderTextColor={'white'}
          />

          <SelectList
            setSelected={setGender}
            data={genderData}
            save="value"
            dropdownStyles={{backgroundColor: '#212B7F', borderWidth: 0}}
            dropdownTextStyles={{color: 'white'}}
            search={false}
            maxHeight={120}
            boxStyles={{
              backgroundColor: '#051EFF',
              borderRadius: 0,
              marginTop: 15,
              height: 50,
              borderWidth: 0,
              paddingHorizontal: 10,
            }}
            inputStyles={{
              fontWeight: 700,
              color: 'white',
              fontSize: 20,
              margin: 0,
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
                  fontSize: 20,
                  height: 50,
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
                fontSize: 20,
                height: 50,
                marginTop: 15,
                backgroundColor: '#051EFF',
                paddingHorizontal: 10,
              }}
            />
          </TouchableOpacity>
          {/* <View
            style={{
              backgroundColor: '#051EFF',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: 10,
              marginTop: 20,
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
              {`Your message ${User.isPremium ? '' : '(Premium feature)'}`}
            </Text>
            <TextInput
              style={{fontSize: 14}}
              placeholderTextColor={'white'}
              onPress={onTextPress}
              editable={User.isPremium}
              multiline={true}
              value={message}
              onChangeText={setMessage}
              placeholder={`Automatic message when you connect with ${'\n'}strangers`}></TextInput>
          </View> */}
          {/* <View
            style={{
              backgroundColor: '#051EFF',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              marginTop: 20,
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
              Automatic Reconnect
            </Text>
            <View style={styles.outerBox}>
              <TouchableOpacity onPress={slideBox}>
                <Animated.View
                  style={[
                    styles.innerBox,
                    {
                      transform: [
                        {translateX: left ? slideFromLeft : slideFromRight},
                      ],
                    },
                  ]}>
                  <Text
                    style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                    {isOn ? 'ON' : 'OFF'}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View> */}
          {/* <TouchableOpacity
            color="white"
            onPress={() =>
              User.Email && User.Email.length
                ? navigation.navigate(routes.PAYMENT_PROCESSING)
                : scrollToTop()
            }
            disabled={User.isPremium}>
            <View
              style={{
                backgroundColor: '#051EFF',
                display: 'flex',
                justifyContent: 'flex-start',
                paddingHorizontal: 10,
                marginTop: 50,
                paddingVertical: 15,
              }}>
              <Text style={{color: 'white', fontWeight: 700, fontSize: 24}}>
                Subscription
              </Text>
              <Text
                style={{
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 900,
                  lineHeight: 40,
                  marginTop: 20,
                }}>
                {`Get pro and only\nconnect with\nfemales`}
              </Text>
              <View style={{marginTop: 20, marginBottom: 10}}>
                <Text style={{fontWeight: 700, color: 'white', fontSize: 24}}>
                  Benefits
                </Text>
                <View style={{justifyContent: 'space-around', height: 100}}>
                  <Text style={{color: 'white', fontSize: 15, fontWeight: 700}}>
                    1. Only connect with female strangers
                  </Text>
                  <Text style={{color: 'white', fontSize: 15, fontWeight: 700}}>
                    2. Automatic reconnect with new strangers
                  </Text>
                  <Text style={{color: 'white', fontSize: 15, fontWeight: 700}}>
                    3. Automatic first message to strangers
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: 30,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>
                  {User.isPremium ? 'Subscription active' : '$99/Month'}
                </Text>
                {!User.isPremium ? (
                  <Image
                    source={require('../assets/images/back_icon.png')}
                    style={{
                      width: 90,
                      height: 20,
                      marginRight: 20,
                    }}
                    transform={[{rotate: '180deg'}]}
                  />
                ) : null}
              </View>
              <View style={{alignItems: 'center', marginTop: 30}}>
                <Text
                  style={{
                    alignItems: 'flex-start',
                    fontSize: 12,
                    color: 'white',
                  }}>
                  If you don’t cancel the product with an automatic renewal
                  subscription, the paid regular payment will be automatically
                  renewed every month. if you don’t want to make a paid regular
                  payment, you can cancel the subscription at any time on the
                  google play store. For more information on how to cancel the
                  subscription, please refer to the frequently ask questions on
                  google.
                </Text>
              </View>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </ScrollView>
  );
}
export default Settings;
const styles = StyleSheet.create({
  outerBox: {
    width: 70,
    height: 35,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'center',
  },
  innerBox: {
    width: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    backgroundColor: '#1BA1E0',
  },
});
