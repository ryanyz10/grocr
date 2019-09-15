import React from 'react';
import { Platform } from 'react-native';
import { createSwitchNavigator, createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import DataScreen from '../screens/DataScreen';
import CameraScreen from '../screens/CameraScreen';
import AccountScreen from '../screens/AccountScreen';
import SignInScreen from '../screens/SignInScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const DataStack = createStackNavigator(
  {
    Data: DataScreen,
  },
  config
);

DataStack.navigationOptions = {
  tabBarLabel: 'Data',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-analytics` : 'md-analytics'}
    />
  ),
};

DataStack.path = '';


const AccountStack = createStackNavigator({Account: AccountScreen}, config);
const AuthStack = createStackNavigator({ SignIn: {screen: (props) => <SignInScreen {...props} nextScreen='Account'/>}, CreateUser: {screen: CreateAccountScreen}}, config);

const AccountSwitch = createSwitchNavigator(
  {
    Account: AccountStack,
    SignIn: AuthStack,
  },
  config
);

AccountSwitch.navigationOptions = {
  tabBarLabel: 'Account',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={ Platform.OS === 'ios' ? `ios-contact` : 'md-contact'}
    />
  ),
};

AccountSwitch.path = '';

const CameraStack = createStackNavigator(
  {
    Camera: CameraScreen,
  },
  config
);

CameraStack.navigationOptions = {
  tabBarLabel: 'Camera',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-camera`
          : 'md-camera'
      }
    />
  ),
};

CameraStack.path = '';

const tabNavigator = createBottomTabNavigator({
  DataStack,
  CameraStack,
  AccountStack: AccountSwitch
});

tabNavigator.path = '';

export default tabNavigator;
