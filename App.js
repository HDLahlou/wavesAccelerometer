import React, { Component } from 'react';
import { Text, Picker, View, StyleSheet, Dimensions, Button, Platform } from 'react-native';
import SwitchToggle from "react-native-switch-toggle";
import RNPickerSelect from 'react-native-picker-select';
import CountdownCircle from 'react-native-countdown-circle'
import { Constants, Accelerometer, Gyroscope } from 'expo-sensors';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import link from "./Linking"
import * as BackgroundFetch from 'expo-background-fetch'
export default class App extends Component<{}> {
  state = {
    text: '',
    switchOnToggle: false,
    // State Variables for Accelerometer Data
    accelerometerDataTest: [[], [], [], [], [], []],
    accelerometerData: { time: 0, x: 0, y: 0, z: 0 },
    accelerometerDataHolder: [],
    // State Variables for Gyroscope Data
    gyroscopeDataTest: [[], [], [], [], [], []],
    gyroscopeData: { time: 0, x: 0, y: 0, z: 0 },
    gyroscopeDataHolder: [],
    // General State Variables
    currentCollectIndex: 0,
    initialTime: Date.now(),
    recordData: false,
    testMode: false,
    postURL: 'http://ec10f87b-6c85-4b3f-afcd-3962158184e4.eastus.azurecontainer.io/score',
  };

  /*
  Front End: Logo, start/stop button for subscriptions, Map 3 gestures to a certain action
  */


  componentWillUnmount() {
    this._unsubscribeFromAccelerometer();
    this._unsubscribeFromGyroscope();
  }

