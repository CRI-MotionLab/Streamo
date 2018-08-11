<template>
  <div id="settings-container">
    <label>
      <input type="number" v-model="inputPort">
      input port
    </label>
    <label>
      <input type="number" v-model="outputPort">
      output port
    </label>
    <label>
      <div class="ip-container">
        <input type="number" class="ip" v-model="ip1">
        .
        <input type="number" class="ip" v-model="ip2">
        .
        <input type="number" class="ip" v-model="ip3">
        .
        <input type="number" class="ip" v-model="ip4">
      </div>
      host IP
    </label>
  </div>
</template>

<script>
  export default {
    computed: {
      inputPort: {
        get() { return this.$store.state.oscConfig.inputPort },
        set(inputPort) { this.$store.commit('updateOscConfig', { inputPort }); },
      },
      outputPort: {
        get() { return this.$store.state.oscConfig.outputPort },
        set(outputPort) { this.$store.commit('updateOscConfig', { outputPort }); },
      },
      ip1: {
        get() { return this.$store.state.oscConfig.hostIP.split('.')[0]; },
        set(value) { this.updateHostIP(value, 0); },
      },
      ip2: {
        get() { return this.$store.state.oscConfig.hostIP.split('.')[1]; },
        set(value) { this.updateHostIP(value, 1); },
      },
      ip3: {
        get() { return this.$store.state.oscConfig.hostIP.split('.')[2]; },
        set(value) { this.updateHostIP(value, 2); },
      },
      ip4: {
        get() { return this.$store.state.oscConfig.hostIP.split('.')[3]; },
        set(value) { this.updateHostIP(value, 3); },
      }
    },
    methods: {
      updateHostIP(value, index) {
        const ip = this.$store.state.oscConfig.hostIP.split('.');
        ip[index] = value;

        this.$store.commit('updateOscConfig', {
          hostIP: `${ip.join('.')}`
        });
      }
    },
  };
</script>