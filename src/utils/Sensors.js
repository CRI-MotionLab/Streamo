import {
  accelerometer,
  gyroscope,
  magnetometer,
  barometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import BaseEventEmitter from './BaseEventEmitter';
import Biquad from './Biquad';

const initialMagRange = {
  x: { min: 1e9, max: 1e-9 },
  y: { min: 1e9, max: 1e-9 },
  z: { min: 1e9, max: 1e-9 },
};

const accelFilterParams = {
  sr: 50,
  f0: 5,
  q: 1,
  mode: 'bandpass',
}

const accelFilters = {
  x: new Biquad(accelFilterParams),
  y: new Biquad(accelFilterParams),
  z: new Biquad(accelFilterParams),
}

class Sensors extends BaseEventEmitter {
  constructor() {
    super();

    this.magRange = { ...initialMagRange };
    this.normalizedMagnetometer = { x: 0, y: 0, z: 0 };

    setUpdateIntervalForType(SensorTypes.accelerometer, 20);
    setUpdateIntervalForType(SensorTypes.gyroscope, 20);
    setUpdateIntervalForType(SensorTypes.magnetometer, 20);

    this.accSubscription = accelerometer.subscribe(
      data => { // { x, y, z, timestamp }

        ////////// bandpass filtering around 5 Hz (remove gravity and noise)

        const filtered = {};
        const { timestamp } = data;

        [ 'x', 'y', 'z' ].forEach(dim => {
          filtered[dim] = accelFilters[dim].process(data[dim]);
        });

        super.emit('filteredAccelerometer', { ...filtered, timestamp });
        super.emit('accelerometer', data);
      },
      error => {
        // console.error('accelerometer sensor is not available');
      }
    );

    this.gyrSubscription = gyroscope.subscribe(
      data => { // { x, y, z, timestamp }
        let { x, y, z, timestamp } = data;
        x *= (180 / Math.PI);
        y *= (180 / Math.PI);
        z *= (180 / Math.PI);
        super.emit('gyroscope', { x, y, z, timestamp });
        // super.emit('gyroscope', data);
      },
      error => {
        // console.error('gyroscope sensor is not available');
      }
    );

    this.magSubscription = magnetometer.subscribe(
      data => { // { x, y, z, timestamp }

        let { x, y, z, timestamp } = data;
        let normalized = {};

        ////////// progressive normalization :

        /*
        [ 'x', 'y', 'z' ].forEach(dim => {
          const val = data[dim];
          const range = this.magRange[dim];

          if (val < range.min) { range.min = val; }
          if (val > range.max) { range.max = val; }

          if (range.min !== range.max) {
            normalized[dim] = ((val - range.min) / (range.max - range.min)) * 2 - 1
          }
        });
        //*/

        ////////// instantaneous normalization :

        const norm = Math.sqrt(x * x + y * y + z * z);
        if (norm !== 0) {
          x /= norm;
          y /= norm;
          z /= norm;
        }
        normalized = { x, y, z };

        super.emit('normalizedMagnetometer', { ...normalized, timestamp });
        super.emit('magnetometer', data);
      },
      error => {
        // console.error('magnetometer sensor is not available');
      }
    );

    this.barSubscription = barometer.subscribe(
      data => { // { pressure }
        super.emit('barometer', data);
      },
      error => {
        // console.error('barometer sensor is not available');
      }
    );
  }

  resetMagnetometerNormalization() {
    this.magRange = { ...initialMagRange };
  }
};

export default new Sensors();