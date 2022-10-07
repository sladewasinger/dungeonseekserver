<template>
  <div id="gameContainer"></div>
</template>

<script>
import { Engine } from '../js/Engine.js';

export default {
  name: 'Game',
  data() {
    return {
      winner: false
    }
  },
  methods: {
    onWin() {
      this.winner = true;
    }
  },
  mounted() {
    const engine = new Engine(this.onWin);
    engine.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#gameContainer {
  /* pointer-events: none; */
  image-rendering: pixelated;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
</style>
