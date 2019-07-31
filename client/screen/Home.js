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
import RNSharedPreferences from 'react-native-android-shared-preferences';
import {getAccessToken, sharedPreferences} from "../App";


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
        code: 0,
        message: "",
        accessToken: "",
        refreshToken: "",
        userNo: 0,
        data: [],
        page: 1, // here
        refreshing: false

    }

    _renderItem = ({item}) => (
        <View style={{borderBottomWidth: 1, padding: 20, flexDirection: 'row'}}>
            <Image source={{uri: item.image_url}} style={{width: 50, height: 50}}/>
            <Text style={{justifyContent: 'space-between'}}>{item.title}</Text>
            {/*// item.  뒤에 들어가는게 json에서 컬럼*/}
            {/*<Text>{item.title}</Text>*/}
        </View>
    );

    getRecordList = (accessToken) => {
        const postLocationAPI = 'http://101.101.160.246:3000/trips?type=ME';
        const getList = fetch(postLocationAPI, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            }
        });
        getList.then(response => response.json())
            .then((responseJson) => {
                this.setState({
                    data: []
                })
                if (responseJson.code == 200) {
                    console.log(responseJson);
                    this.setState({
                        data: this.state.data.concat(responseJson.trips),
                        page: this.state.page + 1
                    })
                } else if (responseJson.code == 300) {
                    // console.log('getRecordList');
                    // // console.log("Code : 300");
                    // sharedPreferences.getString("refreshToken", (result) => {
                    //     getAccessToken(result);
                    //     sharedPreferences.getString("accessToken", (result) => {
                    //         this.getRecordList(result);
                    //     })
                    // })
                }
            })
            .catch(error => console.log(error)) //to catch the errors if any
    }

    getRecordListOther = (accessToken) => {
        const postLocationAPI = 'http://101.101.160.246:3000/trips';
        const getList = fetch(postLocationAPI, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            }
        });
        getList.then(response => response.json())
            .then((responseJson) => {
                this.setState({
                    data: []
                })
                if (responseJson.code === 200) {
                    console.log("success");
                    console.log(responseJson);
                    this.setState({
                        data: this.state.data.concat(responseJson.trips),
                        page: this.state.page + 1
                    })
                } else if (responseJson.code === 300) {
                    // console.log('getRecordListOther');
                    // sharedPreferences.getString("refreshToken", (result) => {
                    //     getAccessToken(result);
                    //     sharedPreferences.getString("accessToken", (result) => {
                    //         this.getRecordListOther(result);
                    //     })
                    // })
                }
            })
            .catch(error => console.log(error)) //to catch the errors if any
    }


    componentDidMount() {
        sharedPreferences.getString("accessToken", (result) => {
            console.log(result)
            this.getRecordList(result);
        });
    }

    // here
    _handleLoadMore = () => {
        sharedPreferences.getString("accessToken", (result) => {
            this.getRecordList(result);
        });
    }

    getStartRecordInfo = (accessToken, userNo) => {
        const tripsRegisterAPI = 'http://101.101.160.246:3000/trips/register';
        const getStartRecord = fetch(tripsRegisterAPI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                'userNo': Number(userNo)
            })
        })
        getStartRecord.then(response => response.json())
            .then((responseJson) => {
                if (responseJson.code === 200) {
                    console.log(responseJson.tripNo);
                    this.props.navigation.navigate('Map', {tripNo: responseJson.tripNo});
                } else if (responseJson.code === 300) {
                }
            })
            .catch(error => console.log(error)) //to catch the errors if any
    }

    // handleRefresh = () => {
    //     this.setState(
    //         {
    //             page: 1,
    //             seed: this.state.seed + 1,
    //             refreshing: true
    //         },
    //         () => {
    //             this.getRecordListOther();
    //         }
    //     );
    // };


    startRecord = () => {
        sharedPreferences.getString("refreshToken", (result) => {
            getAccessToken(result);
        })

        sharedPreferences.getString("accessToken", (result) => {
            this.setState({
                accessToken: result
            })

            sharedPreferences.getString("userNo", (result) => {
                this.getStartRecordInfo(this.state.accessToken, result);
            })
        })
        // console.log(this.state.accessToken);
    }

    getRecordListOtherClicked = () => {
        sharedPreferences.getString("refreshToken", (result) => {
            getAccessToken(result);
            sharedPreferences.getString("accessToken", (result) => {
                this.getRecordListOther(result);
            })
        })
    }
    getRecordListClicked = () => {
        sharedPreferences.getString("refreshToken", (result) => {
            getAccessToken(result);
            sharedPreferences.getString("accessToken", (result) => {
                this.getRecordList(result);
            })
        })
    }

    render() {
        return (
            <View style={styles.container2}>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() => this.getRecordListClicked()}
                        // onPress={this._onPressButton}
                        title="내 여행기록"
                        color="#2ba104"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() => this.getRecordListOtherClicked()}
                        // onPress={this._onPressButton}
                        title="다른사람 여행기록"
                        color="#2ef189"
                    />
                    {/*<TouchableOpacity onPress={ ()=>{this.getRecordListOtherClicked(); }}>*/}
                    {/*    <View style={styles.buttonContainer}>*/}
                    {/*        <Text>*/}
                    {/*            타인의 여행기록*/}
                    {/*        </Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
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
                    // onEndReached={this._handleLoadMore}
                    // onEndReachedThreshold={1}
                />
                <FloatingAction
                    actions={actions}
                    onPressItem={name => {
                        this.startRecord()
                        // console.log(`selected button: ${name}`);
                    }}
                    // refreshing={this.state.refreshing}
                    // onRefresh={this.handleRefresh}
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
