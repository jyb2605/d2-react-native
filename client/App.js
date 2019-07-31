import React, {Component} from "react";

import {createStackNavigator, createAppContainer} from 'react-navigation'
import LoginScreen from "./screen/Login";
import MapScreen from "./screen/Map";
import HomeScreen from "./screen/Home";
import SplashScreen from "./screen/Splash";
import WebScreen from "./screen/Web";
import RecordEndScreem from "./screen/RecordEnd";
import TestScreem from "./screen/PhotoUpload";

import RNSharedPreferences from 'react-native-android-shared-preferences';

navigator.geolocation = require('@react-native-community/geolocation');

export var sharedPreferences = RNSharedPreferences.getSharedPreferences("userInfo");

export function getAccessToken(refreshToken) {
    var loginCallBackAPI = 'http://101.101.160.246:3000/users/refresh?refresh_token=' + refreshToken;

    var getToken = fetch(loginCallBackAPI, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    getToken.then(response => response.json())
        .then((responseJson) => {
            var accessToken = responseJson.access_token;
            var newRefreshToken = responseJson.refresh_token;
            sharedPreferences.putString("accessToken", accessToken, (result) => {
                console.log("accessToken: " + result);
            });
            sharedPreferences.putString("refreshToken", newRefreshToken, (result) => {
                console.log("refreshToken: " + result);
            });
        })
}


const AppNavigator = createStackNavigator({
        Splash: {
            screen: SplashScreen
        },
        RecordEnd: {
            screen: RecordEndScreem
        },
        Test: {
            screen: RecordEndScreem
        },
        Home: {
            screen: HomeScreen
        },
        Web: {
            screen: WebScreen
        },
        Login: {
            screen: LoginScreen
        },
        Map: {
            screen: MapScreen
        }
    }, {
        defaultNavigationOptions: {
            header: null
        },
    }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}

// AppRegistry.registerComponent('client', () => GoogleMap);
// export AnimatedMarkers;