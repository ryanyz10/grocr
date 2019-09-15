import React from 'react';
import { AsyncStorage, View, Button, Text } from 'react-native';

export default class AccountComponent extends React.Component {
  static navigationOptions = {
    title: 'Account',
  };

  constructor(props) {
    super(props);
    this.state = {
      userLoggedIn: false
    };
  }

  async componentDidMount() {
    const userLoggedIn = await AsyncStorage.getItem('userToken');
    // TODO: get user data
    this.setState({ userLoggedIn: userLoggedIn });
  }

  async _signOutAsync() {
    await AsyncStorage.clear();
    this.setState({ userLoggedIn: false });
  };

  async _signInAsync() {
    this.props.navigation.navigate('SignIn')
  }

  render() {
    const { userLoggedIn } = this.state;
    if (userLoggedIn) {
      return <View>
        <Text>You are signed in!</Text>
        <Button title="Sign out!" onPress={this._signOutAsync.bind(this)} />
      </View>;
    } else {
      return <View>
        <Text>Please sign in...</Text>
        <Button title="Sign in!" onPress={this._signInAsync.bind(this)} />
      </View>;
    }
  }
}

/*
export default function AccountScreen() {
  return <AccountComponent />;
}

AccountScreen.navigationOptions = {
  title: 'Account',
};
*/
