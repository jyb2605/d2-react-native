import React, {Component} from 'react';
import {AppRegistry, Image, View, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {WebView} from 'react-native-webview';
import {Alert } from 'react-native';

import {StackActions, NavigationActions} from 'react-navigation';
import RNSharedPreferences from "react-native-android-shared-preferences";
import { sharedPreferences } from "../App";

const stylesLogin = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default class MyWeb extends Component {
    state = {
        code: 0,
        message: ""
    }
    webViewEnd = async (event) => {

        const result = JSON.parse(event.nativeEvent.data);
        // Alert.alert("data = ", result);
        if (result.code === 200) {
            // console.log('!');
            //성공적 네이버 로그인/회원가입 완료
            //login 정보 저장 하기!
            const data = {
                access_token: result.access_token,
                refresh_token: result.refresh_token,
                // profile:profileURL
            }
            console.log(data.access_token);
            sharedPreferences.putString("accessToken", data.access_token, (result) => {
                console.log("accessToken: " + result);
            });
            sharedPreferences.putString("refreshToken", data.refresh_token, (result) => {
                // console.log("refreshToken: " + result);
            })

            //여기서 토큰저장 필요
            //저장 후 바로 화면전환
            this.props.navigation.navigate('Home',)
            // Alert.alert("data = " + JSON.stringify(data));
        }
        // else {
        //     //실패
        //     this.props.navigation.navigate('Home',)
        //     // this.props.navigation.goBack();
        // }

    }

    render() {
        const {navigation} = this.props;
        const url = navigation.getParam('url', 'https://www.naver.com');
        // console.log(url);
        return (
            <WebView
                source={{uri: url}}
                onMessage={(event) => this.webViewEnd(event)}
                // onMessage={(event) => Alert.alert(event.nativeEvent.data)}

            />

        );
    }
}
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     }
// })