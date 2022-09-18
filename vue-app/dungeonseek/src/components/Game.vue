<template>
  <div id="gameContainer"></div>
</template>

<script>
import { init as GameInit } from '../js/Game.js';

export default {
  name: 'Game',
  mounted() {
    GameInit();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#gameContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  /* pointer-events: none; */
  image-rendering: pixelated;
  text-align: center;
}
</style>
