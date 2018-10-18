import Vue from 'vue';
import VueRouter from 'vue-router';

import All from '../components/All.vue';
import Accelerometer from '../components/Accelerometer.vue';
import Gyroscope from '../components/Gyroscope.vue';
import Magnetometer from '../components/Magnetometer.vue';
import Settings from '../components/Settings.vue';

export default new VueRouter({
  // 'mode': 'history',
  // scrollBehavior: () => ({ y: 0 }),
  'routes': [
    { path: '/all', component: All, props: true },
    { path: '/accel', component: Accelerometer, props: true },
    { path: '/gyro', component: Gyroscope, props: true },
    { path: '/magneto', component: Magnetometer, props: true },
    { path: '/settings', component: Settings },
    { path: '*', redirect: '/all' }, // redirect to accel at startup
  ]
});