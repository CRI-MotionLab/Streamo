import { NativeEventEmitter } from 'react-native';
import osc from 'react-native-osc';
import BaseEventEmitter from './BaseEventEmitter';

class Osc extends BaseEventEmitter {
  constructor() {
    super();
    this.eventEmitter = new NativeEventEmitter(osc);
    this.eventEmitter.addListener('GotMessage', message => {
      console.log(message);
    });
    this.initialized = false;
  }

  setTarget(ip, port) {
    osc.createClient(ip, port || 7400);
    // osc.createServer(port);
    this.initialized = true;
  }

  sendMessage(address, data) {
    if (this.initialized) {
      osc.sendMessage(address, data);
    }
  }
};

export default new Osc();