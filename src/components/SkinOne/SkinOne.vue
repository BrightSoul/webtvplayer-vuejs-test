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
@import 'SkinOne.scss';
</style>
