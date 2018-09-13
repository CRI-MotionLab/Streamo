<template>
  <canvas-component>
    <gizmo
      :x="this.gyrValues.x"
      :y="this.gyrValues.y"
      :z="this.gyrValues.z"
    ></gizmo>
  </canvas-component>
</template>

<script>
  import Gizmo from './GizmoRenderer.vue';
  import CanvasComponent from './CanvasComponent.vue';

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
      setInterval(() => {
        this.gyrValues = {
          x: this.$store.state.accGyrValues.alpha,
          y: this.$store.state.accGyrValues.beta,
          z: this.$store.state.accGyrValues.gamma,
        };
      }, 50);
    },
  };
</script>