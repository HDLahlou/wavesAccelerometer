import React, { Component } from 'react';
import { Text, Picker, View, StyleSheet, Dimensions, Button } from 'react-native';
import { Constants, Accelerometer, Gyroscope } from 'expo-sensors';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { Link } from "./Linking"
export default class App extends Component<{}> {
  state = {
    // State Variables for Accelerometer Data
    accelerometerDataTest: [[],[],[],[],[],[]],
    accelerometerData: { time: 0, x: 0, y: 0, z: 0 },
    accelerometerDataHolder: [],
    // State Variables for Gyroscope Data
    gyroscopeDataTest: [[],[],[],[],[],[]],
    gyroscopeData: { time: 0, x: 0, y: 0, z: 0 },
    gyroscopeDataHolder: [],
    // General State Variables
    currentCollectIndex: 0,
    initialTime: Date.now(),
    recordData: false,
  };

  componentWillUnmount() {
    this._unsubscribeFromAccelerometer();
    this._unsubscribeFromGyroscope();
  }

  componentDidMount() {
    this._subscribeToAccelerometer();
    this._subscribeToGyroscope();
  }

  componentWillMount() {
    // let array = [[],[],[]]
    // this.setState( {accelerometerDataTest: array, gyroscopeDataTest: array})
  }

/**********ACCELEROMETER LISTENER*********/
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

  _unsubscribeFromAccelerometer = () => {
    // this._accelerometerSubscription && this._acceleroMeterSubscription.remove();
    // this._accelerometerSubscription = null;
  };
/****************************************/

/**********GYROSCOPE LISTENER*********/
_subscribeToGyroscope = () => {
  this._gyroSubscription = Gyroscope.addListener(gyroscopeData => {
    let currentTime = Date.now();
    let intermediateValue = { time: (currentTime-this.state.initialTime), x: gyroscopeData.x, y: gyroscopeData.y, z: gyroscopeData.z}
    if(this.state.recordData){
      let newArray = [... this.state.gyroscopeDataHolder, intermediateValue];
      this.setState((prevState, props) => {
        return {
          gyroscopeDataHolder: newArray
        }
      })
    }
    this.setState((prevState, props) => {
      return {
        gyroscopeData: intermediateValue,
      }
    })
  });
};

_unsubscribeFromGyroscope = () => {
  this._gyroSubscription && this._gyroSubscription.remove();
  this._gyroSubscription = null;
};
/****************************************/

// Saves the current Accel Data into a text document
  pressButtonToLog = () => {
    // console.log(this.state.accelerometerDataTest);
    console.log(" Logging into text doc");
    this.saveFile()
  }

  // Method to save data to txt file
  saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      let accelStringToPrint = JSON.stringify(this.state.accelerometerDataTest);
      let gyroStringToPrint = JSON.stringify(this.state.gyroscopeDataTest);
      let stringToPrint = `Accelerometer:\n${accelStringToPrint}\nGyroscope:\n${gyroStringToPrint}`
      let fileUri = FileSystem.documentDirectory + "WAVES_TEST_ACCEL_GYRO_DATA.txt";
      await FileSystem.writeAsStringAsync(fileUri, stringToPrint, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync("Download", asset, false)
  }
  }

// Removes most recent value in array
removeLastEntry = () => {
  let {recordData, currentCollectIndex, accelerometerDataTest, gyroscopeDataTest} = this.state
  let arrayLength = accelerometerDataTest[currentCollectIndex].length;
  if(!recordData && arrayLength){
    let arrayAccel = accelerometerDataTest;
    arrayAccel[currentCollectIndex].pop();
    let arrayGyro = gyroscopeDataTest;
    arrayGyro[currentCollectIndex].pop();
    this.setState((prevState, props) => {
      return {
        accelerometerDataTest: arrayAccel,
        accelerometerDataHolder: [],
        gyroscopeDataTest: arrayGyro,
        gyroscopeDataHolder: [],
      }
    })
    this.testCurrentDataTest()
  }
}

