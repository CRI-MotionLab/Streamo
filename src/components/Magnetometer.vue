<template>
  <canvas-component>
    <gizmo
      :name="'magnetometer'"
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
      // todo : enable reset magnetometer auto-calibration
      // update >>> this is done from store : this.$store.dispatch('resetAutoMagCalibration')
      // maybe it would make more sense to trig reset from here ...
    },
    mounted() {
      this.intervalId = setInterval(() => {
        this.magValues = {
          x: this.$store.state.normalizedMagValues.x,
          y: this.$store.state.normalizedMagValues.y,
          z: this.$store.state.normalizedMagValues.z,
        };
      }, 50);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  };
</script>