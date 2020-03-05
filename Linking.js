import React, { Component } from 'react';
import { Button, Linking, View, StyleSheet } from 'react-native';
import { Constants, WebBrowser } from 'expo';

export class Link extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Button
          title="SMS"
          onPress={this._smsOpenWithLinking}
          style={styles.button}
        />
        <Button
          title="Music"
          onPress={this._musicOpenWithLinking}
          style={styles.button}
        />
        <Button
          title="Web"
          onPress={this._webOpenWithLinking}
          style={styles.button}
        />
        <Button
          title="Mail"
          onPress={this._mailOpenWithLinking}
          style={styles.button}
        />
        <Button
          title="Ride"
          onPress={this._rideOpenWithLinking}
          style={styles.button}
        />
      </View>
    );
  }
  
  _smsOpenWithLinking = () => {
    Linking.openURL('sms:+17037988538');
  }
  _musicOpenWithLinking = () => {
    Linking.openURL('spotify:');
  }
  _rideOpenWithLinking = () => {
    Linking.openURL('lyft:');
  }
  _webOpenWithLinking = () => {
    Linking.openURL('https://google.com');
  }
  _mailOpenWithLinking = () => {
    Linking.openURL('mailto:');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: 'space-around',
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  button: {
    // marginVertical: 10,
    margin: 10
  },
});
