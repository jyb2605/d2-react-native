import React from "react";
import {StyleSheet, Text, View} from "react-native";

const styles = StyleSheet.create({
    viewStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green'
    },
    textStyles: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold'
    }
});

export default class Splash extends React.Component {

    componentDidMount() {
        setTimeout(
            () => {
                this.props.navigation.navigate('Login')
            }, 1000
        )
    }


    render() {
        return (
            <View style={styles.viewStyles}>
                <Text style={styles.textStyles}>
                    Trip Recording
                </Text>
            </View>
        );
    }
}
//
// const AppNavigator = createStackNavigator({
//         Splash: {
//             screen: Screen
//         },
//         Login: {
//             screen: LoginScreen
//         }
//     }, {
//         defaultNavigationOptions: {
//             header: null
//         },
//     }
// );
//
// const AppContainer = createAppContainer(AppNavigator);
//
// export default class App extends React.Component {
//     render() {
//         return <AppContainer/>;
//     }
// }
