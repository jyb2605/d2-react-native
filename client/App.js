import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text, Button, TextInput, FlatList, Image,
    TouchableOpacity,
    Platform,
    PermissionsAndroid
} from 'react-native';

import {createStackNavigator, createAppContainer} from 'react-navigation'
import LoginScreen from "./screen/Login";
import MapScreen from "./screen/Map";
import HomeScreen from "./screen/Home";
import SplashScreen from "./screen/Splash";
import WebScreen from "./screen/Web";


navigator.geolocation = require('@react-native-community/geolocation');


const AppNavigator = createStackNavigator({
        Splash: {
            screen: SplashScreen
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