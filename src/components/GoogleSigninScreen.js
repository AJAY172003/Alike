import {View, Text, TouchableOpacity, Button} from 'react-native';
import {useEffect} from 'react';
import Google from '../assets/images/google.svg';
import {useDispatch, useSelector} from 'react-redux';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {setUser} from '../redux/DataSlice';
import {GOOGLE_SIGIN_WEB_CLIENT_ID} from '../utils/creds';
import {checkAndCreateUser} from '../utils/SupaClient';
import {getSubscriptionStatus} from '../utils/api';

function GoogleSigninScreen() {
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
      checkAndCreateUser(userInfo.user.name, userInfo.user.email);
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

  return (
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
          <TouchableOpacity style={{width: '100%'}} onPress={signIn}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#051EFF',
                height: 50,
                borderRadius: 10,
                marginTop: 10,
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
        </>
      )}
    </View>
  );
}
export default GoogleSigninScreen;
