import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    Image,
    Platform,
    Text,
    View,
} from 'react-native';
import NativeAdView, {
    CallToActionView,
    HeadlineView,
    IconView,
    ImageView,
    TaglineView,
} from 'react-native-admob-native-ads';
import { MediaView } from './MediaView';

export const AdView = React.memo(({ index, media = true, type, loadOnMount = true }) => {
    const [aspectRatio, setAspectRatio] = useState(1.5);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [rating, setRating] = useState(0); // [0, 5]
    const nativeAdRef = useRef();

    const onAdFailedToLoad = event => {
        setError(true);
        setLoading(false);
        /**
         * Sometimes when you try to load an Ad, it will keep failing
         * and you will recieve this error: "The ad request was successful,
         * but no ad was returned due to lack of ad inventory."
         *
         * This error is not a bug or issue with our Library.
         * Just remove the app from your phone & clean your build
         * folders by running ./gradlew clean in /android folder
         * and for iOS clean the project in xcode. Hopefully the error will
         * be gone.
         *
         * [iOS] If you get this error: "Cannot find an ad network adapter with
         * the name(s): com.google.DummyAdapter". The ad inventory is empty in your
         * location. Try using a vpn to get ads in a different location.
         *
         * If you have recently created AdMob IDs for your ads, it might take
         * a few days until the ads will start showing.
         */
        console.log('AD', 'FAILED', event);
    };

    const onAdLoaded = () => {
        console.log('AD', 'LOADED', 'Ad has loaded successfully');
    };

    const onAdClicked = () => {
        console.log('AD', 'CLICK', 'User has clicked the Ad');
    };

    const onAdImpression = () => {
        console.log('AD', 'IMPRESSION', 'Ad impression recorded');
    };

    const onNativeAdLoaded = event => {
        console.log('AD', 'RECIEVED', 'Unified ad  Recieved', event);
        setLoading(false);
        setLoaded(true);
        setError(false);
        setAspectRatio(event.aspectRatio);
        setRating(event.rating);
    };

    const onAdLeftApplication = () => {
        console.log('AD', 'LEFT', 'Ad left application');
    };

    useEffect(() => {
        if (!loaded) {
            nativeAdRef.current?.loadAd();
        } else {
            console.log('AD', 'LOADED ALREADY');
        }
    }, [loaded]);

    const renderStar = (index) => {
        const filledStars = Math.floor(rating);

        if (index < filledStars) {
            // Render a filled star
            return <Image source={require('../assets/images/filled_star_icon.png')} style={{
                width: 10, // Adjust the width and height of the star as needed
                height: 10,
                resizeMode: 'cover',
            }} />;
        } else {
            // Render an unfilled star
            return <Image source={require('../assets/images/unfilled_star_icon.png')} style={{
                width: 10, // Adjust the width and height of the star as needed
                height: 10,
                resizeMode: 'cover',
            }} />;
        }
    };

    return (
        <NativeAdView
            ref={nativeAdRef}
            onAdLoaded={onAdLoaded}
            onAdFailedToLoad={onAdFailedToLoad}
            onAdLeftApplication={onAdLeftApplication}
            onAdClicked={onAdClicked}
            onAdImpression={onAdImpression}
            onNativeAdLoaded={onNativeAdLoaded}
            refreshInterval={60000 * 2}
            requestNonPersonalizedAdsOnly={false}
            enableTestMode={false}
            style={{
                alignSelf: 'center',
            }}
            videoOptions={{
                customControlsRequested: true,
            }}
            mediationOptions={{
                nativeBanner: true,
            }}
            adUnitID={'ca-app-pub-5213405198446794/1322226819'} // REPLACE WITH NATIVE_AD_VIDEO_ID for video ads.
        >
            <View
                style={{
                    width: 260,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: 'white',
                    backgroundColor: '#211F1F',
                    borderBottomLeftRadius: 23,
                    borderBottomRightRadius: 23,
                    paddingBottom: 20,
                }}>
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: !loading && !error && loaded ? 0 : 1,
                        zIndex: !loading && !error && loaded ? 0 : 10,
                    }}>
                    {!loading && <ActivityIndicator size={28} color="#a9a9a9" />}
                    {error && <Text style={{ color: '#a9a9a9' }}>:-(</Text>}
                </View>

                <View
                    style={{
                        width: '100%',
                        flexDirection: 'column',
                        opacity: loading || error || !loaded ? 0 : 1,
                        overflow: 'hidden',
                    }}>
                    {media ?
                        <MediaView aspectRatio={aspectRatio} />
                        :
                        <ImageView
                            style={{
                                width: '100%',
                                height: 170,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                            }}
                            resizeMethod='resize'
                            resizeMode='stretch'
                        />
                    }
                    <View
                        style={{
                            paddingHorizontal: 10
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                marginTop: 10
                            }}
                        >
                            <IconView
                                style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: 10,
                                }}
                            />

                            <View
                                style={{
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                            >
                                <HeadlineView
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 14,
                                        color: 'white',
                                        paddingRight: 30,
                                    }}
                                />
                                <View key={index} style={{
                                    flexDirection: 'row',
                                }}>
                                    {[...Array(5).keys()].map((index) => (
                                        <View key={index}>
                                            {renderStar(index)}
                                        </View>
                                    ))}
                                </View>
                            </View>

                        </View>
                        <TaglineView
                            style={{
                                fontSize: 12,
                                color: 'white',
                                marginTop: 10,
                                fontWeight: 400
                            }}
                            numberOfLines={2}
                        />
                    </View>
                    <CallToActionView
                        style={[
                            {
                                minHeight: 40,
                                paddingHorizontal: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: 10,
                                marginTop: 10,
                                width: '80%'
                            },
                            Platform.OS === 'ios'
                                ? {
                                    backgroundColor: '#FFA500',
                                    borderRadius: 10,
                                }
                                : {},
                        ]}
                        buttonAndroidStyle={{
                            backgroundColor: '#051EFF',
                        }}
                        allCaps
                        textStyle={{
                            fontSize: 16,
                            fontWeight: 500,
                            flexWrap: 'wrap',
                            textAlign: 'center',
                            paddingTop: 10,
                            color: 'white',
                        }}
                    />
                </View>
            </View>
        </NativeAdView>
    );
});