<template>
  <canvas-component>
    <gizmo
      :x="this.accValues.x"
      :y="this.accValues.y"
      :z="this.accValues.z"
    ></gizmo>
  </canvas-component>
</template>

<script>
  import Gizmo from './GizmoRenderer.vue';
  import CanvasComponent from './CanvasComponent.vue';

  const oneOverG = 1 / 9.8;

  export default {
    name: 'accelerometer',
    data() {
      return {
        accValues: {
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
      setInterval(() => {
        this.accValues = {
          x: this.$store.state.accGyrValues.x * -1 * oneOverG,
          y: this.$store.state.accGyrValues.y * -1 * oneOverG,
          z: this.$store.state.accGyrValues.z * -0.5 * oneOverG,
        };
      }, 50);
    },
  };
</script>