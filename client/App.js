import React, { Component } from "react";
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
} from "react-native-maps";import {createStackNavigator, createAppContainer} from 'react-navigation'
import haversine from "haversine";
import Login from "./screen/Login";

navigator.geolocation = require('@react-native-community/geolocation');

import {FloatingAction} from "react-native-floating-action";
import BackgroundTimer from 'react-native-background-timer';
// import SplashScreen from "./screen/Splash";
// import SplashScreen from 'react-native-splash-screen'
import Splash from "./screen/Login";
// import Splash from "./src/Splash";

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

// class Splash extends React.Component {
//     componentDidMount() {
//         setTimeout(() => {
//             SplashScreen.hide();
//         }, 2000);
//     }
//
//     render() {
//         return (
//             <View style={styles.container}>
//             </View>
//         );
//     }
// }
class SplashScreen extends React.Component {

    componentDidMount() {
        setTimeout(
            ()=>{this.props.navigation.navigate('Home2')},1000
        )
    }


    render() {
        return (
            <View style={styles.viewStyles}>
                <Text style={styles.textStyles}>
                    Blitz Reading
                </Text>
            </View>
        );
    }
}

class LoginScreen extends Component {

    render() {
        return (
            <Login />
        );
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


    componentWillMount() {
        const intervalId = BackgroundTimer.setInterval(() => {
            this.tick();
        }, 3000);
    }

    tick() {
        console.log('tic 2');
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


class HomeScreen extends React.Component {


    state = {
        data: [],
        page: 1 // here

    }

    _renderItem = ({item}) => (
        <View style={{borderBottomWidth: 1, padding: 20, flexDirection: 'row'}}>
            <Image source={{uri: item.url}} style={{width: 50, height: 50}}/>
            <Text style={{justifyContent: 'space-between'}}>{item.title}</Text>
            {/*// item.  뒤에 들어가는게 json에서 컬럼*/}
            <Text>{item.id}</Text>
        </View>
    );

    _getData = () => {
        const url = 'https://jsonplaceholder.typicode.com/photos?_limit=10&_page=' + this.state.page; //서버 url
        fetch(url)
            .then(r => r.json())
            .then(data => {
                this.setState({
                    data: this.state.data.concat(data),
                    page: this.state.page + 1
                })
            });
    }

    componentDidMount() {
        this._getData();
    }

    // here
    _handleLoadMore = () => {
        this._getData();
    }

    _onPressButton() {
        {
            () => this.props.navigation.navigate('Details')
        }
        // Alert.alert('You tapped the button!')
    }


    render() {
        return (
            <View style={styles.container2}>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() => this.props.navigation.navigate('Map')}
                        // onPress={this._onPressButton}
                        title="내 여행기록"
                        color="#2ba104"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this._onPressButton}
                        title="타인의 여행기록"
                        color="#2b77a1"
                    />
                </View>

                <TextInput
                    style={styles.searchText}
                    placeholder="여기에 검색하세요"
                    onChangeText={(text) => this.setState({text})}
                    value={this.state.text}
                />

                <FlatList
                    data={this.state.data}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => item.id}
                    onEndReached={this._handleLoadMore}
                    onEndReachedThreshold={1}
                />
                <FloatingAction
                    actions={actions}
                    onPressItem={name => {
                        this.props.navigation.navigate('Map');
                        // console.log(`selected button: ${name}`);
                    }}
                />
            </View>
        );
    }

}


const actions = [
    {
        text: "일지 시작하기",
        // icon: require("./images/borad.png"),
        name: "bt_accessibility",
        position: 1,
        color: "#2ba104"
    },
];


const AppNavigator = createStackNavigator({
    Home: {
        screen: SplashScreen
    },
    Home2: {
        screen: HomeScreen
    },
    Login: {
        screen: LoginScreen
    },
    Map: {
        screen: AnimatedMarkers
    }}
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}

// AppRegistry.registerComponent('client', () => GoogleMap);
// export AnimatedMarkers;