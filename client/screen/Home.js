import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text, Button, TextInput, FlatList, Image,
    TouchableOpacity,
    Platform,
    PermissionsAndroid, Alert
} from 'react-native';

import {FloatingAction} from "react-native-floating-action";



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

export default class HomeScreen extends React.Component {


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

    getRecordList() {
        //
        // let data = {
        //     method: 'POST',
        //     credentials: 'same-origin',
        //     mode: 'same-origin',
        //     body: JSON.stringify({
        //         'title': this.state.title,
        //         'location': this.state.place
        //     }),
        //     headers: {
        //         'content-type': 'application/json',
        //         'authorization': 'AAAAN5Qk0GPDLYODStkLwVLfFuVXaXTjMv6rpRoJYmVsS/l8mo8iJ4z/wt6bEe7S1AzeaQtUXblUPjwkZHDLQAST7QI='
        //     }
        // }
        // return fetch('http://101.101.160.246:3000/trips/' + 10, data)
        // .then(response => response.json())  // promise /
        // .then(json => dispatch(receiveAppos(json)))


        fetch('http://101.101.160.246:3000/trips/' + 1, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'authorization': 'AAAAN5Qk0GPDLYODStkLwVLfFuVXaXTjMv6rpRoJYmVsS/l8mo8iJ4z/wt6bEe7S1AzeaQtUXblUPjwkZHDLQAST7QI='
            },
            body: JSON.stringify({
                title: this.state.title,
                location: this.state.place
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.code === 200){
                    Alert.alert("성공")
                }
                else{
                    Alert.alert(JSON.stringify(responseJson))
                }
            })
            .catch((error) => {
                console.error(error);
            });

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
