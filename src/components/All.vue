<!--
inspired from
https://keithclark.co.uk/articles/creating-3d-worlds-with-html-and-css/
-->

<template>
  <div class="canvas-wrapper-wrapper-wrapper">
    <div class="canvas-wrapper-wrapper">
      <div class="canvas-wrapper">
        <div class="planet-container">
          <div id="planet-cube" class="threedee"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.planet-container {
  background-color: #fff;
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 500px;
}
#planet-cube {
  transition: all ease 50ms;
  perspective: 500px;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
}
.threedee {
  position: absolute;
  left: 50%;
  top: 50%;
}
.face {
  backface-visibility: hidden;
}
.ring {
  backface-visibility: visible;
}
</style>

<script>
  const lightYellow = '#fff17a';
  const lightBlue = '#7cdde2';
  const lightRed = '#f45a54';
  const darkBlue = '#4951D0';

  const oneOverG = 1 / 9.8;
  const oneOverThreeSixty = 1 / 360;
  const radToDeg = 180 / Math.PI;

  const cubeSide = 100; // pixels
  const ringRadius = 150; // pixels
  const satRadius = 25; // pixels

  function createFace(w, h, x, y, z, rx, ry, rz, color) {
    var face = document.createElement('div');
    face.className = 'threedee face';
    face.style.cssText = `
      background-color:${color};
      width: ${w.toFixed(2)}px;
      height: ${h.toFixed(2)}px;
      margin-top: -${(h / 2).toFixed(2)}px;
      margin-left: -${(w / 2).toFixed(2)}px;
      transform-style: preserve-3d;
      transform:
      translateX(${x.toFixed(2)}px) translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px)
      rotateX(${rx.toFixed(2)}rad) rotateY(${ry.toFixed(2)}rad) rotateY(${rz.toFixed(2)}rad);
    `;
    return face;
  }

  function createRing(thickness, color) {
    var ring = document.createElement('div');
    ring.className = 'threedee ring';
    ring.style.cssText = `
      width: ${2 * ringRadius}px;
      height: ${2 * ringRadius}px;
      margin-top: -${ringRadius}px;
      margin-left: -${ringRadius}px;
      border-radius: ${ringRadius}px;
      border: ${thickness}px solid ${color};
      transform-style: preserve-3d;
    `;

    return ring;        
  }

  function createSatellite(color) {
    var sat = document.createElement('div');
    sat.className = 'threedee satellite';
    sat.style.cssText = `
      width: ${2 * satRadius}px;
      height: ${2 * satRadius}px;
      margin-top: -${satRadius}px;
      margin-left: -${satRadius}px;
      border-radius: ${satRadius}px;
      background-color: ${color};
      transform-style: preserve-3d;
    `;

    return sat;
  }

  // function createSatellite(color) {
  //   var sat = document.createElement('div');
  //   sat.className = 'threedee satellite';
  //   sat.style.cssText = `
  //     background: url('./assets/satellite-${color}.png');
  //     background-size: ${2 * satRadius}px;
  //     width: ${2 * satRadius}px;
  //     height: ${2 * satRadius}px;
  //     margin-top: -${satRadius}px;
  //     margin-left: -${satRadius}px;
  //     transform-style: preserve-3d;
  //   `;

  //   return sat;
  // }

  export default {
    name: 'all',
    data() {
      return {
        filter: [],
      };
    },
    mounted() {
      this.filter = [];
      for (let i = 0; i < 2; i++) {
        this.filter.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }

      const side = 100;
      const halfSide = cubeSide * 0.5;
      const all = document.querySelector('#planet-cube');

      const cube = document.createElement('div');
      cube.className = 'threedee';
      cube.style.cssText = `
        transform-style: preserve-3d;
      `;
      cube.appendChild(createFace(cubeSide, cubeSide, 0, 0, halfSide, 0, 0, 0, lightYellow)); // front
      cube.appendChild(createFace(cubeSide, cubeSide, 0, 0, -halfSide, 0, 0, Math.PI, lightYellow)); // back
      cube.appendChild(createFace(cubeSide, cubeSide, -halfSide, 0, 0, 0, -Math.PI / 2, 0, lightBlue)); // left
      cube.appendChild(createFace(cubeSide, cubeSide, halfSide, 0, 0, 0, Math.PI / 2, 0, lightBlue)); // right
      cube.appendChild(createFace(cubeSide, cubeSide, 0, -halfSide, 0, Math.PI / 2, 0, 0, lightRed)); // bottom
      cube.appendChild(createFace(cubeSide, cubeSide, 0, halfSide, 0, -Math.PI / 2, 0, 0, lightRed)); // top

      all.appendChild(cube);

      const ring = createRing(5, darkBlue);
      all.appendChild(ring);

      const satellites = [
        createSatellite(lightYellow),
        createSatellite(lightYellow),       
        createSatellite(lightBlue),
        createSatellite(lightBlue),
        createSatellite(lightRed),
        createSatellite(lightRed),
      ];

      const satelliteTranslations = [
        [ -ringRadius, 0, 0 ],
        [ ringRadius, 0, 0 ],
        [ 0, -ringRadius, 0 ],
        [ 0, ringRadius, 0 ],
        [ 0, 0, -ringRadius ],
        [ 0, 0, ringRadius ],
      ];

      for (let i = 0; i < satellites.length; i++) {
        all.appendChild(satellites[i]);
      }

      ////////// ANIMATION CALLBACK :

      this.intervalId = setInterval(() => {
        const accGyrValues = this.$store.state.accGyrValues;
        const magValues = this.$store.state.normalizedMagValues;

        let theta = 0;
        if (magValues.x !== 0 && magValues.y !== 0) {
          theta = Math.acos(magValues.x / Math.sqrt(Math.pow(magValues.x, 2) +
                                          Math.pow(magValues.y, 2)));
          if (magValues.y < 0) {
            theta = 2* Math.PI - theta;
          }
        }

        let phi = Math.acos(magValues.z);

        const frame = [ 
          accGyrValues.x, accGyrValues.y, accGyrValues.z,
          accGyrValues.alpha, accGyrValues.beta, accGyrValues.gamma,
          0, phi, -theta,
        ];

        this.filter.push(frame);
        this.filter.splice(0, 1);

        let filtered = [];
        for (let i = 0; i < 9; i++) {
          let sum = 0;
          for (let j = 0; j < this.filter.length; j++) {
            sum += this.filter[j][i];
          }
          filtered.push(sum / this.filter.length);
        }

        cube.style.transform = `
          translateX(${(filtered[0] * -10).toFixed(2)}px)
          translateY(${(filtered[1] * 20).toFixed(2)}px)
          translateZ(${(filtered[2] * -10 - 100).toFixed(2)}px)
          rotateX(${(filtered[3] * 0.1).toFixed(2)}deg)
          rotateY(${(filtered[4] * 0.1).toFixed(2)}deg)
          rotateZ(${(filtered[5] * 0.1).toFixed(2)}deg)
        `;

        ring.style.transform = `
          translateX(${(filtered[0] * -10).toFixed(2)}px)
          translateY(${(filtered[1] * 20).toFixed(2)}px)
          translateZ(${(filtered[2] * -10 - 100).toFixed(2)}px)
          rotateX(${(filtered[6] * 1).toFixed(2)}rad)
          rotateY(${(filtered[7] * 1).toFixed(2)}rad)
          rotateZ(${(filtered[8] * 1).toFixed(2)}rad)
          rotateX(${(Math.PI / 2).toFixed(2)}rad)
        `;

        for (let i = 0; i < satellites.length; i++) {
          satellites[i].style.transform = `
            translateX(${(filtered[0] * -10).toFixed(2)}px)
            translateY(${(filtered[1] * 20).toFixed(2)}px)
            translateZ(${(filtered[2] * -10 - 100).toFixed(2)}px)
            rotateX(${(filtered[6] * 1).toFixed(2)}rad)
            rotateY(${(filtered[7] * 1).toFixed(2)}rad)
            rotateZ(${(filtered[8] * 1).toFixed(2)}rad)
            translateX(${satelliteTranslations[i][0].toFixed(2)}px)
            translateY(${satelliteTranslations[i][1].toFixed(2)}px)
            translateZ(${satelliteTranslations[i][2].toFixed(2)}px)
            rotateZ(${(filtered[8] * -1).toFixed(2)}rad)
            rotateY(${(filtered[7] * -1).toFixed(2)}rad)
            rotateX(${(filtered[6] * -1).toFixed(2)}rad)
          `;
        }
      }, 50);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  };
</script>