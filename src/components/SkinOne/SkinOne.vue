<template>
  <div @mouseenter="mouseOverIn()" @mouseleave="mouseOverOut()">
    <div class="container" v-if="loaded">
      <div v-if="!inPlaying || isHover">
        <middleButtons
          :inPlaying="inPlaying"
          @playingEvent="managePlay($event)"
          @go="go($event)"
        />
        <div class="slider">
          <vue-slider
            v-model="position"
            v-bind="options"
            @change="change($event)"
          ></vue-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./SkinOne.js"></script>

<style scoped lang="scss">
.container {
  padding: 2px;
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
  top: 0;
  .slider {
    position: absolute;
    bottom: 12px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    z-index: 1000;
  }
}
</style>
