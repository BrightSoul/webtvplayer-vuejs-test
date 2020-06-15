
<template>
  <div class="container">
    <i class="fa fa-undo-alt small" @click="go(-10)"></i>
    <i class="fa fa-play" aria-hidden="true" v-if="!inPlaying" @click="play()"></i>
    <i class="fa fa-pause" aria-hidden="true" v-if="inPlaying" @click="pause()"></i>
    <i class="fa fa-undo-alt small reverse" @click="go(10)"></i>
  </div>
</template>

<script src="./MiddleButtons.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  i {
    font-size: 92px;
    color: #ffffffb5;
    cursor: pointer;
    &:hover {
      color: #f0f8ff
    }
  }
  .small {
    margin: 0 42px;
    font-size: 40px;
  }
  .reverse {
    -webkit-transform: scaleX(-1);
    -moz-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    transform: scaleX(-1);
    filter: FlipH;
    -ms-filter: "FlipH";
  }

</style>
