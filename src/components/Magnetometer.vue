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
      // todo : enable reset magnetometer auto-calibration
    },
    mounted() {
      setInterval(() => {
        [ 'x', 'y', 'z' ].forEach((c) => {
          const val = this.$store.state.magValues[c];
          const range = this.$store.state.magRanges[c];

          if (val < range.min) {
            range.min = val;
            // this.$store.commit('updateMagRanges', { `${c}`: { min: val }});
          }

          if (val > range.max) {
            range.max = val;
            // this.$store.commit('updateMagRanges', { `${c}`: { max: val }});
          }

          if (range.min !== range.max) {
            this.magValues[c] = ((val - range.min) / (range.max - range.min)) * 2 - 1
          }

          const r = {};
          r[c] = { min: range.min, max: range.max };
          this.$store.commit('updateMagRanges', r);
        });

        // this.magValues = {
        //   x: this.$store.state.magValues.x,
        //   y: this.$store.state.magValues.y,
        //   z: this.$store.state.magValues.z,
        // };
      }, 50);
    },
  };
</script>