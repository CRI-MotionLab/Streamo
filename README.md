# Streamo

### A mobile app that emulates a Movuino WiFi device

#### building the app

If not already done :
* install [Node.js](https://nodejs.org/en/download/)
* install cordova globally by running `npm install -g cordova`
* make sure you install all the tools required for building iOS and Android applications, following [these instructions](https://cordova.apache.org/docs/en/latest/guide/cli/#install-pre-requisites-for-building).

Now you can `git clone` this repo, `cd` into it, then run `npm install`.  
Once the dependencies are installed you can build the app using `cordova build <platform>`, then run it using `cordova run <platform>`.

#### dependencies

Streamo is a cordova application based on the [Vue.js](https://vuejs.org/) framework. It uses `babel`, `browserify` and `node-sass` to allow for a modern writing style. It relies on the cordova plugins `cordova-plugin-osc`, `cordova-plugin-magnetometer` and `cordova-plugin-file`.

#### OSC

At the moment, Streamo only sends a single OSC frame with the following structure :  

```
/streamo <deviceIdentifier> <accX> <accY> <accZ> <gyrX> <gyrY> <gyrZ> <magX> <magY> <magZ>
```

The OSC parameters can be set from the settings tab (small gear icon at the right top of the screen). The `<deviceIdentifier>` property can be changed there too. Every change in the settings is persisted, anytime.