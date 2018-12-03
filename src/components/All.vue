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

  function createRing() {
    var ring = document.createElement('div');
    ring.className = 'threedee ring';
    ring.style.cssText = `
      background: url('./assets/bluering.png');
      background-size: 300px;
      width: 300px;
      height: 300px;
      margin-top: -150px;
      margin-left: -150px;
      transform-style: preserve-3d;
      transform:
      translate3d(0, 0, 0)
      rotateX(${Math.PI / 2}rad);
    `;

    return ring;    
  }

  function createSatellite(rx, ry, rz, x, y, z, color) { // color should be 'red', 'blue' or 'yellow'
    var sat = document.createElement('div');
    sat.className = 'threedee satellite';
    sat.style.cssText = `
      background: url('./assets/satellite-${color}.png');
      background-size: 50px;
      width: 50px;
      height: 50px;
      margin-top: -25px;
      margin-left: -25px;
      transform-style: preserve-3d;
      transform:
      rotateX(${rx.toFixed(2)}rad) rotateY(${ry.toFixed(2)}rad) rotateY(${rz.toFixed(2)}rad)
      translateX(${x.toFixed(2)}px) translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px);
    `;

    return sat;
  }

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
        this.filter.push([0, 0, 0, 0, 0, 0]);
      }

      const side = 100;
      const halfSide = side * 0.5;
      const all = document.querySelector('#planet-cube');
      const cube = document.createElement('div');
      cube.className = 'threedee';
      cube.style.cssText = `
        transform-style: preserve-3d;
      `;
      cube.appendChild(createFace(side, side, 0, 0, halfSide, 0, 0, 0, lightYellow)); // front
      cube.appendChild(createFace(side, side, 0, 0, -halfSide, 0, 0, Math.PI, lightYellow)); // back
      cube.appendChild(createFace(side, side, -halfSide, 0, 0, 0, -Math.PI / 2, 0, lightBlue)); // left
      cube.appendChild(createFace(side, side, halfSide, 0, 0, 0, Math.PI / 2, 0, lightBlue)); // right
      cube.appendChild(createFace(side, side, 0, -halfSide, 0, Math.PI / 2, 0, 0, lightRed)); // bottom
      cube.appendChild(createFace(side, side, 0, halfSide, 0, -Math.PI / 2, 0, 0, lightRed)); // top

      const ring = createRing();
      cube.appendChild(ring);
      all.appendChild(cube);

      const radius = 200;
      const satellites = document.createElement('div');
      satellites.className = 'threedee';
      satellites.style.cssText = `
        transform-style: preserve-3d;
      `;
      satellites.appendChild(createSatellite(0, 0, 0, -radius, 0, 0, 'yellow'));
      satellites.appendChild(createSatellite(0, 0, 0, radius, 0, 0, 'yellow'));
      satellites.appendChild(createSatellite(0, 0, 0, 0, -radius, 0, 'blue'));
      satellites.appendChild(createSatellite(0, 0, 0, 0, radius, 0, 'blue'));
      satellites.appendChild(createSatellite(0, 0, 0, 0, 0, -radius, 'red'));
      satellites.appendChild(createSatellite(0, 0, 0, 0, 0, radius, 'red'));
      all.appendChild(satellites);

      this.intervalId = setInterval(() => {
        const values = this.$store.state.accGyrValues;
        const frame = [ 
          values.x, values.y, values.z,
          values.alpha, values.beta, values.gamma
        ];
        this.filter.push(frame);
        this.filter.splice(0, 1);

        let filtered = [];
        for (let i = 0; i < 6; i++) {
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

        // ring.style.transform = ``;

        satellites.style.transform = `
          rotateX(${(filtered[3] * -0.1).toFixed(2)}deg)
          rotateY(${(filtered[4] * -0.1).toFixed(2)}deg)
          rotateZ(${(filtered[5] * -0.1).toFixed(2)}deg)
          translateX(${(filtered[0] * -10).toFixed(2)}px)
          translateY(${(filtered[1] * 20).toFixed(2)}px)
          translateZ(${(filtered[2] * -10 - 100).toFixed(2)}px)
        `;
      }, 50);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  };
</script>