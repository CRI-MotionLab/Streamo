<template>
  <canvas-component>
    <planet
      :accx="this.accGyrValues.x"
      :accy="this.accGyrValues.y"
      :accz="this.accGyrValues.z"
      :gyrx="this.accGyrValues.alpha"
      :gyry="this.accGyrValues.beta"
      :gyrz="this.accGyrValues.gamma"
      :magx="this.magValues.x"
      :magy="this.magValues.y"
      :magz="this.magValues.z"
    ></planet>
  </canvas-component>
</template>

<script>
  import Planet from './PlanetRenderer.vue';
  import CanvasComponent from './CanvasComponent.vue';

  const oneOverG = 1 / 9.8;
  const oneOverThreeSixty = 1 / 360;

  export default {
    name: 'all',
    data() {
      return {
        accGyrValues: {
          x: 0,
          y: 0,
          z: 0,
          alpha: 0,
          beta: 0,
          gamma: 0,
        },
        magValues: {
          x: 0, 
          y: 0,
          z: 0,
        },
      };
    },
    components: {
      planet: Planet,
      'canvas-component': CanvasComponent,
    },
    methods: {
    },
    mounted() {
      this.intervalId = setInterval(() => {
        this.accGyrValues = {
          x: this.$store.state.accGyrValues.x * -1 * oneOverG,
          y: this.$store.state.accGyrValues.y * -1 * oneOverG,
          z: this.$store.state.accGyrValues.z * -0.5 * oneOverG,
          alpha: this.$store.state.accGyrValues.alpha * oneOverThreeSixty,
          beta: this.$store.state.accGyrValues.beta * oneOverThreeSixty,
          gamma: this.$store.state.accGyrValues.gamma * -0.5 * oneOverThreeSixty,
        };

        this.magValues = {
          x: this.$store.state.normalizedMagValues.x,
          y: this.$store.state.normalizedMagValues.y,
          z: this.$store.state.normalizedMagValues.z,
        };
      }, 100);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  };
</script>