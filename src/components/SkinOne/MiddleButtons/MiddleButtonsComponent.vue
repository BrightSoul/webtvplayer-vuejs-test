<template>
  <div class="container">
    <i class="fa fa-undo-alt small" @click="go(-10)"></i>
    <i
      class="fa fa-play"
      aria-hidden="true"
      v-if="!inPlaying"
      @click="play()"
    ></i>
    <i
      class="fa fa-pause"
      aria-hidden="true"
      v-if="inPlaying"
      @click="pause()"
    ></i>
    <i class="fa fa-undo-alt small reverse" @click="go(10)"></i>
  </div>
</template>

<script src="./MiddleButtons.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import 'MiddleButtons.scss';
</style>
