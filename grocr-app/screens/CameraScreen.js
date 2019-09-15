import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { Platform } from '@unimodules/core';
import { Icon } from 'react-native-elements'
import { withNavigationFocus } from 'react-navigation'

class CameraComponent extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  async takePhoto() {
      if (this.camera) {
        console.log('taking photo');
        await this.camera.takePictureAsync({
            quality: 1,
            base64: true,
            onPictureSaved: data => {
              console.log(data);
            }
        });
      }
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type} ref={ref => {this.camera = ref;}}>
            <View style={{flex:6}}/>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(52, 52, 52, 0.6)',
                // justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <View style={{flex: 1}} />
              <TouchableOpacity 
                style={{
                  flex: 1,
                  width:60,
                  height:60, 
                  borderRadius:30,
                  backgroundColor:"#fff",
                  alignSelf: 'center',
                  alignContent: 'center',
                  justifyContent: 'center'
                }}
                onPress={this.takePhoto.bind(this)}>
                <Icon name={Platform.OS === 'ios' ? 'ios-camera' : 'md-camera'} type='ionicon' />
              </TouchableOpacity>
              <View style={{flex:1}}/>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

export default function CameraScreen() {
  return <CameraComponent />;
}

CameraScreen.navigationOptions = {
  title: 'Camera',
};