<template>
  <canvas-component>
    <gizmo
      :name="'gyroscope'"
      :x="this.gyrValues.x"
      :y="this.gyrValues.y"
      :z="this.gyrValues.z"
    ></gizmo>
  </canvas-component>
</template>

<script>
  import Gizmo from './GizmoRenderer.vue';
  import CanvasComponent from './CanvasComponent.vue';

  const oneOverThreeSixty = 1 / 360;

  export default {
    name: 'gyroscope',
    data() {
      return {
        gyrValues: {
          x: 0,
          y: 0,
          z: 0,
        },
      };
    },
    components: {
      gizmo: Gizmo,
      'canvas-component': CanvasComponent,
    },
    methods: {

    },
    mounted() {
      this.intervalId = setInterval(() => {
        this.gyrValues = {
          x: this.$store.state.accGyrValues.alpha * oneOverThreeSixty,
          y: this.$store.state.accGyrValues.beta * oneOverThreeSixty,
          z: this.$store.state.accGyrValues.gamma * -0.5 * oneOverThreeSixty,
        };
      }, 50);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  };
</script>