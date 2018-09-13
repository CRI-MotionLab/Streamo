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
          x: this.$store.state.accGyrValues.x,
          y: this.$store.state.accGyrValues.y,
          z: this.$store.state.accGyrValues.z,
        };
      }, 50);
    },
  };
</script>