// Starts recording data and initializes variables
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
        accelerometerDataHolder: [],
        gyroscopeDataHolder: []
      }
    })
  }

// Calls func to add data to array
  pressButtonToIncrement = () => {
    this.pushDataToArray()
  }

// Func to add current recording to array
  pushDataToArray = () =>{
    let {accelerometerDataHolder, currentCollectIndex, accelerometerDataTest, gyroscopeDataHolder, gyroscopeDataTest} = this.state
    let currentTime = Date.now();
    let arrayAccel = accelerometerDataTest;
    arrayAccel[currentCollectIndex].push(accelerometerDataHolder)
    let arrayGyro = gyroscopeDataTest;
    arrayGyro[currentCollectIndex].push(gyroscopeDataHolder)
    this.setState((prevState, props) => {
      return {
        initialTime: currentTime,
        accelerometerDataTest: arrayAccel,
        accelerometerDataHolder: [],
        gyroscopeDataTest: arrayGyro,
        gyroscopeDataHolder: [],
      }
    })

    this.testCurrentDataTest()
  }
// TEST: Prints current size of data holders
  testCurrentDataTest = () => {
    let {accelerometerDataHolder, currentCollectIndex, accelerometerDataTest, gyroscopeDataTest} = this.state
    console.log("==========TEST=============")
    accelerometerDataTest.forEach(dataArray =>{
      console.log("Accel Arrray Length:" + dataArray.length);
    })
    gyroscopeDataTest.forEach(dataArray =>{
      console.log("Gyro Arrray Length:" + dataArray.length);
    })
    console.log("===========================")
  }

// RENDER
render() {
  let {currentCollectIndex, accelerometerDataTest} = this.state
  let startButton = (this.state.recordData)? "Stop": "Start"
  let arrayLength = accelerometerDataTest[currentCollectIndex].length;
  let takeNum = `TAKE: ${arrayLength}`
  let timeDisp = (this.state.recordData)? this.state.accelerometerData.time: 0
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.paragraph}>
          {takeNum}
        </Text>
        <Text style={styles.paragraph}>
          {'Accel: '}
          x = {this.state.accelerometerData.x.toFixed(2)}
          {', '}y = {this.state.accelerometerData.y.toFixed(2)}
          {', '}z = {this.state.accelerometerData.z.toFixed(2)}
          {', '}time = {timeDisp}
        </Text>
        <Text style={styles.paragraph}>
          {'Gyro: '}
          x = {this.state.gyroscopeData.x.toFixed(2)}
          {', '}y = {this.state.gyroscopeData.y.toFixed(2)}
          {', '}z = {this.state.gyroscopeData.z.toFixed(2)}
          {', '}time = {timeDisp}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button style={styles.buttons} onPress={this.pressButtonToLog} title="LOG RESULTS"></Button>
        <Button style={styles.buttons} onPress={this.pressButtonToStart} title={startButton}></Button>
        {/* <Button style={styles.buttons} onPress={this.pressButtonToIncrement} title={takeNum}></Button> */}
        <Button style={styles.buttons} onPress={this.testCurrentDataTest} title="Test"></Button>
        <Button style={styles.buttons} onPress={this.removeLastEntry} title="Drop Last"></Button>
        <Picker
          selectedValue={"G" + this.state.currentCollectIndex}
          onValueChange={currentCollectIndex => this.setState({ currentCollectIndex })}
          style={{ width: 50 }}
          mode="dropdown">
          <Picker.Item label="G0" value="0" />
          <Picker.Item label="G1" value="1" />
          <Picker.Item label="G2" value="2" />
          <Picker.Item label="G3" value="3" />
          <Picker.Item label="G4" value="4" />
          <Picker.Item label="G5" value="5" />
        </Picker>
      </View>
      <View style={styles.buttonContainer}>
        <Link/>
      </View>
    </View>
  );
}
}


// STYLING
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
  position: 'relative',
  top: 150,
  flexDirection: "row",
  justifyContent: "space-around",
  flexWrap: "wrap",
  margin: 10,
},
buttons:{
  // margin: 10,
  // width: 100,
  // height: 50,
}
});