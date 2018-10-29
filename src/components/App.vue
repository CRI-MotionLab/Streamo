<template>
  <div id="app">
    <lightbox />
    <div id="tabs">
      <router-link to="/all" id="all-tab" class="tab">
        All
      </router-link>
      <router-link to="/accel" id="accel-tab" class="tab">
        Accel
      </router-link>
      <router-link to="/gyro" id="gyro-tab" class="tab">
        Gyro
      </router-link>
      <router-link to="/magneto" id="magneto-tab" class="tab">
        Magneto
      </router-link>
      <router-link to="/settings" id="settings-tab" class="tab">
        <!-- Settings -->
        <img id="settings-icon">
      </router-link>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import LightBox from './LightBox.vue';
import router from '../js/router';

export default {
  router,
  components: {
    lightbox: LightBox,
  },
  props: [ 'childReady', 'inputPort' ],
  watch: {
    childReady: {
      immediate: true,
      deep: true,
      handler: function(val) {
        if (val) this.init();
      },
    },
    inputPort: {
      handler: function(val) {
        this.startListeningOSC(val);
      }
    }
  },
  methods: {
    init() {
      // window.osc.startListening(this.$store.state.oscConfig.inputPort, () => {
      //   console.log('...  now listening');
      // }, (err) => console.error(err));
      // this.startListeningOSC(this.$store.state.oscConfig.inputPort);

      // faking accelerometer for tests in emulator
      // setInterval(() => {
      //   const amp = 3;
      //   const offset = -1.5;
      //   this.$store.commit('updateAccGyrValues', {
      //     x: Math.random() * amp + offset,
      //     y: Math.random() * amp + offset,
      //     z: Math.random() * amp + offset,
      //     alpha: Math.random * 180,
      //     beta: Math.random * 180,
      //     gamma: Math.random * 180,
      //   });
      // }, 50);

      this.constantVibratorInterval = null;
      this.wasConstantlyVibrating = false;
      this.pulseVibratorInterval = null;
      this.vibOn = 0;
      this.vibOff = 0;
      this.vibTimes = 0;
      this.vibCnt = 0;

      this.startListeningDeviceMotion();
      this.startListeningDeviceOrientation();
      this.startListeningMagnetometer();
      this.startSendingOSC();
      // this.startListeningOSC(this.$store.state.oscConfig.inputPort); // really needed ?
    },
    startListeningDeviceMotion() {
      window.addEventListener('devicemotion', this.onDeviceMotion, true);
    },
    stopListeningDeviceMotion() {
      window.removeEventListener('devicemotion', this.onDeviceMotion);
    },
    onDeviceMotion(e) {
      const values = {};

      if (e.accelerationIncludingGravity &&
          e.accelerationIncludingGravity.x &&
          e.accelerationIncludingGravity.y &&
          e.accelerationIncludingGravity.z) {

        values.x = e.accelerationIncludingGravity.x;
        values.y = e.accelerationIncludingGravity.y;
        values.z = e.accelerationIncludingGravity.z;

        if (e.rotationRate &&
            e.rotationRate.alpha &&
            e.rotationRate.beta &&
            e.rotationRate.gamma) {

          values.alpha = e.rotationRate.alpha;
          values.beta = e.rotationRate.beta;
          values.gamma = e.rotationRate.gamma;
        }

        // we commit even if the phone doesn't have a gyroscope
        // (angular velocities will remain equal to zero)
        this.$store.commit('updateAccGyrValues', values);
      }

      // this.sendOSC('/accel', [ values.accx, values.accy, values.accz ]);
    },
    startListeningDeviceOrientation() {
      window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
    },
    stopListeningDeviceOrientation() {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    },
    onDeviceOrientation(e) {
      const values = {};

      if (e.alpha && e.beta && e.gamma) {
        values.alpha = e.alpha;
        values.beta = e.beta;
        values.gamma = e.gamma;

        // this shouldn't be pushed into magValues
        // use a plugin for this instead
        // this.$store.commit('updateSensorValues', {
        //   whichSensorValues: 'magValues',
        //   values: values,
        // });
      }
    },
    startListeningMagnetometer() {
      this.magWatchId = cordova.plugins.magnetometer.watchReadings(
        this.onMagReadSuccess,
        this.onMagReadError,
      );
    },
    stopListeningMagnetometer() {
      cordova.plugins.magnetometer.stop([ this.magWatchId ]);
    },
    onMagReadSuccess(reading) {
      // console.log(reading);
      if (reading.magnitude && reading.x && reading.y && reading.z) {
        this.$store.commit('updateMagValues', {
          x: reading.x,
          y: reading.y,
          z: reading.z,
        });

        const ranges = {};
        const values = {};

        [ 'x', 'y', 'z' ].forEach((c) => {
          const val = reading[c];
          const range = {
            min: this.$store.state.magRanges[c].min,
            max: this.$store.state.magRanges[c].max,
          };

          if (val < range.min) { range.min = val; }
          if (val > range.max) { range.max = val; }

          if (range.min !== range.max) {
            values[c] = ((val - range.min) / (range.max - range.min)) * 2 - 1
          }

          ranges[c] = { min: range.min, max: range.max };
        });

        this.$store.commit('updateNormalizedMagValues', values);
        this.$store.commit('updateMagRanges', ranges);
      }
    },
    onMagReadError(message) {
      // console.error(message);
    },
    startSendingOSC(interval = 10) { // interval between consecutive frames in ms
      this.sendOscId = setInterval(() => {
        this.sendOSC('/streamo', [
          this.$store.state.oscConfig.deviceIdentifier,
          this.$store.state.accGyrValues.x,
          this.$store.state.accGyrValues.y,
          this.$store.state.accGyrValues.z,
          this.$store.state.accGyrValues.alpha,
          this.$store.state.accGyrValues.beta,
          this.$store.state.accGyrValues.gamma,
          this.$store.state.normalizedMagValues.x,
          this.$store.state.normalizedMagValues.y,
          this.$store.state.normalizedMagValues.z,
        ]);
      }, interval);
    },
    stopSendingOSC() {
      clearInterval(this.sendOscId);
      this.sendOscId = null;
    },
    startListeningOSC(inputPort) {
      console.log('starting listening OSC messages on port ' + inputPort + ' ...');
      window.osc.startListening(inputPort, () => {
        console.log('...  now listening');
        window.osc.on('/vibro/now', this._onVibroNow);
        window.osc.on('/vibro/pulse', this._onVibroPulse)
      }, (err) => console.error(err));
    },
    stopListeningOSC() {
      return new Promise((resolve, reject) => {
        window.osc.stopListening(() => {
          window.osc.removeListener('/vibro/now', this._onVibroNow)
          window.osc.removeListener('/vibro/pulse', this._onVibroPulse)
          resolve();
        }, () => {
          reject();
        });
      });
    },
    sendOSC(address, args) {
      window.osc.send({
        remoteAddress: this.$store.state.oscConfig.hostIP,
        remotePort: this.$store.state.oscConfig.outputPort,
        address: address,
        arguments: args,
      });
    },
    _onVibroNow(message) {
      if (Array.isArray(message.arguments) && message.arguments.length > 0) {
        navigator.vibrate(0);

        if (this.constantVibratorInterval !== null) {
          clearInterval(this.constantVibratorInterval);
          this.constantVibratorInterval = null;
        }

        if (message.arguments[0] != 0) {
          this.wasConstantlyVibrating = true;
          navigator.vibrate(5000);
          this.constantVibratorInterval = setInterval(() => {
            navigator.vibrate(0);
            navigator.vibrate(5000);
          }, 4990);
        } else {
          this.wasConstantlyVibrating = false;
          // navigator.vibrate(0);
          // clearInterval(this.constantVibratorInterval);
          // this.constantVibratorInterval = null;
        }
      }
    },
    _onVibroPulse(message) {
      navigator.vibrate(0);
      
      if (this.pulseVibratorInterval !== null) {
        clearInterval(this.pulseVibratorInterval);
        this.pulseVibratorInterval = null;
      }

      if (this.constantVibratorInterval !== null) {
        this._onVibroNow({ arguments: [0] });
        this.wasConstantlyVibrating = true;
      }

      if (Array.isArray(message.arguments) && message.arguments.length > 2) {
        this.vibOn = message.arguments[0];
        this.vibOff = message.arguments[1];
        this.vibTimes = message.arguments[2];

        this.vibCnt = 0;

        if (this.vibCnt < this.vibTimes || this.vibTimes < 0) {
          navigator.vibrate(this.vibOn);
          if (this.vibTimes >= 0) {
            this.vibCnt++;
          }
        }

        this.pulseVibratorInterval = setInterval(() => {
          if (this.vibCnt < this.vibTimes || this.vibTimes < 0) {
            navigator.vibrate(this.vibOn);
            if (this.vibTimes >= 0) {
              this.vibCnt++;
            }
          } else {
            clearInterval(this.pulseVibratorInterval);
            this.pulseVibratorInterval = null;
            if (this.wasConstantlyVibrating) {
              this._onVibroNow({ arguments: [1] });
            }
          }
        }, this.vibOn + this.vibOff);
      }
    },
  },
};
</script>