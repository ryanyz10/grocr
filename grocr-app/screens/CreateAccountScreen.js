import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Alert
} from 'react-native';

import FormTextInput from '../components/FormTextInput';
import Button from '../components/Button';
import colors from "../config/colors";
import strings from "../config/strings";

export default class CreateAccountScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      username: "",
      email: "",
      password: ""
    }
  }

  static navigationOptions = {
    title: 'Create User',
  };

  handleNameChange = (name) => {
    this.setState({ name: name });
  }

  handleEmailChange = (email) => {
    this.setState({ email: email });
  };

  handlePasswordChange = (password) => {
    this.setState({ password: password });
  };

  handleUsernameChange = (username) => {
    this.setState({ username: username });
  };

  _createUserAsync = async () => {
    if(!this.state.name || !this.state.username ||
        !this.state.email || !this.state.password) {
      await Alert.alert(
          'A field was left empty.',
          'Please ensure all fields are filled.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable: false}
      );
    }
    try {
      const response = await fetch('http://172.16.142.133:8000/createUser', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.name,
          username: this.state.username,
          email: this.state.email,
          password: this.state.password
        }),
      });

      let token;
      if (await !response.ok) {
        throw new Error(`${response.status}`);
      } else {
        token = response.headers.map.token;
      }
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error(error);
    }
    this.props.navigation.navigate('App');
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.form}>
          <FormTextInput
            value={this.state.name}
            onChangeText={this.handleNameChange.bind(this)}
            placeholder={strings.NAME_PLACEHOLDER}
            autoCorrect={false}
            returnKeyType="next"
          />
          <FormTextInput
            value={this.state.username}
            onChangeText={this.handleUsernameChange.bind(this)}
            placeholder={strings.USERNAME_PLACEHOLDER}
            autoCorrect={false}
            returnKeyType="next"
          />
          <FormTextInput
            value={this.state.email}
            onChangeText={this.handleEmailChange.bind(this)}
            placeholder={strings.EMAIL_PLACEHOLDER}
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />
          <FormTextInput
            value={this.state.password}
            onChangeText={this.handlePasswordChange.bind(this)}
            placeholder={strings.PASSWORD_PLACEHOLDER}
            secureTextEntry={true}
            returnKeyType="done"
          />
          <Button label={strings.CREATE} onPress={this._createUserAsync.bind(this)} />
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