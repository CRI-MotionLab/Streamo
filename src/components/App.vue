<style lang="scss">
</style>

<template>
  <div id="app">
    <div id="tabs">
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
import router from '../js/router';

export default {
  router,
  props: [ 'childReady' ],
  watch: {
    childReady: {
      immediate: true,
      deep: true,
      handler: function(val) {
        if (val) this.init();
      },
    },
  },
  methods: {
    init() {
      this.$store.watch(this.$store.getters.inputPort, (val, oldVal) => {
        if (val !== oldVal) {
          this.stopListeningOSC();
          this.startListeningOSC(val);
        }
      });

      // faking accelerometer for tests in emulator
      // setInterval(() => {
      //   const amp = 0.5;
      //   const offset = -0.25;
      //   this.$store.commit('updateSensorValues', {
      //     whichSensorValues: 'accGyrValues',
      //     values: {
      //       x: Math.random() * amp + offset,
      //       y: Math.random() * amp + offset,
      //       z: Math.random() * amp + offset,
      //     },
      //   });
      // }, 20);

      this.startListeningDeviceMotion();
      this.startListeningDeviceOrientation();
      this.startListeningMagnetometer();
      this.startListeningOSC(this.$store.state.oscConfig.inputPort); // really needed ?
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
    startListeningOSC(inputPort) {
      console.log('starting listening OSC messages on port ' + inputPort);
      window.osc.startListening(inputPort);
    },
    stopListeningOSC() {
      window.osc.stopListening();
    },
    sendOSC(address, args) {
      window.osc.send({
        remoteAddress: this.$store.state.oscConfig.hostIP,
        remotePort: this.$store.state.oscConfig.outputPort,
        address: address,
        arguments: args,
      });
    },
    routeReceivedOSC() {
      // todo
    },
  },
};
</script>