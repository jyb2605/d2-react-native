//This is an example code to understand TextInput//
import React from 'react';
//import react in our code.

import {TextInput, View, StyleSheet, Text, Button, Alert} from 'react-native';
//import all the components we are going to use.

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            place: '',
        };
    }

    recordEnd() {
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
            <View style={styles.container}>
                {/*<Text style={{ color: 'cyan' }}>{this.state.username}</Text>*/}
                <TextInput
                    value={this.state.title}
                    onChangeText={title => this.setState({title})}
                    placeholder={'여행을 나타낼수 있는 제목을 입력해 주세요'}
                    style={styles.inputLong}
                />

                <TextInput
                    value={this.state.place}
                    onChangeText={place => this.setState({place})}
                    placeholder={'여행하신 장소를 입력해 주세요'}
                    style={styles.input}
                />

                <Button
                    onPress={ ()=>{this.recordEnd(); }}                    // onPress={this._onPressButton}
                    title="작성완"
                    color="#2ba104"
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    input: {
        width: 250,
        height: 44,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ecf0f1',
    },
    inputLong: {
        width: 350,
        height: 44,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ecf0f1',
    },
});
