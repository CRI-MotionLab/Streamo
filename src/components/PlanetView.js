import React from 'react';
import { View } from 'react-native';
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import {
  AmbientLight,
  SphereGeometry,
  DirectionalLight,
  Fog,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  Vector3,
} from 'three';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setContextPlaygroundReady } from '../store/actions';

import MulticolorCube from '../utils/MulticolorCube';
import ParametricDonut from '../utils/ParametricDonut';
import Biquad from '../utils/Biquad';
import { colors } from '../utils/definitions';
import { hexToRgb, normalizeVector } from '../utils/functions';

class PlanetView extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - acc ({ x, y, z })
    // - gyr ({ x, y, z })
    // - mag ({ x, y, z })

    this.onContextCreate = this.onContextCreate.bind(this);
    this.lastDate = 0;
    this.rafId = null;

    this.filterSize = 5;
    this.filter = [];
  }

  getSnapshotBeforeUpdate(prevProps) {
    // console.log(this.props.normMag);
    if (this.props.enabled && !prevProps.enabled) {
      this.filter = [];
      this.renderScene();
    } else if (!this.props.enabled && prevProps.enabled) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    // just here to avoid the warning due to presence of getSnapshotBeforeUpdate
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
  }

  async onContextCreate(gl) {
    console.log('context created');
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor('#fff');
    // renderer.shadowMap.enabled = true;

    const scene = new Scene();
    // scene.fog = new Fog("#3A96C4", 1, 10000);
    // scene.add(new GridHelper(10, 10));

    // const directionalLight = new DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(-2, 5, 10);
    // directionalLight.target.position.set(0, 0, 0);
    // directionalLight.castShadow = true;
    // scene.add(directionalLight);
    // scene.add(directionalLight.target);

    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // const pointLight = new PointLight(0xffffff, 2, 1000, 1);
    // pointLight.position.set(0, 200, 200);
    // scene.add(pointLight);

    // const spotLight = new SpotLight(0xffffff, 0.5);
    // spotLight.position.set(0, 500, 100);
    // spotLight.lookAt(scene.position);
    // scene.add(spotLight);

    ////////// CUBE

    const cube = new MulticolorCube({
      front: colors.yellow,
      back: colors.yellow,
      left: colors.blue,
      right: colors.blue,
      top: colors.red,
      bottom: colors.red,
      // front: colors.red,
      // back: colors.red,
      // left: colors.blue,
      // right: colors.blue,
      // top: colors.yellow,
      // bottom: colors.yellow,
    });
    cube.scale.set(0.5, 0.5, 0.5);
    // take snapshot of original transform
    cube.updateMatrix();
    cube.userData.originalMatrix = cube.matrix.clone();
    // add to scene
    scene.add(cube);

    ////////// DONUT

    const donut = new ParametricDonut(colors.darkBlue);
    // rotation must be done afterwards (see in render function)
    // donut.rotation.setFromVector3(new Vector3(Math.PI / 2, 0, 0));
    // take snapshot
    donut.updateMatrix();
    donut.userData.originalMatrix = donut.matrix.clone();
    // add to scene
    scene.add(donut);

    ////////// SATELLITES

    const satDistance = 1.2;
    const satRadius = 0.1;

    const satInfos = [
      { x: -satDistance, y: 0, z: 0, color: colors.yellow },
      { x:  satDistance, y: 0, z: 0, color: colors.yellow },
      { x: 0, y: -satDistance, z: 0, color: colors.blue },
      { x: 0, y:  satDistance, z: 0, color: colors.blue },
      { x: 0, y: 0, z: -satDistance, color: colors.red },
      { x: 0, y: 0, z:  satDistance, color: colors.red },
    ]
    const spheres = [];
    
    for (let i = 0; i < 6; i++) {
      const sg = new SphereGeometry(satRadius, 30, 30);
      const lm = new MeshLambertMaterial({ color: satInfos[i].color });
      const sphere = new Mesh(sg, lm);
      // we need to store the original transform matrix to reinit
      // transforms on each call to render() :
      sphere.updateMatrix();
      sphere.userData.originalMatrix = sphere.matrix.clone();

      spheres.push(sphere);
      scene.add(sphere);
    }


    const camera = new PerspectiveCamera(45, width / height, 1, 100);
    camera.position.set(1, 1, 5);
    camera.lookAt(cube.position);
    // camera.lookAt(0,0,0);

    let lastDate = 0;

    ///////////////////////////// RENDER CALLBACK //////////////////////////////

    this.renderScene = () => {
      this.rafId = requestAnimationFrame(this.renderScene);

      // const now = Date.now();
      // const delta = now - this.lastDate;
      // if (delta < 20) return;
      // this.lastDate = now;

      //////////  theta / phi angles for magnetometer satellites rotation :

      // const normMag = this.props.normMag;
      const normMag = normalizeVector(
        this.props.mag.x,
        this.props.mag.y,
        this.props.mag.z
      );

      let theta = 0;
      if (normMag.x !== 0 && normMag.y !== 0) {
        theta = Math.acos(
          normMag.x / Math.sqrt(
            Math.pow(normMag.x, 2) +
            Math.pow(normMag.y, 2)
          )
        );

        if (normMag.y < 0) {
          theta = 2* Math.PI - theta;
        }
      }

      let phi = Math.acos(normMag.z);

      const frame = [
        this.props.filteredAcc.x * -1.5 / 9.8,
        this.props.filteredAcc.y * -1.5 / 9.8,
        this.props.filteredAcc.z * -1.5 / 9.8,
        this.props.gyr.x * 0.2 * (Math.PI / 180),
        this.props.gyr.y * 0.2 * (Math.PI / 180),
        this.props.gyr.z * 0.2 * (Math.PI / 180),
        0,
        phi,
        -theta,
      ];

      this.filter.push(frame);
      if (this.filter.length > this.filterSize) {
        this.filter.splice(0, 1);
      }

      let filtered = [];
      for (let i = 0; i < frame.length; i++) {
        let sum = 0;
        for (let j = 0; j < this.filter.length; j++) {
          sum += this.filter[j][i];
        }
        filtered.push(sum / this.filter.length);
      }
      // this.rotation.x += this.rotationSpeeds.x * delta * 0.001;
      // this.rotation.y += this.rotationSpeeds.y * delta * 0.001;
      // this.rotation.z += this.rotationSpeeds.z * delta * 0.001;
      // cube.rotation.setFromVector3(this.rotation);

      cube.userData.originalMatrix.decompose(cube.position, cube.quaternion, cube.scale);
      cube.matrix.copy(cube.userData.originalMatrix);

      cube.translateX(filtered[0]);
      cube.translateY(filtered[1]);
      cube.translateZ(filtered[2]);

      cube.rotateX(filtered[3]);
      cube.rotateY(filtered[4]);
      cube.rotateZ(filtered[5]);

      donut.userData.originalMatrix.decompose(donut.position, donut.quaternion, donut.scale);
      donut.matrix.copy(donut.userData.originalMatrix);

      donut.translateX(filtered[0] * 0.33);
      donut.translateY(filtered[1] * 0.33);
      donut.translateZ(filtered[2] * 0.33);

      donut.rotateX(filtered[3]);
      donut.rotateY(filtered[4]);
      donut.rotateZ(filtered[5]);
      donut.rotateX(Math.PI / 2);
      
      // donut.rotation.setFromVector3(this.rotation);

      spheres.forEach((sphere, i) => {
        const { x, y, z } = satInfos[i];

        // reinit transform matrix :
        // https://stackoverflow.com/questions/60836453/three-js-reseting-matrix-before-transformation
        sphere.userData.originalMatrix.decompose(sphere.position, sphere.quaternion, sphere.scale);
        sphere.matrix.copy(sphere.userData.originalMatrix);

        // sphere.translateX(filtered[0]);
        // sphere.translateY(filtered[1]);
        // sphere.translateZ(filtered[2]);

        // sphere.rotateX(-Math.PI / 2); // ???
        sphere.rotateY(filtered[7]);
        sphere.rotateZ(filtered[8]);

        sphere.translateX(x);
        sphere.translateY(y);
        sphere.translateZ(z);
      });

      renderer.render(scene, camera);
      gl.endFrameEXP();

      // console.log('rendering');
      // const now = Date.now();
      // console.log(now - lastDate);
      // lastDate = now;
    };

    // if the app starts with this view enabled we want to start rendering immediately
    if (this.rafId === null && this.props.enabled) {
      this.renderScene();
    }

    this.props.setContextPlaygroundReady(true);
  }

  render() {
    return (
      <GLView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
      />
    );
  }
};

// const mapStateToProps = state => {
//   const { navigation, osc, context } = state;
//   return { navigation, osc, context };
// }

// const mapStateToProps = () => {};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    setContextPlaygroundReady
  }, dispatch);
};

export default connect(() => ({}), mapDispatchToProps)(PlanetView);

// export default PlanetView;