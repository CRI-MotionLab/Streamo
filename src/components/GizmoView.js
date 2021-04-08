import React from 'react';
import { View } from 'react-native';
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";

// see :
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lines_fat.html
// import { Line2 } from 'three/examples/jsm/lines/Line2.js';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setContextGizmoReady } from '../store/actions';

import {
  AmbientLight,
  // SphereGeometry,
  CircleGeometry,
  RingGeometry,
  PlaneGeometry,
  // DirectionalLight,
  // Fog,
  // GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  // Path,
  PerspectiveCamera,
  // PointLight,
  Scene,
  // SpotLight,
  Vector3,
} from 'three';
// import MulticolorCube from '../utils/MulticolorCube';
// import ParametricDonut from '../utils/ParametricDonut';
// import Biquad from '../utils/Biquad';
import { colors } from '../utils/definitions';
import { hexToRgb, normalizeVector } from '../utils/functions';

class GizmoView extends React.Component {
  constructor(props) {
    super(props);

    // THREE.suppressExpoWarnings(true);
    // props :
    // - stream ('acc', 'gyr', or 'mag')
    // - data ({ x, y, z } values of currentStream)

    this.onContextCreate = this.onContextCreate.bind(this);
    this.lastDate = 0;
    this.rafId = null;

    this.gizmoMappers = {
      acc: ({ x, y, z }) => ({
        x: -1.5 * (x / 9.8),
        y: -1.5 * (y / 9.8),
        z: 0.5 * (z / 9.8),
      }),
      gyr: ({ x, y, z }) => ({
        // x: x / (2 * Math.PI),
        // y: y / (2 * Math.PI),
        // z: z / (2 * Math.PI),
        x: x * (1 / 360),
        y: y * (1 / 360),
        z: z * (1 / 360),
      }),
      mag: ({ x, y, z }) => normalizeVector(x, y, z),
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
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

  getPosFromAngleAndRadius(a, radius = 1) {
    return {
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius,
    };
  }

  async onContextCreate(gl) {
    console.log('gizmo context created');
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor('#fff');

    const scene = new Scene();

    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const centerRadius = 0.08;
    const dimEndRadius = 0.04;
    const blackDotRadius = 0.015; // also line / curve thickness
    const blackLineWidth = 0.0075;
    const halfBlackDotRadius = blackDotRadius * 0.5
    const gizmoRadius = 0.5;
    const circleSegments = 30;

    const transparentMaterialOptions = {
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    };

    const blackMat = new MeshStandardMaterial({ color: 0x000000 });
    const yellowMat = new MeshStandardMaterial({ color: colors.yellow, ...transparentMaterialOptions });
    const blueMat = new MeshStandardMaterial({ color: colors.blue, ...transparentMaterialOptions });
    const redMat = new MeshStandardMaterial({ color: colors.red, ...transparentMaterialOptions });

    const yellowZ = 0;
    const blueZ = 2;
    const redZ = 4;
    const blackZ = 6;

    const redArcCommonParams = {
      innerRadius: gizmoRadius - blackDotRadius,
      outerRadius: gizmoRadius + blackDotRadius,
      thetaSegments: 40,
      phiSegments: 1,
    };

    const xValue = 0.9;
    const yValue = 1.2;
    const zValue = 0.5;

    const redArc1StartAngle = 5 * Math.PI / 4;
    const redArc2StartAngle = 1 * Math.PI / 4;

    const redArc1StartPos = this.getPosFromAngleAndRadius(redArc1StartAngle, gizmoRadius);
    const redArc2StartPos = this.getPosFromAngleAndRadius(redArc2StartAngle, gizmoRadius);

    let redArc1EndPos = this.getPosFromAngleAndRadius(redArc1StartAngle - zValue * Math.PI, gizmoRadius);
    let redArc2EndPos = this.getPosFromAngleAndRadius(redArc2StartAngle - zValue * Math.PI, gizmoRadius);

    ////////// RED ARC 1

    const redArc1 = new Mesh(new RingGeometry(
      redArcCommonParams.innerRadius,
      redArcCommonParams.outerRadius,
      redArcCommonParams.thetaSegments,
      redArcCommonParams.phiSegments,
      zValue > 0 ? redArc1StartAngle - zValue * Math.PI : redArc1StartAngle,
      Math.abs(zValue) * Math.PI,
    ), redMat);

    redArc1.position.set(0, 0, redZ);
    scene.add(redArc1);

    const redArc1End = new Object3D();

    redArc1End.add(new Mesh(new CircleGeometry(
      dimEndRadius,
      circleSegments,
    ), redMat));

    redArc1End.add(new Mesh(new CircleGeometry(
      blackDotRadius,
      circleSegments,
    ), blackMat));

    redArc1End.children[1].position.set(0,0,1);

    redArc1End.position.set(redArc1EndPos.x, redArc1EndPos.y, redZ);
    scene.add(redArc1End);

    ////////// RED ARC 2

    const redArc2 = new Mesh(new RingGeometry(
      redArcCommonParams.innerRadius,
      redArcCommonParams.outerRadius,
      redArcCommonParams.thetaSegments,
      redArcCommonParams.phiSegments,
      zValue > 0 ? redArc2StartAngle - zValue * Math.PI : redArc2StartAngle,
      Math.abs(zValue) * Math.PI,
    ), redMat);

    redArc2.position.set(0, 0, redZ);
    scene.add(redArc2);

    const redArc2End = new Object3D();

    redArc2End.add(new Mesh(new CircleGeometry(
      dimEndRadius,
      circleSegments,
    ), redMat));

    redArc2End.add(new Mesh(new CircleGeometry(
      blackDotRadius,
      circleSegments,
    ), blackMat));

    redArc2End.children[1].position.set(0,0,1);

    redArc2End.position.set(redArc2EndPos.x, redArc2EndPos.y, redZ);
    scene.add(redArc2End);

    ////////// YELLOW STUFF (X)

    const centerCircle = new Mesh(new CircleGeometry(
      centerRadius,
      circleSegments,
    ), yellowMat);

    centerCircle.position.set(0, 0, yellowZ);
    scene.add(centerCircle);

    const xLine = new Mesh(new PlaneGeometry(1, 1), yellowMat);

    xLine.scale.set(Math.abs(xValue * gizmoRadius), blackDotRadius * 2, 1);
    xLine.position.set(xValue * gizmoRadius * 0.5, 0, yellowZ);
    scene.add(xLine);

    const xLineEnd = new Object3D();

    xLineEnd.add(new Mesh(new CircleGeometry(
      dimEndRadius,
      circleSegments,
    ), yellowMat));

    xLineEnd.add(new Mesh(new CircleGeometry(
      blackDotRadius,
      circleSegments,
    ), blackMat));

    xLineEnd.children[1].position.set(0, 0, 1);

    xLineEnd.position.set(xValue * gizmoRadius, 0, yellowZ);
    scene.add(xLineEnd);

    ////////// BLUE STUFF (Y)

    const yLine = new Mesh(new PlaneGeometry(1, 1), blueMat);

    yLine.position.set(0, yValue * gizmoRadius * 0.5, blueZ);
    yLine.scale.set(blackDotRadius * 2, Math.abs(yValue * gizmoRadius) , 1);
    scene.add(yLine);

    const yLineEnd = new Object3D();

    yLineEnd.add(new Mesh(new CircleGeometry(
      dimEndRadius,
      circleSegments,
    ), blueMat));

    yLineEnd.add(new Mesh(new CircleGeometry(
      blackDotRadius,
      circleSegments,
    ), blackMat));

    yLineEnd.children[1].position.set(0, 0, 1);

    yLineEnd.position.set(0, yValue * gizmoRadius, blueZ);
    scene.add(yLineEnd);

    ////////// BLACK STUFF

    const blackLine = new Mesh(new PlaneGeometry(blackLineWidth, gizmoRadius * 2), blackMat);
    blackLine.position.set(0, 0, 5);
    blackLine.rotation.set(0, 0, 3 * Math.PI / 4);
    scene.add(blackLine);

    const lineDots = [
      new Mesh(new CircleGeometry(blackDotRadius, circleSegments), blackMat),
      new Mesh(new CircleGeometry(blackDotRadius, circleSegments), blackMat),
      new Mesh(new CircleGeometry(blackDotRadius, circleSegments), blackMat),
    ];

    lineDots[0].position.set(0, 0, 5);
    lineDots[1].position.set(redArc1StartPos.x, redArc1StartPos.y, 5);
    lineDots[2].position.set(redArc2StartPos.x, redArc2StartPos.y, 5);
    lineDots.forEach(ld => scene.add(ld));

    const whRatio = width / height;
    const w = whRatio > 1 ? whRatio : 1;
    const h = whRatio > 1 ? 1 : 1 / whRatio
    const camera = new OrthographicCamera(-w, w, h, -h, 1, 1000);
    camera.position.set(0,0,100);
    camera.lookAt(0,0,0);
    // scene.add(camera);
    // let lastDate = 0;

    ///////////////////////////// RENDER CALLBACK //////////////////////////////

    this.renderScene = () => {
      this.rafId = requestAnimationFrame(this.renderScene);

      const now = Date.now();
      const delta = now - this.lastDate;
      if (delta < 20) return;
      this.lastDate = now;

      const { x, y, z } = this.gizmoMappers[this.props.stream](this.props.data);

      redArc1EndPos = this.getPosFromAngleAndRadius(redArc1StartAngle - z * Math.PI, gizmoRadius);
      redArc2EndPos = this.getPosFromAngleAndRadius(redArc2StartAngle - z * Math.PI, gizmoRadius);

      redArc1End.position.set(redArc1EndPos.x, redArc1EndPos.y, redZ);
      redArc2End.position.set(redArc2EndPos.x, redArc2EndPos.y, redZ);

      redArc1.geometry.dispose()
      redArc1.geometry = new RingGeometry(
        redArcCommonParams.innerRadius,
        redArcCommonParams.outerRadius,
        redArcCommonParams.thetaSegments,
        redArcCommonParams.phiSegments,
        z > 0
          ? redArc1StartAngle - z * Math.PI
          : redArc1StartAngle,
        Math.abs(z) * Math.PI,
      );

      redArc2.geometry.dispose()
      redArc2.geometry = new RingGeometry(
        redArcCommonParams.innerRadius,
        redArcCommonParams.outerRadius,
        redArcCommonParams.thetaSegments,
        redArcCommonParams.phiSegments,
        z > 0
          ? redArc2StartAngle - z * Math.PI
          : redArc2StartAngle,
        Math.abs(z) * Math.PI,
      );

      xLine.scale.set(Math.abs(x * gizmoRadius), blackDotRadius * 2, 1);
      xLine.position.set(x * gizmoRadius * 0.5, 0, yellowZ);
      
      xLineEnd.position.set(x * gizmoRadius, 0, yellowZ);

      yLine.position.set(0, y * gizmoRadius * 0.5, blueZ);
      yLine.scale.set(blackDotRadius * 2, Math.abs(y * gizmoRadius) , 1);

      yLineEnd.position.set(0, y * gizmoRadius, yellowZ);

      renderer.render(scene, camera);
      gl.endFrameEXP();

      // console.log('rendering gizmo');
    };


    // if the app starts with this view enabled we want to start rendering immediately
    if (this.rafId === null && this.props.enabled) {
      this.renderScene();
    }

    this.props.setContextGizmoReady(true);
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
    setContextGizmoReady
  }, dispatch);
};

export default connect(() => ({}), mapDispatchToProps)(GizmoView);

// export default GizmoView;