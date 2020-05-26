import Vue from 'vue'
import App from '../App.vue'

export class Skin {
  player;
  constructor(player) {
    this.player = player
  }
  render() {
    Vue.config.productionTip = false
    new Vue({
      render: h => h(App),
    }).$mount(this.player)
  }
}