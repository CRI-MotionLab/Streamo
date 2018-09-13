<template>
  <canvas-component>
    <gizmo
      :x="this.magValues.x"
      :y="this.magValues.y"
      :z="this.magValues.z"
    ></gizmo>
  </canvas-component>
</template>

<script>
  import Gizmo from './GizmoRenderer.vue';
  import CanvasComponent from './CanvasComponent.vue';

  export default {
    name: 'magnetometer',
    data() {
      return {
        magValues: {
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
        this.magValues = {
          x: this.$store.state.magValues.alpha,
          y: this.$store.state.magValues.beta,
          z: this.$store.state.magValues.gamma,
        };
      }, 50);
    },
  };
</script>