  componentDidMount() {
    this._subscribeToAccelerometer();
    this._subscribeToGyroscope();
    // console.log(this.state.initialTime);
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
        let intermediateValue = { time: (currentTime - this.state.initialTime), x: accelData.x, y: accelData.y, z: accelData.z }

        if (this.state.testMode) {
          if (this.state.recordData) {
            let newArray = [... this.state.accelerometerDataHolder, intermediateValue];
            this.setState((prevState, props) => {
              return {
                accelerometerDataHolder: newArray
              }
            })
          }
        } else {
          if (this.state.recordData) {
            if (intermediateValue.time < 3000) {
              let newArray = [... this.state.accelerometerDataHolder, intermediateValue];
              this.setState((prevState, props) => {
                return {
                  accelerometerDataHolder: newArray
                }
              })
            } else {
              console.log("Ending data recording");
              // this.sendDataToInterpret(this.state.accelerometerDataHolder, this.state.gyroscopeDataHolder);
              this.pushDataToArrayTEMP(this.state.accelerometerDataHolder, this.state.gyroscopeDataHolder);

              this.setState((prevState, props) => {
                return {
                  initialTime: currentTime,
                  recordData: !prevState.recordData,
                  accelerometerDataHolder: [],
                  gyroscopeDataHolder: []
                }
              })
            }
          } else {
            if (Math.abs(intermediateValue.x) > .75 && intermediateValue.y < -.75 && intermediateValue.z > .75) {
              console.log("Commencing Data Recording:");
              this.setState((prevState, props) => {
                return {
                  recordData: !prevState.recordData,
                  initialTime: currentTime,

                }
              })
            }
          }
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
    // this._accelerometerSubscription && 
    this._acceleroMeterSubscription.remove();
    this._accelerometerSubscription = null;
  };
  /****************************************/

  /**********GYROSCOPE LISTENER*********/
  _subscribeToGyroscope = () => {
    this._gyroSubscription = Gyroscope.addListener(gyroscopeData => {
      let currentTime = Date.now();
      let intermediateValue = { time: (currentTime - this.state.initialTime), x: gyroscopeData.x, y: gyroscopeData.y, z: gyroscopeData.z }
      if (this.state.testMode) {
        if (this.state.recordData) {
          let newArray = [... this.state.gyroscopeDataHolder, intermediateValue];
          this.setState((prevState, props) => {
            return {
              gyroscopeDataHolder: newArray
            }
          })
        }
      } else {
        if (this.state.recordData && intermediateValue.time < 3000) {
          let newArray = [... this.state.gyroscopeDataHolder, intermediateValue];
          this.setState((prevState, props) => {
            return {
              gyroscopeDataHolder: newArray
            }
          })
        }
      }

      this.setState((prevState, props) => {
        return {
          gyroscopeData: intermediateValue,
        }
      })
    });
  };

  _unsubscribeFromGyroscope = () => {
    // this._gyroSubscription && 
    this._gyroSubscription.remove();
    this._gyroSubscription = null;
  };
  /****************************************/
  // ===========FUNCTIONS FOR PRODUCTION===========
  // Sends data to be interpreted
  sendDataToInterpret = async (accel, gyro) => {
    try {
      let response = await
        fetch(this.state.postURL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accel: accel,
            gyro: gyro,
          }),
        });
      let responseJson = await response.json();
      console.log(responseJson)
      /*
      switch(responseJson){
        case 0:
          link._smsOpenWithLinking()
          break;
        case 1:
          link._mailOpenWithLinking()
          break;
        case 2:
          link._musicOpenWithLinking()
          break;
        case 3:
          link._rideOpenWithLinking()
          break;
        default:
          console.log("No model was matched");
      }
      */
      return 1;
    } catch (error) {
      console.error(error);
    }
  }

  getButtonText() {
    return this.state.switchOnToggle ? "" : "";
  }

  getRightText() {
    return this.state.switchOnToggle ? "" : "Off";
  }

  getLeftText() {
    return this.state.switchOnToggle ? "On" : "";
  }


  // TODO: Delete These funcs below

  // Func to add current recording to array
  pushDataToArrayTEMP = (accel, gyro) => {
    let { accelerometerDataHolder, currentCollectIndex, accelerometerDataTest, gyroscopeDataHolder, gyroscopeDataTest } = this.state
    let currentTime = Date.now();
    let arrayAccel = accelerometerDataTest;
    arrayAccel[currentCollectIndex].push(accel)
    let arrayGyro = gyroscopeDataTest;
    arrayGyro[currentCollectIndex].push(gyro)
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

  pressButtonToLogTEMP = () => {
    // console.log(this.state.accelerometerDataTest);
    console.log(" Logging into text doc");
    this.saveFileTEMP()
  }

  // Method to save data to txt file
  saveFileTEMP = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      // let accelStringToPrint = JSON.stringify(this.state.accelerometerDataTest[0]);
      // let gyroStringToPrint = JSON.stringify(this.state.gyroscopeDataTest[0]);
      let stringToPrint = JSON.stringify({ accel: this.state.accelerometerDataTest[0], gyro: this.state.gyroscopeDataTest[0] })
      let fileUri = FileSystem.documentDirectory + "WAVES_TEST_ACCEL_GYRO_DATA_WITH_FLICK.txt";
      await FileSystem.writeAsStringAsync(fileUri, stringToPrint, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync("Download", asset, false)
    }
  }

  // ======================
  // ===========FUNCTIONS FOR DATA COLLECTING AND TESTING===========
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
    let { recordData, currentCollectIndex, accelerometerDataTest, gyroscopeDataTest } = this.state
    let arrayLength = accelerometerDataTest[currentCollectIndex].length;
    if (!recordData && arrayLength) {
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
    let { recordData, currentCollectIndex, accelerometerDataTest } = this.state

    if (recordData) {
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
  pushDataToArray = () => {
    let { accelerometerDataHolder, currentCollectIndex, accelerometerDataTest, gyroscopeDataHolder, gyroscopeDataTest } = this.state
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
    let { accelerometerDataHolder, currentCollectIndex, accelerometerDataTest, gyroscopeDataTest } = this.state
    console.log("==========TEST=============")
    accelerometerDataTest.forEach(dataArray => {
      console.log("Accel Arrray Length:" + dataArray.length);
    })
    gyroscopeDataTest.forEach(dataArray => {
      console.log("Gyro Arrray Length:" + dataArray.length);
    })
    console.log("===========================")
  }
  // ======================
  // RENDER
  render() {
    let { currentCollectIndex, accelerometerDataTest, testMode } = this.state
    let startButton = (this.state.recordData) ? "Stop" : "Start"
    let arrayLength = accelerometerDataTest[currentCollectIndex].length;
    let takeNum = `TAKE: ${arrayLength}`
    let timeDisp = (this.state.recordData) ? this.state.accelerometerData.time : 0
    // Deafault to show production and hide test
    let testDisplay = styles.hideContainer;
    let productionDisplay = styles.container;
    if (testMode) {
      testDisplay = styles.container;
      productionDisplay = styles.hideContainer;
    }
    return (
      <View style={styles.container}>
        {/* CONTAINER FOR DATA COLLECTION */}
        <View style={testDisplay}>
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
          {/* <View style={styles.buttonContainer}>
            <Link/>
          </View> */}
        </View>
        <View style={productionDisplay}>
        <View style={styles.logo}>
        <Text style={styles.h1}>
            {'Logo' /*TODO @angelawholiu*/}
          </Text>
          </View>
          {/*TODO @angelawholiu: add info button w instr on how to use */} 
          <View style={styles.center}>
          <Text style={styles.h2}>
              {'Turn on Detection'}
            </Text>
            <SwitchToggle
              buttonText={this.getButtonText()}
              backTextRight={this.getRightText()}
              backTextLeft={this.getLeftText()}
              type={1}
              buttonTextStyle={{ fontSize: 16 }}
              textRightStyle={{ fontSize: 16 }}
              textLeftStyle={{ fontSize: 16, color: "#007fff" }}
              // Toggle button-specific styling
              containerStyle={{
                marginTop: 5,
                width: 108,
                height: 48,
                borderRadius: 25,
                backgroundColor: "ref",
                padding: 5
              }}
              circleStyle={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "white"
              }}
              buttonStyle={{
                alignItems: "center",
                justifyContent: "center",
                position: "absolute"
              }}
              rightContainerStyle={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
              leftContainerStyle={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-start"
              }}
              switchOn={this.state.switchOnToggle}
              onPress={this.onPressToggle}
              circleColorOff="white"
              circleColorOn="#007fff"
              duration={500}
            />
          </View>
          <View style={{ marginTop: "150%", alignItems: 'center' }}>
            <Text style={styles.h2}>
              {'Customize Gesture Actions'}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.h5}>
                {'Gesture 1'}
              </Text>
              <RNPickerSelect // TODO @HDLahlou: map to actions
                onValueChange={(value) => console.log(value)}
                items={[
                  { label: 'Play Music', value: 'music' },
                  { label: 'Mail Refresh', value: 'mail' },
                  { label: 'Send Text', value: 'sms' },
                ]}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.h5}>
                {'Gesture 2'}
              </Text>
              <RNPickerSelect
                onValueChange={(value) => console.log(value)}
                items={[
                  { label: 'Play Music', value: 'music' },
                  { label: 'Mail Refresh', value: 'mail' },
                  { label: 'Send Text', value: 'sms' },
                ]}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.h5}>
                {'Gesture 3'}
              </Text>
              <RNPickerSelect
                onValueChange={(value) => console.log(value)}
                items={[
                  { label: 'Play Music', value: 'music' },
                  { label: 'Mail Refresh', value: 'mail' },
                  { label: 'Send Text', value: 'sms' },
                ]}
              />
            </View>
          </View>
          <View style={{marginTop: 50, alignItems: 'center'}}>
          <Text style={styles.h2}>
              {'Time Left to Perform Gesture'}
            </Text>
            {/* TODO: @HDLahlou: map to time until gesture timeout  */}
          <CountdownCircle
            seconds={10}
            radius={30}
            borderWidth={8}
            color="#007fff"
            bgColor="#fff"
            textStyle={{ fontSize: 20 }}
            onTimeElapsed={() => console.log('Elapsed!')}
        />
        </View>
        </View>
      </View>
    );
  }
  onPressToggle = () => {
    this.setState({ switchOnToggle: !this.state.switchOnToggle });
  };
}


// STYLING
const styles = StyleSheet.create({
  hideContainer: {
    display: "none",
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  h1: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007fff',
  },
  paragraph: {
    margin: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  h5: {
    fontSize: 15,
    marginTop: 3,
    marginRight: 5,
    fontWeight: '100',
  },
  textContainer: {
    position: 'absolute',
    top: 40,
  },
  logo: {
    position: 'absolute',
    top: 60,
  },
  center: {
    position: 'absolute',
    top: '40%',
    alignItems:'center',
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
  buttons: {
    borderRadius: '25px',
    // margin: 10,
    // width: 100,
    // height: 50,
  }
});