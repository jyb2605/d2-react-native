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
import { getAccessToken, sharedPreferences} from "../App";

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
        marginTop: 20
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
            tripNo: 0,
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
            })
        };
    }
    setTripNo = () => {
        sharedPreferences.getString("tripNo", (result) => {
            this.setState({
                tripNo: Number(result)
            })
        });
        sharedPreferences.putString("tripNo", String(this.state.tripNo + 1), (result) => {
            console.log(result);
        });

    }


    postLocationInfo = (latitude, longitude, accessToken) => {
        const postLocationAPI = 'http://101.101.160.246:3000/map/location';
        sharedPreferences.getString("tripNo", (result) => {
            this.setState({
                tripNo: Number(result)
            })
            console.log(this.state.tripNo);
        });
        const postTripRecord = fetch(postLocationAPI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                'tripNo': this.state.tripNo,
                'latitude': latitude,
                'longitude': longitude
            })
        });
        // console.log("success");
        postTripRecord.then(response => response.json())
            .then((responseJson) => {
                // this.setState({
                //     loading: false,
                //     dataSource: responseJson
                // })
                // console.log(responseJson.api_url);
                if (responseJson.code == 200) {
                    console.log("Code : 200");
                } else if (responseJson.code == 300) {
                    console.log("Code : 300");
                    sharedPreferences.getString("refreshToken", (result) => {
                        getAccessToken(result);
                        sharedPreferences.getString("accessToken", (result) => {
                            this.postLocationInfo(this.state.latitude, this.state.longitude, result);
                        })
                    })
                }
            })
            .catch(error=>console.log(error)) //to catch the errors if any
        // return url
        // console.log(1);
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
        this.setTripNo();
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
                console.log(position.coords);
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

                sharedPreferences.getString("accessToken", (result) => {
                    this.postLocationInfo(this.state.latitude, this.state.longitude, result);
                })
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
            <View style={styles.container}>

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
            </View>
        );
    }
}
