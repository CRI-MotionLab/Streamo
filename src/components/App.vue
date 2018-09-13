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

const oneOverG = 1 / 9.8;
const oneOverThreeSixty = 1 / 360;

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

        values.x = e.accelerationIncludingGravity.x * oneOverG;
        values.y = e.accelerationIncludingGravity.y * oneOverG;
        values.z = e.accelerationIncludingGravity.z * oneOverG * 0.25;

        if (e.rotationRate &&
            e.rotationRate.alpha &&
            e.rotationRate.beta &&
            e.rotationRate.gamma) {

          values.alpha = e.rotationRate.alpha * oneOverThreeSixty;
          values.beta = e.rotationRate.beta * oneOverThreeSixty;
          values.gamma = e.rotationRate.gamma * oneOverThreeSixty;
        }

        // we commit even if the phone doesn't have a gyroscope
        // (angular velocities will remain equal to zero)

        this.$store.commit('updateSensorValues', {
          whichSensorValues: 'accGyrValues',
          values: values,
        });

        console.log(JSON.stringify(values, null, 2));
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
      this.$store.commit('updateSensorValues', {
        whichSensorValues: 'magValues',
        values: {
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma,
        },
      });

      console.log('received device orientation event');
      console.log(JSON.stringify(e, null, 2));
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