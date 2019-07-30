import React from 'react';
import {
    View,
    Image,
    Text,
    Button, StyleSheet, Alert, TextInput,
    FlatList, // here
} from 'react-native';

export default class App extends React.Component {


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
        Alert.alert('You tapped the button!')
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this._onPressButton}
                        title="내 여행기록"
                        color="#0e2341"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this._onPressButton}
                        title="타인의 여행기록"
                        color="#743242"
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
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
    }
});
