import { useEffect } from 'react';
import {
    getProducts,
    initConnection,
    requestSubscription,
    useIAP,
    getSubscriptions,
    purchaseUpdatedListener,
    purchaseErrorListener,
    finishTransaction,
    requestPurchase
  } from 'react-native-iap';

  export const InAppPurchasePayments = async productId => {
    await makeConnection(productId);
    let paymentMethodCall = await handlePayment(productId);
    return paymentMethodCall;
  };
  
  const makeConnection = async myProductId => {
    await initConnection();
    const result=await getProducts({skus: [myProductId]});
    console.log("result",result)
    // await getSubscriptions({skus: [myProductId]});
  };
  
  const handlePayment = async myProductId => {
    // const subscriptions = await getSubscriptions({skus: [myProductId]});
    let desiredOfferToken;
  
    // if (
    //   subscriptions &&
    //   subscriptions.length > 0 &&
    //   subscriptions[0]?.subscriptionOfferDetails &&
    //   subscriptions[0].subscriptionOfferDetails.length > 0
    // ) {
    //   desiredOfferToken =
    //     subscriptions[0].subscriptionOfferDetails[0]?.offerToken || 'offerToken';
    // } else {
    //   desiredOfferToken = 'offerToken';
    // }
    if(myProductId == 'alike2'){
      console.log("reces",myProductId)
      try {
      
    
        let purchase = await requestPurchase({
          
         skus: [myProductId]
        });
    
        console.log("purchse",purchase);
        return purchase;
      } catch (err) {
        console.log("errro",err); // handle the error appropriately
      }
    }
    else{
    let payment = await requestSubscription({
      sku: myProductId,
      ...(desiredOfferToken && {
        subscriptionOffers: [
          {
            sku: myProductId,
            offerToken: desiredOfferToken,
          },
        ],
      }),
    })
      .then(async requestSubscriptionIAP => {
        if (
          requestSubscriptionIAP &&
          (requestSubscriptionIAP[0]?.transactionReceipt ||
            requestSubscriptionIAP?.transactionReceipt)
        ) {
          return {
            detail: requestSubscriptionIAP,
            success: true,
          };
        } else {
          return {
            detail: requestSubscriptionIAP,
            success: false,
          };
        }
      })
      .catch(error => {
        return error;
      });

   console.log('payment',payment)
    return payment;
  }

  };
  export default InAppPurchase = () => {
    
    useEffect(() => {
      const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        console.log('purchaseUpdatedListener', purchase);
        try {
         const re= await finishTransaction({
            purchase:purchase,
            isConsumable: true,
            
          });
          console.log("re",re)
        } catch (err) {
          console.warn('Error handling purchase', err);
        }
      });
  
      const purchaseErrorSubscription = purchaseErrorListener((error) => {
        console.warn('purchaseErrorListener', error);
      });
  
      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
      };
    }, []);
  
    return (
      <></> // Your app's main component code
    );
  };