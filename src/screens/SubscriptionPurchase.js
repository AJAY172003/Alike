import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import {InAppPurchasePayments} from './InAppPurchase';
import {
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
} from 'react-native-iap';

const SubscriptionPurchase = () => {
  const SKU_IDs = 'litsub99';

  useEffect(() => {
    checkPurchaseInfo();
  }, []);
  const checkPurchaseInfo = async () => {
    try {
      await initConnection();
      console.log('Connection initialized');
      const sub = await getSubscriptions({skus: ['litsub99']}).then(result => {
        console.log('result of subscription', result[0].subscriptionOfferDetails);
      });

      const availablePurchases = await getAvailablePurchases().then(result => {
        console.log('result', result);
      });

      // Check if there are any active subscriptions
      // const hasActiveSubscription = availablePurchases.some(
      //   purchase => purchase.productId === SKU_IDs,
      // );
      // setShowAds(!hasActiveSubscription);
    } catch (error) {
      console.log(error);
      console.log('Error checking subscription status:', error);
      // setLoader(false);
    }
  };
  const makingPurchase = async () => {
    // setLoader(true);
    try {
      const paymentResult = await InAppPurchasePayments(SKU_IDs);
      if (paymentResult.success) {
        console.log("payment succesful",paymentResult)
        //Success call your required functions here.
      } else {
        console.log("payment failed")
      }
    } catch (error) {
      console.log('Payment error:', error);
    }
  };

  // ... existing rendering logic based on loading, error, or subscriptions
  return (
    <View style={{backgroundColor: 'white', width: '100%', display: 'flex'}}>
      <Button title="Purchase" onPress={() => makingPurchase()} />
    </View>
  );
};

export default SubscriptionPurchase;
