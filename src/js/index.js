import Vue from 'vue/dist/vue.js';
import App from '../components/App.vue';
import VueRouter from 'vue-router';
import store from './store';

Vue.use(VueRouter);

// entry point found here :
// https://www.raymondcamden.com/2017/12/06/quick-example-of-apache-cordova-and-vuejs

const main = new Vue({
  el: '#main',
  store,
  components: {
    'main-component': App
  },
  data: {
    parentReady: false,
  },
  methods: {
    init: function() {
      // quick n' dirty way to make OSC plugin accessible to other components
      window.osc = new OSC();
      // load settings from persistent file or create defaut if !exists (see store.js)
      store.dispatch('retrieve');
      // when every initialization stuff is done, we set this.parentReady true
      // this is propagated from <main-component :child-ready="parentReady">
      // (in index.html) to App.vue and trigs a call to App's init function
      this.parentReady = true;

      // use this for magnetometer ? see :
      // https://blog.phonegap.com/migrating-from-the-cordova-device-orientation-plugin-8442b869e6cc
      // doesn't seem to work without it ...

      // window.addEventListener("compassneedscalibration", function(e) {
      //   // ask user to wave device in a figure-eight motion
      //   console.log('please move your phone in a figure-eight motion')
      //   e.preventDefault();
      // }, true);
    },
  },
});

document.addEventListener('deviceready', main.init);