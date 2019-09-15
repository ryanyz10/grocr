import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView 
} from 'react-native';

import base64 from 'base-64';

import imageLogo from "../assets/images/logo.png";
import FormTextInput from '../components/FormTextInput';
import Button from '../components/Button';
import colors from "../config/colors";
import strings from "../config/strings";

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }

  static navigationOptions = {
    title: 'Please sign in...',
  };

  handleUsernameChange = (username) => {
    this.setState({ username: username });
  };

  handlePasswordChange = (password) => {
    this.setState({ password: password });
  };

  handleUsernameSubmitPress = () => {
    if (this.passwordInputRef.current) {
      this.passwordInputRef.current.focus();
    }
  };

  _signInAsync = async () => {
    try {
      const response = await fetch('http://172.16.142.133:8000/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'username': `${this.state.username}`,
          'password': `${this.state.password}`
        }
      });
      let token;
      if (await !response.ok) {
        throw new Error(`Error ${response.status} received`);
      } else {
        token = response.headers.map.token;
      }
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error(error);
    }
    // TODO: save token response to AsyncStorage
    this.props.navigation.navigate(this.props.nextScreen);
  };

  _createUser = () => {
    this.props.navigation.navigate('CreateUser');
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Image source={imageLogo} style={styles.logo} />
        <View style={styles.form}>
          <FormTextInput
            value={this.state.username}
            onChangeText={this.handleUsernameChange.bind(this)}
            onSubmitEditing={this.handleUsernameSubmitPress.bind(this)}
            placeholder={strings.USERNAME_PLACEHOLDER}
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />
          <FormTextInput
            value={this.state.password}
            ref={ref => {this.passwordInputRef = ref;}}
            onChangeText={this.handlePasswordChange.bind(this)}
            placeholder={strings.PASSWORD_PLACEHOLDER}
            secureTextEntry={true}
            returnKeyType="done"
          />
          <Button label={strings.LOGIN} onPress={this._signInAsync.bind(this)} />
          <Button label={strings.CREATE} onPress={this._createUser.bind(this)} />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
    alignSelf: "center"
  },
  form: {
    flex: 1,
    justifyContent: "center",
    width: "80%"
  }
});