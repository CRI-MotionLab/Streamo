import Vue from 'vue/dist/vue.js';
import Vuex from 'vuex';

Vue.use(Vuex);

const errorHandler = (filename, e) => {
  let msg;

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'Storage quota exceeded';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'File not found';
      break;
    case FileError.SECURITY_ERR:
      msg = 'Security error';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'Invalid modification';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'Invalid state';
      break;
    default:
      msg = 'Unknown error';
      break;
  };

  console.log('Error (' + filename + '): ' + msg);
};

const settingsFilename = 'streamo-settings.json';

const store = new Vuex.Store({
  state: {
    oscConfig: {
      inputPort: 8000,
      outputPort: 8001,
      hostIP: '192.168.0.12',
      deviceIdentifier: 'streamo',
    },
    accGyrValues: {
      x: 0,
      y: 0,
      z: 0,
      alpha: 0,
      beta:0,
      gamma: 0,
    },
    magValues: {
      alpha: 0,
      beta:0,
      gamma: 0,
    },
  },
  // see https://stackoverflow.com/questions/44309627/vue-jsvuex-how-to-dispatch-from-a-mutation
  // (actually it is more "how to mutate from a dispatch" which is achieved here)
  mutations: {
    updateOscConfig(state, config) {
      Object.assign(state.oscConfig, config);
    },
    updateSensorValues(state, { whichSensorValues, values }) {
      Object.assign(state[whichSensorValues], values);
    },
  },
  actions: {
    updateOscConfig({ dispatch, commit }, config) {
      commit('updateOscConfig', config);
      dispatch('persist');
    },
    // how to use the file plugin :
    // https://www.neontribe.co.uk/cordova-file-plugin-examples/
    ////////// retrieve from file
    retrieve({ state, dispatch }) {
      const pathToFile = `${cordova.file.dataDirectory}${settingsFilename}`;

      window.resolveLocalFileSystemURL(pathToFile, (fileEntry) => {
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = function(e) {
            // console.log('config file loaded !');
            Object.assign(state, JSON.parse(this.result));
          };

          reader.readAsText(file);
        }, (function(filename, e) {
          if (e.code === FileError.NOT_FOUND_ERR) dispatch('persist');
        }).bind(null, settingsFilename));
      }, (function(filename, e) {
        if (e.code === FileError.NOT_FOUND_ERR) dispatch('persist');
      }).bind(null, settingsFilename));
    },
    ////////// persist to file
    persist({ state }) {
      const settings = {};
      Object.assign(settings, state);
      [ 'accValues', 'gyrValues', 'magValues' ].forEach((item) => {
        delete settings[item];
      });
      const data = JSON.stringify(settings, null, '\t');

      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(directoryEntry) {
        directoryEntry.getFile(settingsFilename, { create: true }, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
              /* do sth on write end */
            };

            fileWriter.onerror = function(e) {
              /* do sth on write error */
            };

            var blob = new Blob([ data ], { type: 'text/plain' });
            fileWriter.write(blob);
          }, errorHandler.bind(null, settingsFilename));
        }, errorHandler.bind(null, settingsFilename));
      }, errorHandler.bind(null, settingsFilename));
    },
  },
  // see https://codepen.io/CodinCat/pen/PpNvYr
  // (allows to watch inputPort from App.vue)
  getters: {
    inputPort: state => () => state.oscConfig.inputPort,
    accGyrValues: state => () => state.accGyrValues,
    magValues: state => () => state.magValues,
  },
});

export default store;