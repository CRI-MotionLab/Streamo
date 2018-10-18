<!-- mostly stolen from https://alligator.io/vuejs/vue-html5-canvas/ -->
<script>
  import * as THREE from 'three';
  
  import addProjector from '../js/addProjector';
  import addCanvasRenderer from '../js/addCanvasRenderer';
  addProjector(THREE);
  addCanvasRenderer(THREE);

  // import * as extRenderer from 'three/examples/js/renderers/CanvasRenderer';
  // import extendThree from '../js/CanvasRenderer';
  // extendThree(THREE);

  const lightYellow = 0xfff17a;
  const lightBlue = 0x7cdde2;
  const lightRed = 0xf45a54;
  const darkBlue = 0x4951D0;

  const cubeColors = [
    lightYellow,
    lightYellow,
    lightBlue,
    lightBlue,
    lightRed,
    lightRed,
    // lightYellow,
    // lightBlue,
    // lightRed,
    // lightYellow,
    // lightBlue,
    // lightRed,
  ];

  const satelliteColors = [
    lightYellow,
    lightYellow,
    lightBlue,
    lightBlue,
    lightRed,
    lightRed,
    // lightYellow,
    // lightBlue,
    // lightRed,
    // lightYellow,
    // lightBlue,
    // lightRed,
  ];

  const satelliteTranslations = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
  ];

  export default {
    // Gets us the provider property from the parent <my-canvas> component.
    inject: [ 'provider' ],
    props: {
      accx: { type: Number, default: 0 },
      accy: { type: Number, default: 0 },
      accz: { type: Number, default: 0 },
      gyrx: { type: Number, default: 0 },
      gyry: { type: Number, default: 0 },
      gyrz: { type: Number, default: 0 },
      magx: { type: Number, default: 0 },
      magy: { type: Number, default: 0 },
      magz: { type: Number, default: 0 },
    },
    methods: {
      initialize() {
        // if(!this.provider.context) return false;

        const ctx = this.provider.context;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        
        this.center = { x: w * 0.5, y: h * 0.5 };
        this.radius = 0.5 * w;

        const cubeSize = 0.25 * w;

        // torus variables :
        const tRadius = this.radius;
        const tTubeRadius = 5;
        const tSegments = 30;

        // satellites variables :
        const sRadius = 20;
        const sSegments = 16;

        //----------------- INSTANTIATE CLASSES FROM THREE.JS ----------------//

        ////////// SCENE
        this.scene = new THREE.Scene();

        const frustumSize = 1000;
        const aspect = w / h;

        ////////// CAMERA
        this.camera = new THREE.OrthographicCamera(
          frustumSize * aspect / - 2,
          frustumSize * aspect / 2,
          frustumSize / 2,
          frustumSize / - 2,
          -2000,
          2000
        );

        ////////// RENDERER
        // this.renderer = new THREE.WebGLRenderer({
        //   canvas: ctx.canvas, // this should provide access to the canvas element
        //   antialias: true,
        // });
        this.renderer = new THREE.CanvasRenderer({
          canvas: ctx.canvas, // this should provide access to the canvas element
          // antialias: true,
        });

        // this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor('#fff', 1);
        this.renderer.setSize(w, h); // call this on each render loop ?
        // document.body.appendChild(this.renderer.domElement);

        ////////// LIGHT
        this.light = new THREE.AmbientLight('#ddd'); // soft white light
        this.light.position.set(-1, 0, 1).normalize();

        ////////// CUBE
        // solution found here :
        // https://stackoverflow.com/questions/14924187/change-the-colors-of-a-cubes-faces
        this.cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        for (var i = 0; i < this.cubeGeometry.faces.length; i++) {
          // correct the face order here : same colors should be located on opposite faces pairs
          this.cubeGeometry.faces[i].color.setHex(cubeColors[Math.floor(i * 0.5)]);
        }
        this.cubeMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.FaceColors,
          side: THREE.FrontSide,
          shadowSide: THREE.FrontSide,
        });
        this.cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);

        // todo: add a slightly larger wireframe style cube using mesh lines
        // see: https://stackoverflow.com/questions/41900304/threejs-why-is-wireframe-thickness-not-adjusting-for-me

        const rThetaSegments = 30;
        const rPhiSegments = 4;

        ////////// RING
        this.ringGeometry = new THREE.RingGeometry(70, 80, rThetaSegments, rPhiSegments, 0, Math.PI * 2);
        this.ringMaterial = new THREE.MeshLambertMaterial({ color: darkBlue, side: THREE.DoubleSide }); // cheaper, faster, less accurate than phong
        this.ring = new THREE.Mesh(this.ringGeometry, this.ringMaterial);
        this.ring.position.set(0, 0, 0);

        ////////// TORUS
        this.torusGeometry = new THREE.TorusGeometry(tRadius, tTubeRadius, tSegments, tSegments, Math.PI * 2);
        this.torusMaterial = new THREE.MeshBasicMaterial({ color: darkBlue });
        this.torus = new THREE.Mesh(this.torusGeometry, this.torusMaterial);

        ////////// SATELLITES
        this.satellites = [];
        for (let i = 0; i < 6; ++i) {
          const geom = new THREE.SphereGeometry(sRadius, sSegments, sSegments);
          const mat = new THREE.MeshBasicMaterial({ color: satelliteColors[i] });
          this.satellites.push(new THREE.Mesh(geom, mat));
        }

        //------------------- ADD EVERYTHING TO THE SCENE --------------------//

        // this.scene.add(this.light);
        this.scene.add(this.cube);
        // this.scene.add(this.ring);
        this.scene.add(this.torus);

        for (let i = 0; i < 6; i++) {
          this.scene.add(this.satellites[i]);
        }

        this.initialized = true;
        return true;
      },
    },
    render() {
      // Since the parent canvas has to mount first, it's *possible* that the context may not be
      // injected by the time this render function runs the first time.
      if (!this.provider.context) return;

      if (!this.initialized) {
        this.initialize();
      }

      const ctx = this.provider.context;

      Object.assign(this.cube.rotation, {
        x: this.accx,
        y: this.accy,
        z: this.accy
      });

      Object.assign(this.torus.rotation, {
        x: this.accx + Math.PI * 0.5,
        y: this.accz,
        // z: this.accy
      });

      // obviously doesn't work ... need to compose transformations
      for (let i = 0; i < 6; i++) {
        Object.assign(this.satellites[i].rotation, this.torus.rotation);
        Object.assign(this.satellites[i].position, {
          x: satelliteTranslations[i].x * this.radius,
          y: satelliteTranslations[i].y * this.radius,
          z: satelliteTranslations[i].z * this.radius,
        });
      }

      this.renderer.render(this.scene, this.camera);
    },
  };
</script>
