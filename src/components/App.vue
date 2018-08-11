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
        Settings
      </router-link>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import router from '../js/router';

export default {
  router,
  props: [ 'childStatus' ],
  watch: {
    childStatus: {
      immediate: true,
      deep: true,
      handler: function(val) {
        if (val) this.init();
      },
    },
  },
  methods: {
    init: function() {
      this.$store.watch(this.$store.getters.inputPort, (val, oldVal) => {
        if (val !== oldVal) {
          this.stopListeningOSC();
          this.startListeningOSC(val);
        }
      });

      this.startListeningDeviceMotion();
      this.startListeningOSC(this.$store.state.oscConfig.inputPort); // really needed ?
    },
    startListeningDeviceMotion: function() {
      window.addEventListener('devicemotion', this.onDeviceMotion, true);
    },
    stopListeningDeviceMotion: function() {
      window.removeEventListener('devicemotion', this.onDeviceMotion);
    },
    startListeningOSC: function(inputPort) {
      console.log('starting listening OSC messages on port ' + inputPort);
      window.osc.startListening(inputPort);
    },
    stopListeningOSC: function() {
      window.osc.stopListening();
    },
    onDeviceMotion(e) {
      const x = e.accelerationIncludingGravity.x;
      const y = e.accelerationIncludingGravity.y;
      const z = e.accelerationIncludingGravity.z;

      this.sendOSC('/accel', [ x, y, z ]);
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
    }
  },
};
</script>