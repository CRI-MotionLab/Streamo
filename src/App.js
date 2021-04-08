import React from 'react';
import {
  Dimensions,
  InteractionManager,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import {
//   setSensorsAccData,
//   setSensorsGyrData,
//   setSensorsMagData
// } from './store/actions';
// import { Constants } from 'react-native-unimodules';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import DataGizmo from './pages/DataGizmo';
import DataPlayground from './pages/DataPlayground';
import TouchZone from './pages/TouchZone';
import Footer from './components/Footer';

import sensors from './utils/Sensors';
import osc from './utils/Osc';
import { colors } from './utils/definitions';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.accelerometerValues = { x: 0, y: 0, z: 0 };
    this.filteredAccelerometerValues = { x: 0, y: 0, z: 0 };
    this.gyroscopeValues = { x: 0, y: 0, z: 0 };
    this.magnetometerValues = { x: 0, y: 0, z: 0 };
    this.normalizedMagnetometerValues = { x: 0, y: 0, z: 0 };

    this.oscId = null;
    this.rafId = null;
    this.lastSendDate = 0;
    this.sendInterval = 20;

    this.state = {
      acc: { ...this.accelerometerValues },
      filteredAcc: { ...this.filteredAccelerometerValues },
      gyr: { ...this.gyroscopeValues },
      mag: { ...this.magnetometerValues },
      normMag: { ...this.normalizedMagnetometerValues },
    };

    activateKeepAwake();

    // NB : we mutate the sensorValues objects on purpose so that they don't
    // trigger renders in child components, and we use requestAnimationFrame
    // in the children to display their values instead

    const unsubscribeAcc = sensors.addListener('accelerometer', data => {
      let { x, y, z, timestamp } = data;
      // this.accelerometerValues = { x, y, z };
      this.accelerometerValues.x = x;
      this.accelerometerValues.y = y;
      this.accelerometerValues.z = z;
      this.setState({ acc: this.accelerometerValues });
      // this.props.setSensorsAccData(data);
    });

    const unsubscribeFilteredAcc = sensors.addListener('filteredAccelerometer', data => {
      let { x, y, z, timestamp } = data;
      // this.filteredAccelerometerValues = { x, y, z };
      this.filteredAccelerometerValues.x = x;
      this.filteredAccelerometerValues.y = y;
      this.filteredAccelerometerValues.z = z;
      this.setState({ filteredAcc: this.filteredAccelerometerValues });
    });

    const unsubscribeGyr = sensors.addListener('gyroscope', data => {
      let { x, y, z, timestamp } = data;
      // this.gyroscopeValues = { x, y, z };
      this.gyroscopeValues.x = x;
      this.gyroscopeValues.y = y;
      this.gyroscopeValues.z = z;
      this.setState({ gyr: this.gyroscopeValues });
      // this.props.setSensorsGyrData(data);
    });

    const unsubscribeMag = sensors.addListener('magnetometer', data => {
      let { x, y, z, timestamp } = data;
      // this.magnetometerValues = { x, y, z };
      this.magnetometerValues.x = x;
      this.magnetometerValues.y = y;
      this.magnetometerValues.z = z;
      this.setState({ mag: this.magnetometerValues });
      // this.props.setSensorsMagData(data);
    });

    const unsubscribeNormMag = sensors.addListener('normalizedMagnetometer', data => {
      let { x, y, z, timestamp } = data;
      // this.normalizedMagnetometerValues = { x, y, z };
      this.normalizedMagnetometerValues.x = x;
      this.normalizedMagnetometerValues.y = y;
      this.normalizedMagnetometerValues.z = z;
      this.setState({ normMag: this.normalizedMagnetometerValues });
    })

    this.sendOscFrame = this.sendOscFrame.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
  }

  componentDidMount() {
    // todo : use setTimeout instead of setInterval to avoid iteration overlap !!! (and lagging)
    // this.tiId = setTimeout(this.sendOscFrame, 20);
    // this.tiId = setInterval(this.sendOscFrame, 20);
    // SplashScreen.hide();
    this.oscId = requestAnimationFrame(this.sendOscFrame);
    // this.rafId = requestAnimationFrame(this.updateAnimation);
  }

  componentDidUpdate(prevProps) {
    if (this.props.osc !== prevProps.osc) {
      if (this.props.osc.targetIsValid) {
        const [ ip, port ] = this.props.osc.target.split(':');
        osc.setTarget(ip, port);
      }
    }

    if (this.props.context.contextReady !== prevProps.context.contextReady &&
        this.props.context.contextReady) {
      SplashScreen.hide();
    }
  }

  componentWillUnmount() {
    // todo :
    // sensors seem to overflow some buffer after a while in background mode
    // and take some time to recover when the app come back to foreground
    // => check if deactivating / reactivating sensor polling fixes it

    // clearTimeout(this.tiId);
    // clearInterval(this.tiId)
    cancelAnimationFrame(this.oscId);
    // cancelAnimationFrame(this.rafId);
  }

  sendOscFrame() {
    // this.tiId = setTimeout(this.sendOscFrame, 20);
    this.oscId = requestAnimationFrame(this.sendOscFrame);

    if (this.props.osc.isSending) {
      osc.sendMessage('/streamo', [
        'streamo',
        ...Object.values(this.accelerometerValues),
        ...Object.values(this.gyroscopeValues),
        ...Object.values(this.normalizedMagnetometerValues),
      ]);
    }
  }

  updateAnimation() {
    this.rafId = requestAnimationFrame(this.updateAnimation);

    // const now = Date.now();
    // if (now - this.lastSendDate > this.sendInterval) {
    //   // this.sendOscFrame();
    //   // console.log(now - this.lastSendDate);
    //   this.lastSendDate = now;
    // }
    this.sendOscFrame();

    // values are updated (immutated) in callbacks
    // cancelAnimationFrame(this.rafId);

    // this.setState({
    //   acc: this.accelerometerValues,
    //   filteredAcc: this.filteredAccelerometerValues,
    //   gyr: this.gyroscopeValues,
    //   mag: this.magnetometerValues,
    //   normMag: this.normalizedMagnetometerValues,
    // });
  }

  render() {
    const { currentRoute } = this.props.navigation;

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
        <DataGizmo
          enabled={currentRoute === 'gizmo'}
          acc={this.state.acc}
          gyr={this.state.gyr}
          mag={this.state.mag}
        />
        <DataPlayground
          enabled={currentRoute === 'playground'}
          acc={this.state.acc}
          filteredAcc={this.state.filteredAcc}
          gyr={this.state.gyr}
          mag={this.state.mag}
          normMag={this.state.normMag}
        />
        <TouchZone
          enabled={currentRoute === 'touchzone'}
        />
        </View>
        <Footer />
      </View>
    );
  }
};

const mapStateToProps = state => {
  const { navigation, osc, context } = state;
  return { navigation, osc, context };
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    // setSensorsAccData,
    // setSensorsGyrData,
    // setSensorsMagData
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
