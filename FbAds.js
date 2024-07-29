import React from 'react';
import { View, Text } from 'react-native';
import { NativeAdsManager, withNativeAd, AdIconView, MediaView, AdChoicesView, TriggerableView } from 'react-native-fbads';

// Step 1: Initialize the Native Ads Manager
const placementId = 'audience_network'; // Replace with your actual placement ID
const numberOfAdsToRequest = 5; // Number of ads to request
const adsManager = new NativeAdsManager(placementId, numberOfAdsToRequest);

// Step 2: Create an Ad Component
class AdComponent extends React.Component {
  render() {
    const { nativeAd } = this.props;
    return (
      <View>
        <AdChoicesView style={{ position: 'absolute', left: 0, top: 0 }} />
        <AdIconView style={{ width: 50, height: 50 }} />
        <MediaView style={{ width: 160, height: 90 }} />
        <TriggerableView>
          <Text>{nativeAd.description}</Text>
        </TriggerableView>
      </View>
    );
  }
}

// Step 3: Wrap the Ad Component with withNativeAd HOC
const WrappedAdComponent = withNativeAd(AdComponent);

// Step 4: Render the Ad Component in Main App
class FbAds extends React.Component {
  render() {
    return (
      <View >
        <WrappedAdComponent adsManager={adsManager} />  
      </View>
    );
  }
}

export default FbAds;
