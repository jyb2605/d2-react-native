import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text, Button, TextInput, FlatList, Image,
    TouchableOpacity,
    Platform,
    PermissionsAndroid
} from 'react-native';

import MapView, {
    Marker,
    AnimatedRegion,
    Polyline,
    PROVIDER_GOOGLE
} from "react-native-maps";
import {createStackNavigator, createAppContainer} from 'react-navigation'
import haversine from "haversine";

navigator.geolocation = require('@react-native-community/geolocation');
import BackgroundTimer from 'react-native-background-timer';
import {getAccessToken, sharedPreferences} from "../App";
import ImagePicker from "react-native-image-picker";

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 37.5666102;
const LONGITUDE = 126.9783881;

// 유저 위치 권한 허용부분
export async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Example App',
                'message': 'Example App access to your location '
            }
        )
        // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //     console.log("You can use the location")
        //     alert("You can use the location");
        // } else {
        //     console.log("location permission denied")
        //     alert("Location permission denied");
        // }
    } catch (err) {
        console.warn(err)
    }
}


const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: 400,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    buttonContainer: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 200
    },
    mapButtonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
    },
    searchText: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20
    },
    alternativeLayoutButtonContainer: {
        margin: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
    },
    latlng: {
        width: 200,
        alignItems: "stretch"
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 10
    },
    viewStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'orange'
    },
    textStyles: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold'
    }
});

var markers = [
    {
        latitude: 37.5655288,
        longitude: 126.9789198,
        title: 'Foo Place',
        subtitle: '1234 Foo Drive'
    }
];
export default class AnimatedMarkers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {},
            coordinate: new AnimatedRegion({
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: 0,
                longitudeDelta: 0
            }),

            ImageSource: null,

            data: null,

            Image_TAG: ''
        };
    }

    getTripNoFromHome = () => {
        const {navigation} = this.props;
        const tripNo = navigation.getParam('tripNo', '0');
        console.log(tripNo);
        return tripNo;
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
                sharedPreferences.getString("accessToken", (result) => {
                    console.log(result)
                    this.postImage(result, this.getTripNoFromHome());
                });
            }
        });
    }


    postImage(accessToken, tripNo) {


        const postLocationAPI = 'http://101.101.160.246:3000/trips/image';
        let formdata = new FormData();

        // formdata.append("file", this.state.ImageSource.uri);
        formdata.append("file", {
            name: this.state.data.fileName,
            type: this.state.data.type,
            uri:
                Platform.OS === "android" ? this.state.data.uri : this.state.data.uri.replace("file://", "")
        });


        formdata.append("tripNo", tripNo);



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

    postLocationInfo = (latitude, longitude, accessToken, tripNo) => {
        const postLocationAPI = 'http://101.101.160.246:3000/map/location';
        const postTripRecord = fetch(postLocationAPI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                'tripNo': tripNo,
                'latitude': latitude,
                'longitude': longitude
            })
        });
        // console.log("success");
        postTripRecord.then(response => response.json())
            .then((responseJson) => {
                if (responseJson.code == 200) {
                    console.log("Code : 200");
                } else if (responseJson.code == 300) {
                    console.log("Code : 300");
                    sharedPreferences.getString("refreshToken", (result) => {
                        getAccessToken(result);
                        sharedPreferences.getString("accessToken", (result) => {
                            this.postLocationInfo(this.state.latitude, this.state.longitude, result, tripNo);
                        })
                    })
                }
            })
            .catch(error => console.log(error)) //to catch the errors if any
    }


    // componentDidMount() {
    //     this.setTripNo();
    //     // sharedPreferences.getString("accessToken", (result) => {
    //     //     this.postLocationInfo(this.state.latitude, this.state.longitude, result);
    //     // })
    //     const interverID = BackgroundTimer.setInterval(() => {
    //         this.tick();
    //         sharedPreferences.getString("accessToken", (result) => {
    //             this.postLocationInfo(this.state.latitude, this.state.longitude, result);
    //         })
    //         this.componentDidMountGPS();
    //     }, 6000);
    //     // BackgroundTimer.clearInterval(intervalId);
    // }

    // tick() {
    //     console.log('tic 2');
    // }


    componentDidMount() {
        requestLocationPermission()
        const {coordinate} = this.state;
        this.watchID = navigator.geolocation.watchPosition(
            position => {
                const {routeCoordinates, distanceTravelled} = this.state;
                const {latitude, longitude} = position.coords;

                const newCoordinate = {
                    latitude,
                    longitude
                };
                sharedPreferences.getString("accessToken", (result) => {
                    this.postLocationInfo(this.state.latitude, this.state.longitude, result, this.getTripNoFromHome());
                })
                // console.log(position.coords);
                if (Platform.OS === "android") {
                    if (this.marker) {
                        this.marker._component.animateMarkerToCoordinate(
                            newCoordinate,
                            500
                        );
                    }
                } else {
                    coordinate.timing(newCoordinate).start();
                }
                this.setState({
                    latitude,
                    longitude,
                    routeCoordinates: routeCoordinates.concat([newCoordinate]),
                    distanceTravelled:
                        distanceTravelled + this.calcDistance(newCoordinate),
                    prevLatLng: newCoordinate
                });
            },
            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
                distanceFilter: 10
            }
        );
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    calcDistance = newLatLng => {
        const {prevLatLng} = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
    };


    render() {
        return (
            <View style={styles.container2}>

                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        showUserLocation
                        followUserLocation
                        loadingEnabled
                        region={this.getMapRegion()}
                    >
                        <Polyline coordinates={this.state.routeCoordinates}
                                  strokeWidth={5}
                                  strokeColor={'#3EAF0E'}/>
                        <Marker.Animated
                            ref={marker => {
                                this.marker = marker;
                            }}
                            coordinate={this.state.coordinate}
                        />
                    </MapView>
                    <View style={styles.mapButtonContainer}>
                        <TouchableOpacity style={[styles.bubble, styles.button]}>
                            <Text style={styles.bottomBarContent}>
                                {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/*<Button title={"test"} onPress={ }/>*/}

                <View style={styles.buttonContainer}>

                    <Button
                        style={styles.buttonContainer}
                        onPress={() => {
                            this.selectPhotoTapped();
                        }}                  // onPress={this._onPressButton}
                        title="사진 업로드"
                        color="#2ba104"
                    />
                </View>

                <View style={styles.buttonContainer}>

                    <Button
                        style={styles.buttonContainer}
                        onPress={() => {
                            this.props.navigation.navigate('RecordEnd',{tripNo:this.getTripNoFromHome()});
                        }}                    // onPress={this._onPressButton}
                        title="일지 종료"
                        color="#2b3ef2"
                    />
                </View>
            </View>
        );
    }
}
