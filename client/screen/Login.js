import React, { Component } from 'react';
import { AppRegistry, Image, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation'
import { NaverLogin, getProfile } from 'react-native-naver-login';
// import NativeButton from 'apsl-react-native-button';

import Web from "../screen/Web";

const stylesLogin = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default class Login extends Component {
    state = {
        loginUrl: ""
    }
    static navigationOptions = {
        title: 'login',
    };

    naverLogin() {
        return fetch('http://101.101.160.246:3000/users/naver-login')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    loginUrl: responseJson.api_url
                })
                // return responseJson.api_url;
                // Linking.openURL(this.state.loginUrl)
                this.props.navigation.navigate('Web',{url:this.state.loginUrl})
            })
            .catch((error) => {
                console.error(error);
            });
    }


    render() {
        return (
            <View style={stylesLogin.container}>
                <TouchableOpacity onPress={ ()=>{
                    this.naverLogin(); }}>
                    <Image
                        style={{height:'100%',width:'100%',resizeMode:'contain'}}
                        source={require('./images/login.png')}/>
                </TouchableOpacity>
            </View>
        );
    }
}



// const AppNavigator = createStackNavigator({
//         Login1: {
//             screen: Login
//         },
//         Web: {
//             screen: Web
//         }}, {
//         defaultNavigationOptions: {
//             header: null
//         },
//     }
// );
//
// const AppContainer = createAppContainer(AppNavigator);
//
//
// export default class App extends React.Component {
//     render() {
//         return <AppContainer/>;
//     }
// }
