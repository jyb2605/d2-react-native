import React, {Component} from 'react';

import {StyleSheet, Text, View, PixelRatio, TouchableOpacity, Image, TextInput, Alert, Button} from 'react-native';

import ImagePicker from 'react-native-image-picker';

import RNFetchBlob from 'rn-fetch-blob';
import {getAccessToken, sharedPreferences} from "../App";

export default class Project extends Component {

    constructor() {

        super();

        this.state = {

            ImageSource: null,

            data: null,

            Image_TAG: ''

        }
    }

    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let source = {uri: response.uri};

                this.setState({
                    ImageSource: source,
                    data: response
                });
            }
        });
    }

    uploadImageToServer = () => {

        RNFetchBlob.fetch('POST', 'http://101.101.160.246:3000/trips/image', {
            'authorization': 'AAAAN5Qk0GPDLYODStkLwVLfFuVXaXTjMv6rpRoJYmVsS/l8mo8iJ4z/wt6bEe7S1AzeaQtUXblUPjwkZHDLQAST7QI=',
            'Content-Type': 'multipart/form-data',
        }, [
            {name: 'image', filename: 'image.png', type: 'image/png', data: this.state.data},
            {name: 'image_tag', data: this.state.Image_TAG}
        ]).then((resp) => {

            var tempMSG = resp.data;

            tempMSG = tempMSG.replace(/^"|"$/g, '');

            Alert.alert(tempMSG);

        }).catch((err) => {
            // ...
        })

    }

    createFormData = (photo, body) => {
        const data = new FormData();

        data.append("photo", {
            name: photo.fileName,
            type: photo.type,
            uri:
                Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
        });

        Object.keys(body).forEach(key => {
            data.append(key, body[key]);
        });

        // console.log("dddddddddasd")
        return data;
    };

    postImage(accessToken) {
        const postLocationAPI = 'http://101.101.160.246:3000/trips/image';


        let formdata = new FormData();

        // formdata.append("file", this.state.ImageSource.uri);
        formdata.append("file", {
            name: this.state.data.fileName,
            type: this.state.data.type,
            uri:
                Platform.OS === "android" ? this.state.data.uri : this.state.data.uri.replace("file://", "")
        });


        formdata.append("tripNo", 2);



        const upload = fetch(postLocationAPI, {
            method: 'POST',
            headers: {
                // Accept: 'application/json',
                'type':'image/jpg',
                'Content-Type': 'multipart/form-data',
                'Authorization': accessToken
            },
            body: formdata
        });

        console.log(formdata);

        upload.then(response => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                if (responseJson.code === 200) {
                    console.log("Code : 200");

                } else if (responseJson.code === 300) {
                    console.log("Code : 300");
                    sharedPreferences.getString("refreshToken", (result) => {
                        getAccessToken(result);

                        sharedPreferences.getString("accessToken", (result) => {
                            // this.postImage(result);
                        })
                    })
                }
            })
            .catch(error => console.log(error)) //to catch the errors if any
    }

    upload = (url, data) => {
        let options = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            method: 'POST'
        };

        options.body = new FormData();
        for (let key in data) {
            options.body.append(key, data[key]);
        }

        // console.log(url)

        return fetch(url, options)
            .then(response => response.json())
            .then(responseJson => {
                //You put some checks here
                console.log(responseJson)
                return responseJson;
            });


    }

    render() {
        return (
            <View style={styles.container}>

                <TouchableOpacity onPress={() => {
                    this.selectPhotoTapped();
                }}>

                    <View style={styles.ImageContainer}>

                        {this.state.ImageSource === null ? <Text>Select a Photo</Text> :
                            <Image style={styles.ImageContainer} source={this.state.ImageSource}/>
                        }

                    </View>

                </TouchableOpacity>


                <TextInput

                    placeholder="Enter Image Name "

                    onChangeText={data => this.setState({Image_TAG: data})}

                    underlineColorAndroid='transparent'

                    style={styles.TextInputStyle}
                />


                {/*<TouchableOpacity onPress={*/}
                {/*    sharedPreferences.getString("accessToken", (result) => {*/}
                {/*        console.log("dddd")*/}
                {/*    this.postImage(result, this.state.ImageSource);*/}
                {/*})*/}
                {/*} activeOpacity={0.6} style={styles.button}>*/}
                <TouchableOpacity onPress={() => this.postImage()}

                                  activeOpacity={0.6} style={styles.button}>

                    <Text style={styles.TextStyle}> UPLOAD IMAGE TO SERVER </Text>

                </TouchableOpacity>

            </View>
        );
    }

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        paddingTop: 20
    },

    ImageContainer: {
        borderRadius: 10,
        width: 250,
        height: 250,
        borderColor: '#9B9B9B',
        borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CDDC39',

    },

    TextInputStyle: {

        textAlign: 'center',
        height: 40,
        width: '80%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#028b53',
        marginTop: 20
    },

    button: {

        width: '80%',
        backgroundColor: '#00BCD4',
        borderRadius: 7,
        marginTop: 20
    },

    TextStyle: {
        color: '#fff',
        textAlign: 'center',
        padding: 10
    }

});