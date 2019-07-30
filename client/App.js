/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
//
// import React, { Component } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   AppRegistry,
//   Button
// } from 'react-native';
//
// import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
// import type {TextStyle} from "react-native/Libraries/StyleSheet/StyleSheet";
//
// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     height: 400,
//     left: 0,
//     right: 0,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
// });
//
// var markers = [
//     {
//         latitude: 37.5655288,
//         longitude: 126.9789198,
//         title: 'Foo Place',
//         subtitle: '1234 Foo Drive'
//     }
// ];
// var naverLoginApi = 'http://101.101.160.246:3000/users/naver-login';
// function getLoginToken() {
//     var test = fetch(naverLoginApi, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//     });
//     test.then(response => response.json())
//         .then((responseJson)=> {
//             // this.setState({
//             //     loading: false,
//             //     dataSource: responseJson
//             // })
//             console.log(responseJson.code);
//             console.log(responseJson.api_url);
//             return responseJson.code;
//         })
//         .catch(error=>console.log(error)) //to catch the errors if any
//     // return url
//     // console.log(1);
// }
// function showToast(message) {
//     <Text>{message}</Text>
//     console.log(message);
// }
// export default class GoogleMap extends Component {
//   render() {
//     return (
//         <View style={styles.container}>
//           <MapView
//               provider={PROVIDER_GOOGLE} // remove if not using Google Maps
//               style={styles.map}
//               region={{
//                   // 서울특별시청 주소를 첫 region으로 세팅
//                 latitude: 37.5655288,
//                 longitude: 126.9789198,
//                 latitudeDelta: 0.0115,
//                 longitudeDelta: 0.0112,
//               }}
//               annotations={markers}
//           >
//           <MapView.Marker
//               coordinate={{
//                   latitude: 37.5655288,
//                   longitude: 126.9789198}}
//               title={"서울"}
//               description={"서울"}
//           />
//           </MapView>
//           <Button title={"Test"} onPress={() => showToast(getLoginToken())}/>
//         </View>
//     );
//   }
// }
// AppRegistry.registerComponent('client', () => GoogleMap);


import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    PermissionsAndroid
} from "react-native";
import MapView, {
    Marker,
    AnimatedRegion,
    Polyline,
    PROVIDER_GOOGLE
} from "react-native-maps";
import haversine from "haversine";
navigator.geolocation = require('@react-native-community/geolocation');

// const LATITUDE = 29.95539;
// const LONGITUDE = 78.07513;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 37.5666102;
const LONGITUDE = 126.9783881;
// 유저 위치 권한 허용부분
export async function requestLocationPermission()
{
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Example App',
                'message': 'Example App access to your location '
            }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the location")
            alert("You can use the location");
        } else {
            console.log("location permission denied")
            alert("Location permission denied");
        }
    } catch (err) {
        console.warn(err)
    }
}

class AnimatedMarkers extends React.Component {
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

    componentDidMount() {
        requestLocationPermission()
        const { coordinate } = this.state;

        this.watchID = navigator.geolocation.watchPosition(
            position => {
                const { routeCoordinates, distanceTravelled } = this.state;
                const { latitude, longitude } = position.coords;

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
        const { prevLatLng } = this.state;
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
                              strokeColor={'#3EAF0E'} />
                    <Marker.Animated
                        ref={marker => {
                            this.marker = marker;
                        }}
                        coordinate={this.state.coordinate}
                    />
                </MapView>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.bubble, styles.button]}>
                        <Text style={styles.bottomBarContent}>
                            {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject
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
    buttonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
    }
});

export default AnimatedMarkers;