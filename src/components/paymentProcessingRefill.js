import {useEffect, useRef, useState} from 'react';
import { InAppPurchasePayments } from '../screens/InAppPurchase';
import {initConnection} from 'react-native-iap';
import axios from 'axios';
import {ActivityIndicator, View, Text, ToastAndroid, Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {routes} from '../constants/routes';
import {setUser} from '../redux/DataSlice';
import {supaClient} from '../utils/SupaClient';
import {baseMatchingUrls, currentMatchingSystem, matchingUrls, verifyPayment} from '../utils/api';
import InAppPurchase from '../screens/InAppPurchase';
function PaymentProcessingRefill({navigation}) {
  const {User} = useSelector(state => state.data);
  const SKU_IDs = 'alike2';
  const purchaseTokenRef = useRef(null);
  const subIdRef = useRef(null);
  const [transactionFailed, setTransactionFailed] = useState(false);
  // console.log(`${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.CHANCES}`);
  const dispatch = useDispatch();

  useEffect(() => {
    InitializeConnection();
    makingPurchase();
    const channelA = supaClient.channel('payment');

    // Subscribe to the Channel
    try{
    channelA
      .on('broadcast', {event: 'sendpaymentinfo'}, payload => {
        console.log("innnn")
        VerifyPurchaseToken(payload.payload.purchaseToken);
      })
      .subscribe();}
      catch(e){
        console.log(e)
      } 
    console.log('started the supa listener on channel A');

    return () => {
      channelA.unsubscribe();
    };
  }, []);

  async function VerifyPurchaseToken(ReceivedTokenFromServer) {
    console.log('this is the UI purchase token: ', purchaseTokenRef.current);
    if (purchaseTokenRef.current == ReceivedTokenFromServer) {
      console.log(
        'Purchased token matched with server token and sub id is: ',
        subIdRef.current,
      );
     console.log(User.Email)
      verifyPayment({
        
        purchaseToken: purchaseTokenRef.current,
        email: User.Email,
        subId: "alike2",
      })
        .then(async function (response) {
          // TODO: handle other status codes too in future
   console.log("succesfully purchased")
          // dispatch(setUser({...User, isPremium: true}));
          ToastAndroid.show('Succesfully purchased chances', ToastAndroid.LONG);
         
          await axios.post(`${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.CHANCES}`, {
            email: User.Email,
            chances: User.chances+15,
          });
          dispatch(setUser({chances: User.chances+15}))
          navigation.navigate(routes.HOMESCREEN);
        })
        .catch(function (error) {
          console.log('transaction failed');
          setTransactionFailed(true);
          console.log(error);
        });
    } else {
      console.log('wrong purchase token received');
    }
  }

  const makingPurchase = async () => {
    try {
      const paymentResult = await InAppPurchasePayments(SKU_IDs);
      console.log('initiating payment.....',paymentResult);
      if (paymentResult) {
        console.log(
          'payment successful',
          paymentResult[0].purchaseToken,
        );
        purchaseTokenRef.current = paymentResult[0].purchaseToken;
        subIdRef.current = paymentResult[0].productId;
        console.log('this is the sub id', paymentResult[0].productId);
      } else {
        console.log('payment failed');
        // navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();
      console.log('Payment error:', error);
    }
  };

  const InitializeConnection = async () => {
    try {
      await initConnection();
      console.log('Connection initialized');
    } catch (error) {
      console.log('Error checking subscription status:', error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#211F1F',
        width: '100%',
        justifyContent: 'center',
        display: 'flex',
        height: '100%',
      }}>
      <InAppPurchase/>
      {!transactionFailed ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={{color: 'white', fontSize: 20, fontWeight: 500}}>
            Processing Payment
          </Text>
          <Text style={{color: 'white', fontSize: 15, fontWeight: 500}}>
            Do not press back or close the app
          </Text>
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
          <Image
            source={require('../assets/images/exclamation_icon.png')}
            style={{
              width: 70,
              height: 70,
              alignSelf: 'center',
            }}
          />
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 500,
              marginTop: 10,
            }}>
            Payment Verification Failed
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              marginTop: 10,
            }}>
            We are unable to verify your payment. Your payment will be refunded
            in 3-5 business days. If you have any queries, please contact our
            support team.
          </Text>
        </View>
      )}
    </View>
  );
}
export default PaymentProcessingRefill;
