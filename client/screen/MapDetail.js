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
export default class JustGPS extends React.Component {
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
            })
        };
    }
    _getData = (accessToken, tripNo) => {
        const url = 'http://101.101.160.246:3000/map/paths?tripNo=' + tripNo; //서버 url
        fetch(url, {
            method: "GET",
            headers: {
            Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
        })
            .then(response => response.json())
            .then(responseJson => {
                console.log(responseJson);
                this.setState({
                    routeCoordinates: this.state.routeCoordinates.concat(responseJson.locations)
                })
                console.log(this.state.routeCoordinates);
            });
    }
    getTripNoFromHome = () => {
        const {navigation} = this.props;
        const tripNo = navigation.getParam('tripNo', '0');
        console.log(tripNo);
        return tripNo;
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
        this._getData('AAAAOytvlCu9FVVd6WBgcVUi9uDpB5zkXnf7F9NuoGcMbzrMfbYbUEKjcV/kLwFucwSbl+dHummVOimAzGPFM13Dml8=', 3);
        // requestLocationPermission()
        // const {coordinate} = this.state;
        // this.watchID = navigator.geolocation.watchPosition(
        //     position => {
        //         const {routeCoordinates, distanceTravelled} = this.state;
        //         const {latitude, longitude} = position.coords;
        //
        //         const newCoordinate = {
        //             latitude,
        //             longitude
        //         };
        //         sharedPreferences.getString("accessToken", (result) => {
        //             this.postLocationInfo(this.state.latitude, this.state.longitude, result, this.getTripNoFromHome());
        //         })
        //         // console.log(position.coords);
        //         if (Platform.OS === "android") {
        //             if (this.marker) {
        //                 this.marker._component.animateMarkerToCoordinate(
        //                     newCoordinate,
        //                     500
        //                 );
        //             }
        //         } else {
        //             coordinate.timing(newCoordinate).start();
        //         }
        //         this.setState({
        //             latitude,
        //             longitude,
        //             routeCoordinates: routeCoordinates.concat([newCoordinate]),
        //             distanceTravelled:
        //                 distanceTravelled + this.calcDistance(newCoordinate),
        //             prevLatLng: newCoordinate
        //         });
        //     },
        //     error => console.log(error),
        //     {
        //         enableHighAccuracy: true,
        //         timeout: 20000,
        //         maximumAge: 1000,
        //         distanceFilter: 10
        //     }
        // );
    }
    //
    // componentWillUnmount() {
    //     navigator.geolocation.clearWatch(this.watchID);
    // }

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

            </View>
        );
    }
}
