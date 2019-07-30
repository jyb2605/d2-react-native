import React, { Component } from 'react';
import { AppRegistry, Image, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';


const stylesLogin = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default class Bananas extends Component {
    state = {
        loginUrl: ""
    }
    getMoviesFromApiAsync() {
        return fetch('http://101.101.160.246:3000/users/naver-login')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    loginUrl: responseJson.api_url
                })
                // return responseJson.api_url;
                Linking.openURL(this.state.loginUrl)
            })
            .catch((error) => {
                console.error(error);
            });
    }




    render() {
        return (
            <View style={stylesLogin.container}>
                <TouchableOpacity onPress={ ()=>{  this.getMoviesFromApiAsync() }}>
                    <Image
                        style={{height:'100%',width:'100%',resizeMode:'contain'}}
                        source={require('./images/login.png')}/>
                </TouchableOpacity>
            </View>
        );
    }
}
