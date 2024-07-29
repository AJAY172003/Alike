import {ActivityIndicator, ImageBackground} from 'react-native';
import {getData} from '../utils/storage';
import {
  setIP,
  setInfoPopupSeen,
  setIsBlocked,
  setNumUserOnline,
  setReports,
  setUser,
  setappOpenNumber,
} from '../redux/DataSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {routes} from '../constants/routes';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import publicIP from 'react-native-public-ip';
import {StackActions} from '@react-navigation/native';
import {
  getOnlineUsers,
  getSubscriptionStatus,
  getUserDailyReports,
} from '../utils/api';
import {GOOGLE_SIGIN_WEB_CLIENT_ID} from '../utils/creds';

const MAX_REPORTS = 10;
export const WelcomeScreen = ({navigation}) => {
  const [hasDataLoaded, setHasDataLoaded] = useState(null);
  const dispatch = useDispatch();

  const {User} = useSelector(state => state.data);

  const issignIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      return getSignedInUserEmail();
    }
    return null;
  };

  const getSignedInUserEmail = async () => {
    let email = null;
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      email = userInfo.user.email;
    } catch (error) {}
    return email;
  };

  const getUserOnlineNumber = async () => {
    await getOnlineUsers().then(data => {
      dispatch(setNumUserOnline(data));
    });
  };

  const doBasicSetup = async () => {
   
    let ipRes = '';
    try {
      ipRes = await publicIP();
    } catch (e) {
      console.log('error in getting ip: ', e);
    }

    if (ipRes.length) {
      dispatch(setIP(ipRes));
    
      const {reports, isBlocked} = await getUserDailyReports(ipRes);
      console.log("reached")
      dispatch(setReports(Math.min(reports.length, MAX_REPORTS)));
      // console.log("isBlocked: ", isBlocked);
      dispatch(setIsBlocked(isBlocked));
    }

    await getUserOnlineNumber();
  };

  useEffect(() => {
    getData('appOpenNumber').then(data => {
      if (data == null) {
        dispatch(setappOpenNumber(1));
      } else {
        dispatch(setappOpenNumber(data + 1));
      }
    });
    getData('user').then(async data => {
      if (data != null) {
        await doBasicSetup();

        GoogleSignin.configure({
          webClientId: GOOGLE_SIGIN_WEB_CLIENT_ID,
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
        // const email = await issignIn();
        // if (email != null) {

        //   // TODO: check if subscription for user with email is active from payment server
        //   // update premium status accordingly
        //   const response = await getSubscriptionStatus({email});

        //   data = { ...data, Email: email, isPremium: response?.data?.premium_status };
        // }

        // if (!data.isPremium) {
        //   data = {
        //     ...data, premiumSettings: {
        //       autoReconnect: false,
        //       autoMessage: ""
        //     }
        //   };
        // }

        dispatch(setUser(data));
        setHasDataLoaded(true);
      } else {
        await doBasicSetup();
        setHasDataLoaded(true);
      }
    });
    getData('infoPopupSeen').then(data => {
      dispatch(setInfoPopupSeen(data == null || data == false ? false : true));
    });
  }, []);

  useEffect(() => {
    if (hasDataLoaded) {
      if (User.isUserInfoFilled) {
        navigation.dispatch(
          StackActions.replace(routes.HOMESCREEN, {params: {}}),
        );
      } else {
        navigation.dispatch(
          StackActions.replace(routes.FIRSTSCREEN, {params: {}}),
        );
      }
    }
  }, [hasDataLoaded]);
  return (
    <ImageBackground
      style={{
        height: '100%',
        width: '100%',
      }}
      source={require('../assets/images/logo.png')}
      resizeMode="stretch">
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        size="large"
        color="#0000ff"
      />
    </ImageBackground>
  );
};
