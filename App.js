import React, { Component } from 'react';
import { Text, Picker, View, StyleSheet, Dimensions, Button } from 'react-native';
import { Constants, Accelerometer } from 'expo-sensors';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

export default class App extends Component {
  state = {
    // Of type accelermoterData, will be a json of arrays
    accelerometerDataTest: [],

    currentCollectIndex: 0,
    dropDownVal: [0,1,2],
    accelerometerDataHolder: [],
    initialTime: Date.now(),
    accelerometerData: { time: 0, x: 0, y: 0, z: 0 },
    recordData: false,
  };

  componentWillUnmount() {
    this._unsubscribeFromAccelerometer();
  }

  componentDidMount() {
    this._subscribeToAccelerometer();
  }

  componentWillMount() {
    const { width, height } = Dimensions.get('window');
    this.screenWidth = width;
    this.screenHeight = height;
    this.boxWidth = this.screenWidth / 10.0;
    let array = [[],[],[]]
    this.setState( {accelerometerDataTest: array})
  }

  _subscribeToAccelerometer = () => {
    this._accelerometerSubscription = Accelerometer.addListener(
      accelData => {
        let currentTime = Date.now();
        let intermediateValue = { time: (currentTime-this.state.initialTime), x: accelData.x, y: accelData.y, z: accelData.z }

        if(this.state.recordData){
          let newArray = [... this.state.accelerometerDataHolder, intermediateValue];
          this.setState((prevState, props) => {
            return {
              accelerometerDataHolder: newArray
            }
          })
        }
        this.setState((prevState, props) => {
          return {
            accelerometerData: intermediateValue,
          }
        })
      }
    );
  };

  pressButtonToLog = () => {
    // console.log(this.state.accelerometerDataTest);
    console.log(" Logging into text doc");
    this.saveFile()
  }

  saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      let stringToPrint = JSON.stringify(this.state.accelerometerDataTest);
      let fileUri = FileSystem.documentDirectory + "WAVES_TEST_ACCEL_DATA.txt";
      await FileSystem.writeAsStringAsync(fileUri, stringToPrint, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync("Download", asset, false)
  }
  }

  pressButtonToStart = () => {
    let {recordData, currentCollectIndex, accelerometerDataTest} = this.state

    if(recordData){
      this.pushDataToArray()
    }
    let currentTime = Date.now();
    this.setState((prevState, props) => {
      return {
        initialTime: currentTime,
        recordData: !prevState.recordData,
        accelerometerDataHolder: []
      }
    })
  }

  pressButtonToIncrement = () => {
    this.pushDataToArray()
  }

  pushDataToArray = () =>{
    let {accelerometerDataHolder, currentCollectIndex, accelerometerDataTest} = this.state
    let currentTime = Date.now();
    let array = accelerometerDataTest;
    array[currentCollectIndex].push(accelerometerDataHolder)
    this.setState((prevState, props) => {
      return {
        initialTime: currentTime,
        // Test this
        accelerometerDataTest: array,
        accelerometerDataHolder: [],
      }
    })

    this.testCurrentDataTest()
  }

  testCurrentDataTest = () => {
    let {accelerometerDataHolder, currentCollectIndex, accelerometerDataTest} = this.state
    console.log("==========TEST=============")
    accelerometerDataTest.forEach(dataArray =>{
      console.log("Arrray Length:" + dataArray.length);
    })
    console.log("===========================")
  }
// //accelermoterDataTest[prevstate.currentCollectIndex]: accelermoterDataTest[0].push(prevstate.accelerometerDataHolder)

_unsubscribeFromAccelerometer = () => {
  // this._accelerometerSubscription && this._acceleroMeterSubscription.remove();
  // this._accelerometerSubscription = null;
};

render() {
  let {currentCollectIndex, accelerometerDataTest} = this.state
  let startButton = (this.state.recordData)? "Stop": "Start"
  let arrayLength = accelerometerDataTest[currentCollectIndex].length;
  let takeNum = `TAKE: ${arrayLength}`
  let timeDisp = (this.state.recordData)? this.state.accelerometerData.time: 0
  return (
    <View style={styles.container}>
      {/* <View
        style={{
          position: 'absolute',
          top:
            (-this.screenHeight * (this.state.accelerometerData.y - 1.0)) /
              2.0 -
            this.boxWidth / 2.0,
          left:
            (this.screenWidth * (this.state.accelerometerData.x + 1.0)) /
              2.0 -
            this.boxWidth / 2.0,
          width: this.screenWidth / 10.0,
          height: this.screenWidth / 10.0,
          backgroundColor: '#056ECF',
        }}
      /> */}
      <View style={styles.textContainer}>
        {/* <Text style={styles.paragraph}>Tilt your phone to move the box!</Text> */}

        <Text style={styles.paragraph}>
          x = {this.state.accelerometerData.x.toFixed(2)}
          {', '}y = {this.state.accelerometerData.y.toFixed(2)}
          {', '}z = {this.state.accelerometerData.z.toFixed(2)}
          {', '}time = {timeDisp}

        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button style={styles.buttons} onPress={this.pressButtonToLog} title="LOG RESULTS"></Button>
        <Button style={styles.buttons} onPress={this.pressButtonToStart} title={startButton}></Button>
        <Button style={styles.buttons} onPress={this.pressButtonToIncrement} title={takeNum}></Button>
        <Button style={styles.buttons} onPress={this.testCurrentDataTest} title="Test"></Button>
        <Picker
          selectedValue={"G" + this.state.currentCollectIndex}
          onValueChange={currentCollectIndex => this.setState({ currentCollectIndex })}
          style={{ width: 50 }}
          mode="dropdown">
          <Picker.Item label="G1" value="0" />
          <Picker.Item label="G2" value="1" />
          <Picker.Item label="G3" value="2" />
        </Picker>
      </View>
    </View>
  );
}
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ecf0f1',
},
paragraph: {
  margin: 10,
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#34495e',
},
textContainer: {
  position: 'absolute',
  top: 40,
},
buttonContainer: {
  // backgroundColor: "#c7d9cc",
  width: 350,
  // height: 100,
  position: 'absolute',
  bottom: 100,
  flexDirection: "row",
  justifyContent: "space-around"
},
buttons:{
  // margin: 10,
  // width: 100,
  // height: 50,
}
});