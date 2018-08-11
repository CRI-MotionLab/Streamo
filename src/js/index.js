import Vue from 'vue/dist/vue.js';
import App from '../components/App.vue';
import VueRouter from 'vue-router';
import store from './store';

Vue.use(VueRouter);

const main = new Vue({
  el: '#main',
  store,
  components: {
    'main-component': App
  },
  data: {
    parentStatus: false,
  },
  methods: {
    init: function() {
      // dirty way to make OSC plugin accessible to other components :
      window.osc = new OSC();
      this.parentStatus = true;
    },
  },
});

document.addEventListener('deviceready', main.init);