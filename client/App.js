/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  AppRegistry
} from 'react-native';

import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

var markers = [
    {
        latitude: 37.5655288,
        longitude: 126.9789198,
        title: 'Foo Place',
        subtitle: '1234 Foo Drive'
    }
];

export default class GoogleMap extends Component {
  render() {
    return (
        <View style={styles.container}>
          <MapView
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              region={{
                  // 서울특별시청 주소를 첫 region으로 세팅
                latitude: 37.5655288,
                longitude: 126.9789198,
                latitudeDelta: 0.0115,
                longitudeDelta: 0.0112,
              }}
              annotations={markers}
          >
          <MapView.Marker
              coordinate={{
                  latitude: 37.5655288,
                  longitude: 126.9789198}}
              title={"서울"}
              description={"서울"}
          />
          </MapView>
        </View>
    );
  }
}

AppRegistry.registerComponent('client', () => GoogleMap);