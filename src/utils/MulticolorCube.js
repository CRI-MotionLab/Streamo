import {
  BufferAttribute,
  BufferGeometry,
  EdgesGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  ShadowMaterial,
} from 'three';

import { hexToRgb } from './functions';

// updated for threejs 0.126.0 from :
// https://r105.threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html
// https://stackoverflow.com/a/41682130/3810717

const positions = [
  // front
  -1, -1,  1,    1, -1,  1,   -1,  1,  1,
  -1,  1,  1,    1, -1,  1,    1,  1,  1,
  // right
   1, -1,  1,    1, -1, -1,    1,  1,  1,
   1,  1,  1,    1, -1, -1,    1,  1, -1,
  // back
   1, -1, -1,   -1, -1, -1,    1,  1, -1,
   1,  1, -1,   -1, -1, -1,   -1,  1, -1,
  // left
  -1, -1, -1,   -1, -1,  1,   -1,  1, -1,
  -1,  1, -1,   -1, -1,  1,   -1,  1,  1,
  // top
   1,  1, -1,   -1,  1, -1,    1,  1,  1,
   1,  1,  1,   -1,  1, -1,   -1,  1,  1,
  // bottom
   1, -1,  1,   -1, -1,  1,    1, -1, -1,
   1, -1, -1,   -1, -1,  1,   -1, -1, -1,
];


class MulticolorCube extends Mesh {
  constructor(faceColors, edgesColor = 0xff0000) {
    super();

    const nbVertices = Math.floor(positions.length / 3);
    const faces = [ 'front', 'right', 'back', 'left', 'top', 'bottom' ];
    const colors = [];

    for (let i = 0; i < nbVertices; i++) {
      const faceColor = faceColors[faces[Math.floor(i / 6)]];
      const color = hexToRgb(faceColor).map(x => x / 255);
      colors.push(...color);
    }

    const nbPositionComponents = 3;
    const nbColorComponents = 3;

    const geometry = new BufferGeometry();

    geometry.setAttribute('position',
      new BufferAttribute(new Float32Array(positions), nbPositionComponents)
    );

    geometry.setAttribute('color',
      new BufferAttribute(new Float32Array(colors), nbColorComponents)
    );

    const cubeScale = 0.5;
    geometry.scale(cubeScale, cubeScale, cubeScale);
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    // works with MeshPhongMaterial({ vertexColors: true }) too
    const lambert = new MeshLambertMaterial({ vertexColors: true });
    // const line = new LineBasicMaterial({
    //   color: edgesColor,
    //   linewidth: 10,
    //   linecap: 'round',
    //   linejoin: 'round',
    // });
    // const shadow = new ShadowMaterial();
    // shadow.opacity = 0.2;

    // /!\ we cannot use "this" before super is called /!\
    // super(geometry, [ shadow, lambert ]);
    const lambertMesh = new Mesh(geometry, lambert);
    // const lines = new LineSegments(new EdgesGeometry(geometry), line);
    // const shadowMesh = new Mesh(geometry, shadow);

    // shadowMesh.castShadow = true;
    // shadowMesh.receiveShadow = true;
    
    this.add(lambertMesh);
    // this.add(lines);
    // this.add(shadowMesh);

  }
};

export default MulticolorCube;