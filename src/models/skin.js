/* eslint-disable no-unused-vars */
import Vue from 'vue';
import SkinOne from '../components/SkinOne/SkinOne.vue';

//Custom skin
export default function Skin() {
  //Just expose the render and (optionally) the destroy methods
  Object.defineProperty(this, 'render', {
    writable: false,
    configurable: false,
    value: render,
  });
  Object.defineProperty(this, 'destroy', {
    writable: false,
    configurable: false,
    value: destroy,
  });

  async function render() {
    const player = this; //this is a WebTvPlayer, documented here: https://api.civicam.it/v1/embed/#custom-skins
    //this might change in the future as it might be best to pass the player instance as an argument to the render method
    const skinElement = document.createElement('div');
    player.container.appendChild(skinElement);
    new Vue({
      el: skinElement,
      render: (h) => h(SkinOne, { props: { webTvPlayer: player } }),
    });
  }

  function destroy() {
    const player = this;
    console.log('destroy has been invoked');
    //Any cleanup here
    player.container.innerHTML = '';
    //No need to explicitly unsubscribe events: the player object is going to be destroyed anyway.
  }
}
