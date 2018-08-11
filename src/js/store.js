import Vue from 'vue/dist/vue.js';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    oscConfig: {
      inputPort: 8000,
      outputPort: 8001,
      hostIP: '192.168.0.12',
    },
  },
  mutations: {
    updateOscConfig: function(state, config) {
      Object.assign(state.oscConfig, config);
    },
  },
  // see https://codepen.io/CodinCat/pen/PpNvYr
  // (allows to watch inputPort from App.vue)
  getters: {
    inputPort: state => () => state.oscConfig.inputPort,
  }
});

export default store;