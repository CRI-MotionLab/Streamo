<template>
  <div id="lightbox" :class="showLightBox ? 'on' : ''">
    <div id="lightbox-contents">
      <img id="movuino-icon">
      <div>
        <button v-on:click="onClick">
          GO
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        showLightBox: true,
      };
    },
    methods: {
      onClick() {
        this.showLightBox = false;
      },
    },
  };
</script>