import MiddleButtons from './MiddleButtons/MiddleButtonsComponent';
import VueSlider from 'vue-slider-component';
import VueSliderOptions from './Options/VueSliderOptions';
import 'vue-slider-component/theme/default.css';

class SkinOne {
  isHover = false;
  inPlaying = false;
  needToLeave = false;
  loaded = false;
  position = 0;
  options = VueSliderOptions.default;

  mouseOverIn() {
    this.isHover = true;
  }

  mouseOverOut() {
    this.isHover = false;
    this.needToLeave = false;
  }

  managePlay(inPlaying) {
    this.inPlaying = inPlaying;
    if (inPlaying) {
      this.webTvPlayer.play();
      this.needToLeave = true;
    } else {
      this.webTvPlayer.pause();
    }
  }

  go(qta) {
    this.webTvPlayer.position += qta;
  }

  getPosition() {
    return this.webTvPlayer?.position || 0;
  }

  change(n) {
    this.webTvPlayer.position = n;
  }

  onMounted() {
    this.webTvPlayer.on('position', position => {
      this.position = position;
    });
  
    this.webTvPlayer.on('load', () => {
      this.options.max = Math.floor(this.webTvPlayer.duration);
      this.loaded = true;
    });
  }

  static create() {
    return new SkinOne();
  }
}

export default {
  name: SkinOne.name,
  data: SkinOne.create,
  components: { MiddleButtons, VueSlider },
  props: { webTvPlayer: Object },
  mounted: SkinOne.prototype.onMounted,
  //SkinOne.prototype, y u not iterable
  methods: Object.getOwnPropertyNames(SkinOne.prototype).reduce((methods, name) => (methods[name] = SkinOne.prototype[name], methods), {})
};