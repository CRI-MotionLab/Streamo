import {
  Curve,
  Mesh,
  MeshLambertMaterial,
  TubeGeometry,
  Vector3,
} from 'three';

class CircleCurve extends Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }

  getPoint(t, optionalTarget = new Vector3()) {
    const tx = Math.cos(2 * Math.PI * t);
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
};

class ParametricDonut extends Mesh {
  constructor(color) {
    const path = new CircleCurve();
    const geometry = new TubeGeometry(path, 60, 0.05, 10, true);
    geometry.scale(1, 1, 0.2);
    const material = new MeshLambertMaterial({ color });
    super(geometry, material);
    // this.castShadow = true;
    // this.receiveShadow = true;
  }
};

export default ParametricDonut;